export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  categoryId: number;
  supplierId: number;
  active: boolean;
}

export interface Fragment {
  productId: number;
  content: string;
  embedding: number[];
}

export interface SearchResult {
  productId: number;
  content: string;
  similarity: number;
}