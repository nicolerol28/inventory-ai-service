import type { Product } from "./types.js";

export interface CatalogNames {
  categories: Map<number, string>;
  units: Map<number, string>;
  suppliers: Map<number, string>;
}

export function productToChunk(product: Product, catalogs: CatalogNames): string {
  const category = catalogs.categories.get(product.categoryId) ?? `ID ${product.categoryId}`;
  const unit = catalogs.units.get(product.unitId) ?? `ID ${product.unitId}`;
  const supplier = catalogs.suppliers.get(product.supplierId) ?? `ID ${product.supplierId}`;

  return `
${product.name} (SKU: ${product.sku})
Descripción: ${product.description}
Precio compra: $${product.purchasePrice.toLocaleString("es-CO")} | Precio venta: $${product.salePrice.toLocaleString("es-CO")}
Categoría: ${category} | Unidad: ${unit} | Proveedor: ${supplier} | Activo: ${product.active ? "sí" : "no"}
  `.trim();
}