export class GeminiClient {
  private readonly embeddingModelName = "models/gemini-embedding-001";

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

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "(unreadable body)");
      throw new Error(
        `Gemini embedding API error ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json() as { embedding: { values: number[] } };
    return data.embedding.values;
  }
}
