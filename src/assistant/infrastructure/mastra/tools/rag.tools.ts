import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { GeminiClient } from "../../gemini/GeminiClient.js";
import { EmbeddingRepositoryImpl } from "../../repository/EmbeddingRepositoryImpl.js";
import type { EmbeddingRepository } from "../../../domain/repository/EmbeddingRepository.js";

let gemini: GeminiClient;
let repository: EmbeddingRepository;

function getInstances() {
  if (!gemini) gemini = new GeminiClient();
  if (!repository) repository = new EmbeddingRepositoryImpl();
  return { gemini, repository };
}

export const semanticSearchTool = createTool({
  id: "semantic-search",
  description:
    "Search products by meaning, concept, or intended use using AI embeddings. " +
    "Use this for CONCEPTUAL questions: 'what do I have for cooking', " +
    "'cleaning products', 'something for headaches', 'ingredients for a cake'. " +
    "Do NOT use this for exact searches like 'find product named Arroz' or " +
    "'products in category 2' — use the search-products tool for those instead.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The conceptual search query in natural language"),
  }),
  execute: async (inputData) => {
    try {
      const { gemini, repository } = getInstances();
      const embedding = await gemini.generateEmbedding(inputData.query);
      const results = await repository.search(embedding, 5);

      if (results.length === 0) {
        return { results: [], message: "No relevant products found." };
      }

      return { results };
    } catch (error) {
      console.error("semantic-search error:", error);
      throw error;
    }
  },
});