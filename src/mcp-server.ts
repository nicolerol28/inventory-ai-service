import { MCPServer } from "@mastra/mcp";

import {
  getCategoriesTool,
  getCategoryByIdTool,
  getUnitsTool,
  getUnitByIdTool,
  getWarehousesTool,
  getWarehouseByIdTool,
  getSuppliersTool,
  getSupplierByIdTool,
} from "./assistant/infrastructure/mastra/tools/catalog.tools.js";

import {
  getStockTool,
  getStockByWarehouseTool,
  getMovementsTool,
  getMovementsByWarehouseTool,
  getMovementsByDateRangeTool,
} from "./assistant/infrastructure/mastra/tools/inventory.tools.js";

import {
  getProductByIdTool,
  searchProductsTool,
} from "./assistant/infrastructure/mastra/tools/product.tools.js";

import { semanticSearchTool } from "./assistant/infrastructure/mastra/tools/rag.tools.js";
import { generatePurchaseReportTool } from "./assistant/infrastructure/mastra/tools/report.tools.js";

export const mcpServer = new MCPServer({
  name: "inventory-ai-mcp",
  version: "1.0.0",
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