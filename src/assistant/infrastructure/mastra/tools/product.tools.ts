import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { inventoryClient } from "./shared.js";

// Product by ID

export const getProductByIdTool = createTool({
  id: "get-product-by-id",
  description:
    "Get full details of a specific product by its ID, including name, description, " +
    "SKU, prices, category, supplier, unit, and whether it is active. " +
    "Use this when you already have a product ID (e.g. from stock or movement results) " +
    "and need the product's complete information.",
  inputSchema: z.object({
    productId: z.number().describe("The product ID to look up"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getProductById(inputData.productId);
  },
});

// Product search with structured filters

export const searchProductsTool = createTool({
  id: "search-products",
  description:
    "Search products using structured filters like name, category, or unit. " +
    "Returns a paginated list of products matching the criteria. " +
    "Use this for EXACT searches: 'products in category 2', 'find product named Arroz', " +
    "'how many active products are there', 'list all products'. " +
    "Do NOT use this for conceptual questions like 'what do I have for cooking' — " +
    "use the semantic-search tool for those instead.",
  inputSchema: z.object({
    name: z
      .string()
      .optional()
      .describe("Filter by product name (partial match)"),
    categoryId: z
      .number()
      .optional()
      .describe("Filter by category ID — use get-categories first to find the ID"),
    unitId: z
      .number()
      .optional()
      .describe("Filter by unit ID — use get-units first to find the ID"),
    filterActive: z
      .enum(["all", "active", "inactive"])
      .optional()
      .describe("Filter by active status, defaults to 'all'"),
    sortName: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort by name, defaults to 'asc'"),
    page: z.number().optional().describe("Page number, defaults to 0"),
    size: z.number().optional().describe("Page size, defaults to 20"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getProducts(inputData);
  },
});