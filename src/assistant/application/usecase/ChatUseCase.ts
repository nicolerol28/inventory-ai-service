import { inventoryAgent } from "../../infrastructure/mastra/agent.js";

export class ChatUseCase {
  async execute(question: string): Promise<string> {
    const response = await inventoryAgent.generate(question, {
      modelSettings: {
        maxOutputTokens: 4096,
      },
    });
    return response.text;
  }
} 