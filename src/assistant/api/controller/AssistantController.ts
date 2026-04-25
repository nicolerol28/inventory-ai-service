import { Hono } from "hono";
import { ChatUseCase } from "../../application/usecase/ChatUseCase.js";
import { IndexProductsUseCase } from "../../application/usecase/IndexProductsUseCase.js";
import { HandleWebhookUseCase } from "../../application/usecase/HandleWebhookUseCase.js";
import type { ChatRequest, ChatResponse, IndexResponse } from "../dto/types.js";
import type { WebhookPayload } from "../../application/usecase/HandleWebhookUseCase.js";
import { authMiddleware } from "../../../shared/infrastructure/auth/authMiddleware.js";
import type { AppEnv } from "../../../shared/infrastructure/auth/types.js";
import { rateLimiter } from "../../infrastructure/ratelimit/RateLimiter.js";

const chatUseCase = new ChatUseCase();
const indexUseCase = new IndexProductsUseCase();
const webhookUseCase = new HandleWebhookUseCase();
const WEBHOOK_SECRET = process.env["WEBHOOK_SECRET"];

export const assistantRouter = new Hono<AppEnv>();

assistantRouter.post("/chat", authMiddleware, async (c) => {
  const userId = c.get("userId");

  // Rate limiting
  const limit = rateLimiter.check(userId);
  c.header("X-RateLimit-Remaining", String(limit.remaining));
  if (!limit.allowed) {
    c.header("Retry-After", String(Math.ceil(limit.retryAfterMs / 1000)));
    return c.json(
      { error: "Rate limit exceeded. Please wait before sending another message." },
      429
    );
  }

  const body = await c.req.json<ChatRequest>();
  const question = body.question?.trim() ?? "";

  if (!question) {
    return c.json({ error: "La pregunta no puede estar vacía" }, 400);
  }

  if (question.length > 4000) {
    return c.json({ error: "La pregunta es demasiado larga (máximo 4000 caracteres)" }, 400);
  }

  const threadId = body.threadId || crypto.randomUUID();

  try {
    const answer = await chatUseCase.execute(
      question,
      userId,
      threadId,
      body.conversationId
    );
    c.header("Content-Type", "application/json; charset=utf-8");
    return c.json<ChatResponse>({ answer, threadId, conversationId: body.conversationId });
  } catch (error) {
    console.error("[/chat] Error:", error);
    return c.json({ error: "Error al procesar la consulta" }, 500);
  }
});

assistantRouter.post("/index", authMiddleware, async (c) => {
  try {
    const result = await indexUseCase.execute();
    c.header("Content-Type", "application/json; charset=utf-8");
    return c.json<IndexResponse>({
      message: "Indexación completada",
      indexed: result.indexed,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("[/index] Error:", error);
    return c.json({ error: "Error al indexar productos" }, 500);
  }
});

assistantRouter.post("/webhook", async (c) => {
  const secret = c.req.header("X-Webhook-Secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<WebhookPayload>();
  if (!body.event || !body.productId) {
    return c.json({ error: "Missing event or productId" }, 400);
  }

  const validEvents = ["PRODUCT_CREATED", "PRODUCT_UPDATED", "PRODUCT_DELETED"];
  if (!validEvents.includes(body.event)) {
    return c.json({ error: `Invalid event: ${body.event}` }, 400);
  }

  try {
    const result = await webhookUseCase.execute(body);
    return c.json(result);
  } catch (error) {
    console.error("[/webhook] Error:", error);
    return c.json({ error: "Error al procesar el webhook" }, 500);
  }
});