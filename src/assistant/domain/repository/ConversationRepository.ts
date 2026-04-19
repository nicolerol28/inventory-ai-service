import type {
  Conversation,
  Message,
  ConversationWithLastMessage,
} from "../model/conversation.js";

export interface ConversationRepository {
  create(userId: number, title?: string): Promise<Conversation>;
  createSeed(id: string, userId: number, title: string): Promise<Conversation>;
  findByUserId(userId: number): Promise<ConversationWithLastMessage[]>;
  findById(id: string): Promise<Conversation | null>;
  updateTitle(id: string, title: string): Promise<void>;
  deactivate(id: string): Promise<boolean>;
  deactivateAllNonSeed(): Promise<number>;
  reactivateSeed(id: string): Promise<void>;
  deleteMessagesBySeedConversation(conversationId: string): Promise<void>;
  addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<Message>;
  getMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
}