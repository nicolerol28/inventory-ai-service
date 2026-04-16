import { GeminiClient } from "../../infrastructure/gemini/GeminiClient.js";
import { EmbeddingRepositoryImpl } from "../../infrastructure/repository/EmbeddingRepositoryImpl.js";
import { InventoryClient } from "../../infrastructure/inventory/InventoryClient.js";
import { productToChunk } from "../../domain/model/product-chunk.js";
import type { CatalogNames } from "../../domain/model/product-chunk.js";
import type { EmbeddingRepository } from "../../domain/repository/EmbeddingRepository.js";

export class IndexProductsUseCase {
  private readonly gemini = new GeminiClient();
  private readonly repository: EmbeddingRepository = new EmbeddingRepositoryImpl();
  private readonly inventory = new InventoryClient();

  async execute(): Promise<{ indexed: number; skipped: number }> {
    // 1. Traer productos y catálogos en paralelo
    const [productsResponse, categories, units, suppliers] = await Promise.all([
      this.inventory.getProducts({ page: 0, size: 100 }),
      this.inventory.getCategories(),
      this.inventory.getUnits(),
      this.inventory.getSuppliers(),
    ]);

    const products = productsResponse.content;
    const activeIds = products.map((p) => p.id);

    // 2. Construir mapas de ID → nombre
    const catalogs: CatalogNames = {
      categories: new Map(categories.map((c) => [c.id, c.name])),
      units: new Map(units.map((u) => [u.id, u.name])),
      suppliers: new Map(suppliers.map((s) => [s.id, s.name])),
    };

    // 3. Limpiar embeddings huérfanos
    await this.repository.deleteOrphans(activeIds);

    // 4. Indexar cada producto
    let indexed = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const content = productToChunk(product, catalogs);
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