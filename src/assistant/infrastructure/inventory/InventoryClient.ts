import type { Product } from "../../domain/model/types.js";
import type {
  StockResponse,
  InventoryMovementResponse,
  CategoryResponse,
  UnitResponse,
  WarehouseResponse,
  SupplierResponse,
  PageResponse,
} from "../../domain/model/inventory.js";

const BASE_URL = process.env["INVENTORY_API_URL"]!;
const EMAIL = process.env["INVENTORY_DEMO_EMAIL"]!;
const PASSWORD = process.env["INVENTORY_DEMO_PASSWORD"]!;

export class InventoryClient {
  private token: string | null = null;


  // Authentication

  private async login(): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    if (!res.ok) throw new Error(`Login failed: ${res.status}`);

    const data = (await res.json()) as { token: string };
    this.token = data.token;
  }

  /**
   * Fetch with automatic token management.
   * - If no token exists, logs in first.
   * - If the request returns 401, re-authenticates and retries once.
   */
  private async authenticatedFetch(path: string): Promise<unknown> {
    if (!this.token) await this.login();

    let res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (res.status === 401) {
      await this.login();
      res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
    }

    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);

    return await res.json();
  }

 
  // Products

  async getProducts(params?: {
    page?: number;
    size?: number;
    name?: string;
    categoryId?: number;
    unitId?: number;
    sortName?: string;
    filterActive?: string;
  }): Promise<PageResponse<Product>> {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 20));
    if (params?.name) query.set("name", params.name);
    if (params?.categoryId) query.set("categoryId", String(params.categoryId));
    if (params?.unitId) query.set("unitId", String(params.unitId));
    if (params?.sortName) query.set("sortName", params.sortName);
    if (params?.filterActive) query.set("filterActive", params.filterActive);

    return (await this.authenticatedFetch(
      `/api/v1/products?${query.toString()}`
    )) as PageResponse<Product>;
  }

  async getProductById(id: number): Promise<Product> {
    return (await this.authenticatedFetch(
      `/api/v1/products/${id}`
    )) as Product;
  }


  // Inventory — Stock

  async getStock(productId: number, warehouseId: number): Promise<StockResponse> {
    return (await this.authenticatedFetch(
      `/api/v1/inventory/stock?productId=${productId}&warehouseId=${warehouseId}`
    )) as StockResponse;
  }

  async getStockByWarehouse(
    warehouseId: number,
    params?: { page?: number; size?: number; productName?: string; sortOrder?: string }
  ): Promise<PageResponse<StockResponse>> {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 20));
    if (params?.productName) query.set("productName", params.productName);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    return (await this.authenticatedFetch(
      `/api/v1/inventory/stock/warehouse/${warehouseId}?${query.toString()}`
    )) as PageResponse<StockResponse>;
  }


  // Inventory — Movements

  async getMovements(
    productId: number,
    warehouseId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<InventoryMovementResponse>> {
    const query = new URLSearchParams();
    query.set("productId", String(productId));
    query.set("warehouseId", String(warehouseId));
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 20));

    return (await this.authenticatedFetch(
      `/api/v1/inventory/movements?${query.toString()}`
    )) as PageResponse<InventoryMovementResponse>;
  }

  async getMovementsByWarehouse(
    warehouseId: number,
    params?: { page?: number; size?: number; movementType?: string }
  ): Promise<PageResponse<InventoryMovementResponse>> {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 20));
    if (params?.movementType) query.set("movementType", params.movementType);

    return (await this.authenticatedFetch(
      `/api/v1/inventory/movements/warehouse/${warehouseId}?${query.toString()}`
    )) as PageResponse<InventoryMovementResponse>;
  }

  async getMovementsByDateRange(
    warehouseId: number,
    from: string,
    to: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<InventoryMovementResponse>> {
    const query = new URLSearchParams();
    query.set("from", from);
    query.set("to", to);
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 20));

    return (await this.authenticatedFetch(
      `/api/v1/inventory/movements/warehouse/${warehouseId}/date-range?${query.toString()}`
    )) as PageResponse<InventoryMovementResponse>;
  }


  // Categories

  async getCategories(): Promise<CategoryResponse[]> {
    return (await this.authenticatedFetch(
      "/api/v1/categories/active"
    )) as CategoryResponse[];
  }

  async getCategoryById(id: number): Promise<CategoryResponse> {
    return (await this.authenticatedFetch(
      `/api/v1/categories/${id}`
    )) as CategoryResponse;
  }


  // Units

  async getUnits(): Promise<UnitResponse[]> {
    return (await this.authenticatedFetch(
      "/api/v1/units/active"
    )) as UnitResponse[];
  }

  async getUnitById(id: number): Promise<UnitResponse> {
    return (await this.authenticatedFetch(
      `/api/v1/units/${id}`
    )) as UnitResponse;
  }


  // Warehouses

  async getWarehouses(): Promise<WarehouseResponse[]> {
    return (await this.authenticatedFetch(
      "/api/v1/warehouses/active"
    )) as WarehouseResponse[];
  }

  async getWarehouseById(id: number): Promise<WarehouseResponse> {
    return (await this.authenticatedFetch(
      `/api/v1/warehouses/${id}`
    )) as WarehouseResponse;
  }


  // Suppliers

  async getSuppliers(): Promise<SupplierResponse[]> {
    return (await this.authenticatedFetch(
      "/api/v1/suppliers/active"
    )) as SupplierResponse[];
  }

  async getSupplierById(id: number): Promise<SupplierResponse> {
    return (await this.authenticatedFetch(
      `/api/v1/suppliers/${id}`
    )) as SupplierResponse;
  }
}