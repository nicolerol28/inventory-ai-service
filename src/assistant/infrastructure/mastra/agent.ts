import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";

// Catalog tools
import {
  getCategoriesTool,
  getCategoryByIdTool,
  getUnitsTool,
  getUnitByIdTool,
  getWarehousesTool,
  getWarehouseByIdTool,
  getSuppliersTool,
  getSupplierByIdTool,
} from "./tools/catalog.tools.js";

// Inventory tools
import {
  getStockTool,
  getStockByWarehouseTool,
  getMovementsTool,
  getMovementsByWarehouseTool,
  getMovementsByDateRangeTool,
} from "./tools/inventory.tools.js";

// Product tools
import {
  getProductByIdTool,
  searchProductsTool,
} from "./tools/product.tools.js";

// RAG tool
import { semanticSearchTool } from "./tools/rag.tools.js";

// Report tool
import { generatePurchaseReportTool } from "./tools/report.tools.js";

const memory = new Memory({
  storage: new PostgresStore({
    id: "inventory-memory-storage",
    connectionString: process.env["DATABASE_URL"]!,
  }),
  options: {
    lastMessages: 20,
    observationalMemory: true,
  },
});

export const inventoryAgent = new Agent({
  id: "inventory-assistant",
  name: "Inventory Assistant",
  model: {
    id: "google/gemini-2.5-flash",
    apiKey: process.env["GOOGLE_GENERATIVE_AI_API_KEY"],
  },
  memory,
  instructions:
    "You are an intelligent inventory management assistant. " +
    "You help users query products, check stock levels, review movements, " +
    "and generate purchase reports. " +
    "Always respond in Spanish. " +
    "When the user refers to a warehouse, category, unit, or supplier by name, " +
    "first look up its ID using the appropriate tool before calling other tools. " +
    "When the user asks a conceptual question like 'what do I have for cooking', " +
    "use semantic-search. When they ask for exact data like 'products in category 2', " +
    "use search-products. " +
    "Be concise and helpful. If a query returns no results, say so clearly.",
  tools: {
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
  },
});