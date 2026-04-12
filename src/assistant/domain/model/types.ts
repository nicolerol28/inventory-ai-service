export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  unitId: number;
  categoryId: number;
  supplierId: number;
  purchasePrice: number;
  salePrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
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