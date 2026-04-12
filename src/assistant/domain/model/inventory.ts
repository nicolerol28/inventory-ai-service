
// Response types — match the Java backend DTOs exactly

export interface StockResponse {
  id: number;
  productId: number;
  productName: string;
  warehouseId: number;
  quantity: number;
  minQuantity: number;
  belowMinimum: boolean;
  updatedAt: string;
}

export interface InventoryMovementResponse {
  id: number;
  productId: number;
  warehouseId: number;
  supplierId: number;
  registeredBy: number;
  movementType: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  comment: string;
  createdAt: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface UnitResponse {
  id: number;
  name: string;
  symbol: string;
  active: boolean;
  createdAt: string;
}

export interface WarehouseResponse {
  id: number;
  name: string;
  location: string;
  active: boolean;
  createdAt: string;
}

export interface SupplierResponse {
  id: number;
  name: string;
  contact: string;
  phone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}


// Generic paginated response — matches PageResponse<T> from Java

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}