import crypto from "node:crypto";
import { mastra } from "../../../mastra/index.js";
import type {
  Task,
  MessageSendParams,
} from "../../domain/model/a2a.js";

export class A2AUseCase {
  async handleMessageSend(params: MessageSendParams): Promise<Task> {
    const taskId = params.id ?? crypto.randomUUID();
    const now = new Date().toISOString();

    // Extract the text from the incoming A2A message
    const userText = params.message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n");

    if (!userText.trim()) {
      return {
        id: taskId,
        status: {
          state: "failed",
          message: {
            role: "agent",
            parts: [{ type: "text", text: "El mensaje no contiene texto." }],
          },
          timestamp: now,
        },
      };
    }

    try {
      const agent = mastra.getAgent("inventoryAgent");

      const result = await agent.generate(userText, {
        memory: {
          resource: "a2a",
          thread: `a2a-${taskId}`,
        },
        modelSettings: { maxOutputTokens: 4096 },
      });

      const responseText =
        typeof result.text === "string" ? result.text : String(result.text);

      return {
        id: taskId,
        status: {
          state: "completed",
          message: {
            role: "agent",
            parts: [{ type: "text", text: responseText }],
          },
          timestamp: now,
        },
        artifacts: [
          {
            name: "agent-response",
            description: "Respuesta del inventory agent",
            parts: [{ type: "text", text: responseText }],
          },
        ],
      };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error desconocido";

      return {
        id: taskId,
        status: {
          state: "failed",
          message: {
            role: "agent",
            parts: [
              { type: "text", text: `Error procesando la solicitud: ${errorMsg}` },
            ],
          },
          timestamp: now,
        },
      };
    }
  }
}