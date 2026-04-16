import { ConversationRepositoryImpl } from "../../infrastructure/repository/ConversationRepositoryImpl.js";
import type { ConversationRepository } from "../../domain/repository/ConversationRepository.js";
import type {
  Conversation,
  Message,
  ConversationWithLastMessage,
} from "../../domain/model/conversation.js";

const repo: ConversationRepository = new ConversationRepositoryImpl();

export class ListConversationsUseCase {
  async execute(userId: number): Promise<ConversationWithLastMessage[]> {
    return repo.findByUserId(userId);
  }
}

export class CreateConversationUseCase {
  async execute(userId: number, title?: string): Promise<Conversation> {
    return repo.create(userId, title);
  }
}

export class GetMessagesUseCase {
  async execute(
    conversationId: string,
    userId: number
  ): Promise<{ messages: Message[]; conversation: Conversation } | null> {
    const conversation = await repo.findById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      return null;
    }
    const messages = await repo.getMessages(conversationId);
    return { messages, conversation };
  }
}

export class DeleteConversationUseCase {
  async execute(conversationId: string, userId: number): Promise<boolean> {
    const conversation = await repo.findById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      return false;
    }
    return repo.deactivate(conversationId);
  }
}

export class UpdateConversationTitleUseCase {
  async execute(
    conversationId: string,
    userId: number,
    title: string
  ): Promise<boolean> {
    const conversation = await repo.findById(conversationId);
    if (!conversation || conversation.userId !== userId) {
      return false;
    }
    await repo.updateTitle(conversationId, title);
    return true;
  }
}