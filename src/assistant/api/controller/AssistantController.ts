import { Hono } from "hono";
import { ChatUseCase } from "../../application/usecase/ChatUseCase.js";
import { IndexProductsUseCase } from "../../application/usecase/IndexProductsUseCase.js";
import { HandleWebhookUseCase } from "../../application/usecase/HandleWebhookUseCase.js";
import type { ChatRequest, ChatResponse, IndexResponse } from "../dto/types.js";
import type { WebhookPayload } from "../../application/usecase/HandleWebhookUseCase.js";
import { authMiddleware } from "../../infrastructure/auth/authMiddleware.js";
import type { AppEnv } from "../../infrastructure/auth/types.js"; 

const chatUseCase = new ChatUseCase();
const indexUseCase = new IndexProductsUseCase();
const webhookUseCase = new HandleWebhookUseCase();
const WEBHOOK_SECRET = process.env["WEBHOOK_SECRET"];

export const assistantRouter = new Hono<AppEnv>();

assistantRouter.post("/chat", authMiddleware, async (c) => {
  const body = await c.req.json<ChatRequest>();

  if (!body.question || body.question.trim() === "") {
    return c.json({ error: "La pregunta no puede estar vacía" }, 400);
  }

  const userId = c.get("userId");
  const threadId = body.threadId || crypto.randomUUID();

  const answer = await chatUseCase.execute(body.question, userId, threadId);
  c.header("Content-Type", "application/json; charset=utf-8");
  return c.json<ChatResponse>({ answer, threadId });
});

assistantRouter.post("/index", async (c) => {
  const result = await indexUseCase.execute();
  c.header("Content-Type", "application/json; charset=utf-8");
  return c.json<IndexResponse>({
    message: "Indexación completada",
    indexed: result.indexed,
    skipped: result.skipped,
  });
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

  const result = await webhookUseCase.execute(body);
  return c.json(result);
});