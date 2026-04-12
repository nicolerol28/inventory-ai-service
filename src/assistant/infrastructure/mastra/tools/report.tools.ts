import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { inventoryClient } from "./shared.js";

export const generatePurchaseReportTool = createTool({
  id: "generate-purchase-report",
  description:
    "Generate a suggested purchase report for a warehouse. " +
    "Finds all products below minimum stock, enriches them with supplier " +
    "contact information, and returns a structured report ready for the user. " +
    "Use this when the user asks things like 'what do I need to buy', " +
    "'generate a purchase order', 'which products need restocking', " +
    "or 'purchase report for the main warehouse'.",
  inputSchema: z.object({
    warehouseId: z.number().describe(
      "The warehouse ID to generate the report for — " +
      "use get-warehouses first if the user refers to a warehouse by name"
    ),
  }),
  execute: async (inputData) => {
    // 1. Get all stock in the warehouse
    const stockPage = await inventoryClient.getStockByWarehouse(
      inputData.warehouseId,
      { page: 0, size: 100 }
    );

    // 2. Filter products below minimum
    const belowMinimum = stockPage.content.filter((s) => s.belowMinimum);

    if (belowMinimum.length === 0) {
      return {
        warehouseId: inputData.warehouseId,
        message: "All products are at or above minimum stock levels.",
        items: [],
      };
    }

    // 3. Get product details and supplier info for each item
    const items = await Promise.all(
      belowMinimum.map(async (stock) => {
        const product = await inventoryClient.getProductById(stock.productId);
        const supplier = await inventoryClient.getSupplierById(product.supplierId);

        return {
          productId: stock.productId,
          productName: stock.productName,
          currentStock: stock.quantity,
          minimumRequired: stock.minQuantity,
          deficit: stock.minQuantity - stock.quantity,
          supplier: {
            name: supplier.name,
            contact: supplier.contact,
            phone: supplier.phone,
          },
        };
      })
    );

    return {
      warehouseId: inputData.warehouseId,
      totalItemsToRestock: items.length,
      items,
    };
  },
});