import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { inventoryClient } from "./shared.js";

// Stock

export const getStockTool = createTool({
  id: "get-stock",
  description:
    "Get current stock level for a specific product in a specific warehouse. " +
    "Returns quantity, minimum quantity, and whether stock is below minimum. " +
    "Use this when the user asks about how much of a specific product is available. " +
    "Requires both productId and warehouseId — if the user only mentions a product " +
    "or warehouse by name, resolve the ID first using other tools.",
  inputSchema: z.object({
    productId: z.number().describe("The product ID to check stock for"),
    warehouseId: z.number().describe("The warehouse ID to check stock in"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getStock(inputData.productId, inputData.warehouseId);
  },
});

export const getStockByWarehouseTool = createTool({
  id: "get-stock-by-warehouse",
  description:
    "Get all product stock levels in a specific warehouse. " +
    "Returns a paginated list with quantity, minimum, and belowMinimum flag for each product. " +
    "Use this when the user asks about overall warehouse inventory, " +
    "which products are running low, or wants a general view of stock. " +
    "You can filter by product name and sort the results.",
  inputSchema: z.object({
    warehouseId: z.number().describe("The warehouse ID to list stock for"),
    productName: z
      .string()
      .optional()
      .describe("Optional filter by product name (partial match)"),
    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort order by product name, defaults to 'asc'"),
    page: z.number().optional().describe("Page number, defaults to 0"),
    size: z.number().optional().describe("Page size, defaults to 20"),
  }),
  execute: async (inputData) => {
    const { warehouseId, ...params } = inputData;
    return await inventoryClient.getStockByWarehouse(warehouseId, params);
  },
});

// Movements

export const getMovementsTool = createTool({
  id: "get-movements",
  description:
    "Get movement history for a specific product in a specific warehouse. " +
    "Returns a paginated list of stock entries and exits with quantities, " +
    "timestamps, and movement type. " +
    "Use this when the user asks about the history of a specific product.",
  inputSchema: z.object({
    productId: z.number().describe("The product ID to get movements for"),
    warehouseId: z.number().describe("The warehouse ID"),
    page: z.number().optional().describe("Page number, defaults to 0"),
    size: z.number().optional().describe("Page size, defaults to 20"),
  }),
  execute: async (inputData) => {
    const { productId, warehouseId, ...params } = inputData;
    return await inventoryClient.getMovements(productId, warehouseId, params);
  },
});

export const getMovementsByWarehouseTool = createTool({
  id: "get-movements-by-warehouse",
  description:
    "Get all movements in a specific warehouse. " +
    "Can be filtered by movement type: " +
    "PURCHASE_ENTRY (bought from supplier), SALE_EXIT (sold), " +
    "RETURN_ENTRY (customer return), DAMAGE_EXIT (damaged goods), " +
    "ADJUSTMENT_IN (manual increase), ADJUSTMENT_OUT (manual decrease). " +
    "Use this when the user asks about sales, purchases, returns, or any " +
    "type of movement across the entire warehouse.",
  inputSchema: z.object({
    warehouseId: z.number().describe("The warehouse ID"),
    movementType: z
      .enum([
        "PURCHASE_ENTRY",
        "SALE_EXIT",
        "RETURN_ENTRY",
        "DAMAGE_EXIT",
        "ADJUSTMENT_IN",
        "ADJUSTMENT_OUT",
      ])
      .optional()
      .describe("Optional filter by movement type"),
    page: z.number().optional().describe("Page number, defaults to 0"),
    size: z.number().optional().describe("Page size, defaults to 20"),
  }),
  execute: async (inputData) => {
    const { warehouseId, ...params } = inputData;
    return await inventoryClient.getMovementsByWarehouse(warehouseId, params);
  },
});

export const getMovementsByDateRangeTool = createTool({
  id: "get-movements-by-date-range",
  description:
    "Get all movements in a warehouse within a specific date range. " +
    "Use this when the user asks about movements during a period, " +
    "e.g. 'what movements happened last week' or 'show me January movements'. " +
    "Dates must be in ISO 8601 format (yyyy-MM-ddTHH:mm:ss).",
  inputSchema: z.object({
    warehouseId: z.number().describe("The warehouse ID"),
    from: z
      .string()
      .describe("Start date in ISO 8601 format, e.g. '2025-01-01T00:00:00'"),
    to: z
      .string()
      .describe("End date in ISO 8601 format, e.g. '2025-01-31T23:59:59'"),
    page: z.number().optional().describe("Page number, defaults to 0"),
    size: z.number().optional().describe("Page size, defaults to 20"),
  }),
  execute: async (inputData) => {
    const { warehouseId, from, to, ...params } = inputData;
    return await inventoryClient.getMovementsByDateRange(
      warehouseId,
      from,
      to,
      params
    );
  },
});