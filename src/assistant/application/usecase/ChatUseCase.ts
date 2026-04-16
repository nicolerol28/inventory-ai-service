import { inventoryAgent } from "../../infrastructure/mastra/agent.js";
import { ConversationRepositoryImpl } from "../../infrastructure/repository/ConversationRepositoryImpl.js";
import type { ConversationRepository } from "../../domain/repository/ConversationRepository.js";

const repo: ConversationRepository = new ConversationRepositoryImpl();

export class ChatUseCase {
  async execute(
    question: string,
    userId: string,
    threadId: string,
    conversationId?: string
  ): Promise<string> {
    if (conversationId) {
      await repo.addMessage(conversationId, "user", question);
    }

    const response = await inventoryAgent.generate(question, {
      memory: {
        resource: userId,
        thread: threadId,
      },
      modelSettings: {
        maxOutputTokens: 4096,
      },
    });

    if (conversationId) {
      await repo.addMessage(conversationId, "assistant", response.text);
    }

    return response.text;
  }
}