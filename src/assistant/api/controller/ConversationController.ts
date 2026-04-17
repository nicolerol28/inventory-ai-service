import { Hono } from "hono";
import {
  ListConversationsUseCase,
  CreateConversationUseCase,
  GetMessagesUseCase,
  DeleteConversationUseCase,
  UpdateConversationTitleUseCase,
} from "../../application/usecase/ConversationUseCases.js";
import { authMiddleware } from "../../infrastructure/auth/authMiddleware.js";
import type { AppEnv } from "../../infrastructure/auth/types.js";
import type {
  CreateConversationRequest,
  UpdateConversationRequest,
} from "../dto/types.js";

const listUseCase = new ListConversationsUseCase();
const createUseCase = new CreateConversationUseCase();
const getMessagesUseCase = new GetMessagesUseCase();
const deleteUseCase = new DeleteConversationUseCase();
const updateTitleUseCase = new UpdateConversationTitleUseCase();

export const conversationRouter = new Hono<AppEnv>();

conversationRouter.use("*", authMiddleware);

conversationRouter.get("/", async (c) => {
  const userId = Number(c.get("userId"));
  const conversations = await listUseCase.execute(userId);
  return c.json(conversations);
});

conversationRouter.post("/", async (c) => {
  const userId = Number(c.get("userId"));
  const body = await c.req.json<CreateConversationRequest>().catch(() => ({} as CreateConversationRequest));
  const conversation = await createUseCase.execute(userId, body.title);
  return c.json(conversation, 201);
});

conversationRouter.get("/:id/messages", async (c) => {
  const userId = Number(c.get("userId"));
  const conversationId = c.req.param("id");
  const result = await getMessagesUseCase.execute(conversationId, userId);

  if (!result) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  return c.json(result);
});

conversationRouter.patch("/:id", async (c) => {
  const userId = Number(c.get("userId"));
  const conversationId = c.req.param("id");
  const body = await c.req.json<UpdateConversationRequest>();

  if (!body.title || body.title.trim() === "") {
    return c.json({ error: "Title is required" }, 400);
  }

  const updated = await updateTitleUseCase.execute(
    conversationId,
    userId,
    body.title
  );

  if (!updated) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  return c.json({ message: "Title updated" });
});

conversationRouter.delete("/:id", async (c) => {
  const userId = Number(c.get("userId"));
  const conversationId = c.req.param("id");
  const deleted = await deleteUseCase.execute(conversationId, userId);

  if (!deleted) {
    return c.json(
      { error: "Conversation not found" },
      404
    );
  }

  conversationRouter.post("/reset-seeds", async (c) => {
  const { resetConversations } = await import("../../infrastructure/seed/SeedService.js");
  await resetConversations();
  return c.json({ message: "Seeds reset complete" });
});

  return c.json({ message: "Conversation deleted" });
});