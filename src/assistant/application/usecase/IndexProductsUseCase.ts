import { GeminiClient } from "../../infrastructure/gemini/GeminiClient.js";
import { EmbeddingRepository } from "../../infrastructure/pgvector/EmbeddingRepository.js";
import { InventoryClient } from "../../infrastructure/inventory/InventoryClient.js";
import type { Product } from "../../domain/model/types.js";

interface CatalogNames {
  categories: Map<number, string>;
  units: Map<number, string>;
  suppliers: Map<number, string>;
}

function productToChunk(p: Product, catalogs: CatalogNames): string {
  const category = catalogs.categories.get(p.categoryId) ?? `ID ${p.categoryId}`;
  const unit = catalogs.units.get(p.unitId) ?? `ID ${p.unitId}`;
  const supplier = catalogs.suppliers.get(p.supplierId) ?? `ID ${p.supplierId}`;

  return `
${p.name} (SKU: ${p.sku})
Descripción: ${p.description}
Precio compra: $${p.purchasePrice.toLocaleString("es-CO")} | Precio venta: $${p.salePrice.toLocaleString("es-CO")}
Categoría: ${category} | Unidad: ${unit} | Proveedor: ${supplier} | Activo: ${p.active ? "sí" : "no"}
  `.trim();
}

export class IndexProductsUseCase {
  private readonly gemini = new GeminiClient();
  private readonly repository = new EmbeddingRepository();
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