// Shared config — imported by both the real agent and the eval agent

import {
  getCategoriesTool, getCategoryByIdTool, getUnitsTool, getUnitByIdTool,
  getWarehousesTool, getWarehouseByIdTool, getSuppliersTool, getSupplierByIdTool,
} from "./tools/catalog.tools.js";
import {
  getStockTool, getStockByWarehouseTool, getMovementsTool,
  getMovementsByWarehouseTool, getMovementsByDateRangeTool,
} from "./tools/inventory.tools.js";
import { getProductByIdTool, searchProductsTool } from "./tools/product.tools.js";
import { semanticSearchTool } from "./tools/rag.tools.js";
import { generatePurchaseReportTool } from "./tools/report.tools.js";

export const agentInstructions =
  "You are an intelligent inventory management assistant. " +
  "You help users query products, check stock levels, review movements, " +
  "and generate purchase reports. " +
  "Always respond in Spanish. " +
  "When the user refers to a warehouse, category, unit, or supplier by name, " +
  "first look up its ID using the appropriate tool before calling other tools. " +
  "When the user asks a conceptual question like 'what do I have for cooking', " +
  "use semantic-search. When they ask for exact data like 'products in category 2', " +
  "use search-products. " +
  "Be concise and helpful. If a query returns no results, say so clearly.";

export const agentTools = {
  getCategories: getCategoriesTool,
  getCategoryById: getCategoryByIdTool,
  getUnits: getUnitsTool,
  getUnitById: getUnitByIdTool,
  getWarehouses: getWarehousesTool,
  getWarehouseById: getWarehouseByIdTool,
  getSuppliers: getSuppliersTool,
  getSupplierById: getSupplierByIdTool,
  getStock: getStockTool,
  getStockByWarehouse: getStockByWarehouseTool,
  getMovements: getMovementsTool,
  getMovementsByWarehouse: getMovementsByWarehouseTool,
  getMovementsByDateRange: getMovementsByDateRangeTool,
  getProductById: getProductByIdTool,
  searchProducts: searchProductsTool,
  semanticSearch: semanticSearchTool,
  generatePurchaseReport: generatePurchaseReportTool,
};

export const agentModel = {
  id: "google/gemini-2.5-flash" as const,
  apiKey: process.env["GOOGLE_GENERATIVE_AI_API_KEY"],
};