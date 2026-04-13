import { inventoryAgent } from "../../infrastructure/mastra/agent.js";

export class ChatUseCase {
  async execute(
    question: string,
    userId: string,
    threadId: string,
  ): Promise<string> {
    const response = await inventoryAgent.generate(question, {
      memory: {
        resource: userId,
        thread: threadId,
      },
      modelSettings: {
        maxOutputTokens: 4096,
      },
    });
    return response.text;
  }
}