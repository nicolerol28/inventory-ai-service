import { GeminiClient } from "../../infrastructure/gemini/GeminiClient.js";
import { EmbeddingRepository } from "../../infrastructure/pgvector/EmbeddingRepository.js";
import { InventoryClient } from "../../infrastructure/inventory/InventoryClient.js";
import { productToChunk } from "../../domain/model/product-chunk.js";

export type WebhookEvent = "PRODUCT_CREATED" | "PRODUCT_UPDATED" | "PRODUCT_DELETED";

export interface WebhookPayload {
  event: WebhookEvent;
  productId: number;
}

export class HandleWebhookUseCase {
  private readonly gemini = new GeminiClient();
  private readonly repository = new EmbeddingRepository();
  private readonly inventory = new InventoryClient();

  async execute(payload: WebhookPayload): Promise<{ action: string }> {
    const { event, productId } = payload;

    if (event === "PRODUCT_DELETED") {
      await this.repository.deleteByProductId(productId);
      console.log(`Webhook: embedding deleted for product ${productId}`);
      return { action: "deleted" };
    }

    // PRODUCT_CREATED or PRODUCT_UPDATED — fetch product and regenerate embedding
    const [product, categories, units, suppliers] = await Promise.all([
      this.inventory.getProductById(productId),
      this.inventory.getCategories(),
      this.inventory.getUnits(),
      this.inventory.getSuppliers(),
    ]);

    const catalogs = {
      categories: new Map(categories.map((c) => [c.id, c.name])),
      units: new Map(units.map((u) => [u.id, u.name])),
      suppliers: new Map(suppliers.map((s) => [s.id, s.name])),
    };

    const content = productToChunk(product, catalogs);
    const embedding = await this.gemini.generateEmbedding(content);
    await this.repository.upsert(productId, content, embedding);

    const action = event === "PRODUCT_CREATED" ? "created" : "updated";
    console.log(`Webhook: embedding ${action} for product ${productId} (${product.name})`);
    return { action };
  }
}