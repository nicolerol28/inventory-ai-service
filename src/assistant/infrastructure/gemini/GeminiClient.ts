import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiClient {
  private readonly genAI: GoogleGenerativeAI;
  private readonly chatModelName = "gemini-2.5-flash";
  private readonly embeddingModelName = "models/gemini-embedding-001";

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env["GOOGLE_GENERATIVE_AI_API_KEY"]!
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env["GOOGLE_GENERATIVE_AI_API_KEY"]}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.embeddingModelName,
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        }),
      }
    );
    const data = await response.json() as { embedding: { values: number[] } };
    return data.embedding.values;
  }

  async generateResponse(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.chatModelName,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}