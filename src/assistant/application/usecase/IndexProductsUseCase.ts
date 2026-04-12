import { GeminiClient } from "../../infrastructure/gemini/GeminiClient.js";
import { EmbeddingRepository } from "../../infrastructure/pgvector/EmbeddingRepository.js";
import { InventoryClient } from "../../infrastructure/inventory/InventoryClient.js";
import type { Product } from "../../domain/model/types.js";

function productToChunk(p: Product): string {
  return `
${p.name} (SKU: ${p.sku})
Descripción: ${p.description}
Precio compra: $${p.purchasePrice.toLocaleString("es-CO")} | Precio venta: $${p.salePrice.toLocaleString("es-CO")}
Categoría ID: ${p.categoryId} | Proveedor ID: ${p.supplierId} | Activo: ${p.active ? "sí" : "no"}
  `.trim();
}

export class IndexProductsUseCase {
  private readonly gemini = new GeminiClient();
  private readonly repository = new EmbeddingRepository();
  private readonly inventory = new InventoryClient();

  async execute(): Promise<{ indexed: number; skipped: number }> {
    // 1. Traer productos activos del inventario Java
    const response = await this.inventory.getProducts({ page: 0, size: 100 });
    const products = response.content;
    const activeIds = products.map((p) => p.id);

    // 2. Limpiar embeddings huérfanos
    await this.repository.deleteOrphans(activeIds);

    // 3. Indexar cada producto
    let indexed = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const content = productToChunk(product);
        const embedding = await this.gemini.generateEmbedding(content);
        await this.repository.upsert(product.id, content, embedding);
        indexed++;
        console.log(`Indexado: ${product.name}`);
      } catch (error) {
        skipped++;
        console.error(`Error indexando ${product.name}:`, error);
      }
    }

    return { indexed, skipped };
  }
}