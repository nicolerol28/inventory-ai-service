import type { SearchResult } from "../model/types.js";

export interface EmbeddingRepository {
  upsert(productId: number, content: string, embedding: number[]): Promise<void>;
  search(embedding: number[], limit?: number): Promise<SearchResult[]>;
  deleteOrphans(activeProductIds: number[]): Promise<void>;
  deleteByProductId(productId: number): Promise<void>;
}
