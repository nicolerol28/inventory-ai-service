import dotenv from "dotenv";
dotenv.config();

import type { Product } from "../../domain/model/types.js";

const BASE_URL = process.env["INVENTORY_API_URL"]!;
const EMAIL = process.env["INVENTORY_DEMO_EMAIL"]!;
const PASSWORD = process.env["INVENTORY_DEMO_PASSWORD"]!;

let token: string | null = null;

async function login(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) throw new Error(`Login failed: ${res.status}`);

  const data = await res.json() as { token: string };
  token = data.token;
}

export class InventoryClient {
  async getProducts(): Promise<Product[]> {
    if (!token) await login();

    const res = await fetch(`${BASE_URL}/api/v1/products?page=0&size=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Error obteniendo productos: ${res.status}`);

    const data = await res.json() as { content?: Product[] };
    return data.content ?? [];
  }
}