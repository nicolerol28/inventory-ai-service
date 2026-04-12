import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { inventoryClient } from "./shared.js";

// Categories

export const getCategoriesTool = createTool({
  id: "get-categories",
  description:
    "List all active product categories. " +
    "Use this when the user asks what categories exist, or when you need to " +
    "translate a category name to its ID for use in other tools like searchProducts.",
  inputSchema: z.object({}),
  execute: async () => {
    return await inventoryClient.getCategories();
  },
});

export const getCategoryByIdTool = createTool({
  id: "get-category-by-id",
  description:
    "Get details of a specific category by its ID, including whether it is active or not. " +
    "Use this when you already have a category ID and need its name or status.",
  inputSchema: z.object({
    categoryId: z.number().describe("The category ID to look up"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getCategoryById(inputData.categoryId);
  },
});

// Units

export const getUnitsTool = createTool({
  id: "get-units",
  description:
    "List all active units of measurement (e.g. kilogram, liter, unit). " +
    "Use this when the user asks what units exist or when you need to " +
    "translate a unit name to its ID.",
  inputSchema: z.object({}),
  execute: async () => {
    return await inventoryClient.getUnits();
  },
});

export const getUnitByIdTool = createTool({
  id: "get-unit-by-id",
  description:
    "Get details of a specific unit of measurement by its ID, including whether it is active or not. " +
    "Use this when you already have a unit ID and need its name, symbol, or status.",
  inputSchema: z.object({
    unitId: z.number().describe("The unit ID to look up"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getUnitById(inputData.unitId);
  },
});

// Warehouses

export const getWarehousesTool = createTool({
  id: "get-warehouses",
  description:
    "List all active warehouses. " +
    "Use this when the user asks what warehouses exist, or when you need to " +
    "find a warehouse ID by name. Many inventory tools require a warehouseId — " +
    "call this first if the user refers to a warehouse by name.",
  inputSchema: z.object({}),
  execute: async () => {
    return await inventoryClient.getWarehouses();
  },
});

export const getWarehouseByIdTool = createTool({
  id: "get-warehouse-by-id",
  description:
    "Get details of a specific warehouse by its ID, including whether it is active or not. " +
    "Use this when you already have a warehouse ID and need its name, location, or status.",
  inputSchema: z.object({
    warehouseId: z.number().describe("The warehouse ID to look up"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getWarehouseById(inputData.warehouseId);
  },
});

// Suppliers

export const getSuppliersTool = createTool({
  id: "get-suppliers",
  description:
    "List all active suppliers with their contact information. " +
    "Use this when the user asks about suppliers, or when you need to find " +
    "a supplier's name and contact details for a purchase report.",
  inputSchema: z.object({}),
  execute: async () => {
    return await inventoryClient.getSuppliers();
  },
});

export const getSupplierByIdTool = createTool({
  id: "get-supplier-by-id",
  description:
    "Get details of a specific supplier by its ID, including name, contact, phone, and whether it is active. " +
    "Use this when you have a supplier ID (e.g. from a product or movement) and need the supplier's information.",
  inputSchema: z.object({
    supplierId: z.number().describe("The supplier ID to look up"),
  }),
  execute: async (inputData) => {
    return await inventoryClient.getSupplierById(inputData.supplierId);
  },
});