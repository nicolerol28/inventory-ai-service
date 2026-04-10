import { GeminiClient } from "../../infrastructure/gemini/GeminiClient.js";
import { EmbeddingRepository } from "../../infrastructure/pgvector/EmbeddingRepository.js";

export class ChatUseCase {
  private readonly gemini = new GeminiClient();
  private readonly repository = new EmbeddingRepository();

  async execute(question: string): Promise<string> {
    // 1. Convertir la pregunta en embedding
    const questionEmbedding = await this.gemini.generateEmbedding(question);

    // 2. Buscar fragmentos más relevantes en pgvector
    const results = await this.repository.search(questionEmbedding, 3);

    if (results.length === 0) {
      return "No encontré información relevante en el inventario para responder tu pregunta.";
    }

    // 3. Construir prompt con contexto
    const context = results.map((r) => r.content).join("\n\n---\n\n");
    const prompt = `
Eres un asistente inteligente de inventario. Tu trabajo es ayudar al usuario a encontrar productos relevantes en el inventario basándote en su pregunta.

Analiza los productos disponibles y responde de forma útil. Si la pregunta es sobre qué productos sirven para una actividad (cocinar, limpiar, trabajar, etc.), identifica cuáles del inventario son relevantes para esa actividad.

PRODUCTOS DISPONIBLES EN EL INVENTARIO:
${context}

PREGUNTA: ${question}

Responde en español de forma clara y útil.
`.trim();

    // 4. Generar respuesta con Gemini
    return await this.gemini.generateResponse(prompt);
  }
}