import type { SearchResult } from "../../domain/model/types.js";
import type { EmbeddingRepository } from "../../domain/repository/EmbeddingRepository.js";
import { pool } from "../database/db.js";

export class EmbeddingRepositoryImpl implements EmbeddingRepository {
  async upsert(productId: number, content: string, embedding: number[]): Promise<void> {
    await pool.query(
      `INSERT INTO product_embeddings (product_id, content, embedding)
       VALUES ($1, $2, $3::vector)
       ON CONFLICT (product_id)
       DO UPDATE SET content = $2, embedding = $3::vector, updated_at = NOW()`,
      [productId, content, JSON.stringify(embedding)]
    );
  }

  async search(embedding: number[], limit = 3): Promise<SearchResult[]> {
    const result = await pool.query(
      `SELECT product_id, content,
              1 - (embedding <=> $1::vector) AS similarity
       FROM product_embeddings
       WHERE 1 - (embedding <=> $1::vector) > 0.6
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(embedding), limit]
    );

    return result.rows.map((row) => ({
      productId: row.product_id,
      content: row.content,
      similarity: parseFloat(row.similarity),
    }));
  }

  async deleteOrphans(activeProductIds: number[]): Promise<void> {
    if (activeProductIds.length === 0) return;
    await pool.query(
      `DELETE FROM product_embeddings
       WHERE product_id != ALL($1)`,
      [activeProductIds]
    );
  }

  async deleteByProductId(productId: number): Promise<void> {
    await pool.query(
      `DELETE FROM product_embeddings WHERE product_id = $1`,
      [productId]
    );
  }
}
