import { Hono } from "hono";
import { ChatUseCase } from "../../application/usecase/ChatUseCase.js";
import { IndexProductsUseCase } from "../../application/usecase/IndexProductsUseCase.js";
import type { ChatRequest, ChatResponse, IndexResponse } from "../dto/types.js";

const chatUseCase = new ChatUseCase();
const indexUseCase = new IndexProductsUseCase();

export const assistantRouter = new Hono();

assistantRouter.post("/chat", async (c) => {
  const body = await c.req.json<ChatRequest>();

  if (!body.question || body.question.trim() === "") {
    return c.json({ error: "La pregunta no puede estar vacía" }, 400);
  }

  const answer = await chatUseCase.execute(body.question);
  return c.json<ChatResponse>({ answer });
});

assistantRouter.post("/index", async (c) => {
  const result = await indexUseCase.execute();
  return c.json<IndexResponse>({
    message: "Indexación completada",
    indexed: result.indexed,
    skipped: result.skipped,
  });
});