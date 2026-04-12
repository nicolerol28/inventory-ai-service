import { InventoryClient } from "../../inventory/InventoryClient.js";

/**
 * Single shared instance used by all tools.
 * Every tool calls the same client, which manages one token
 * and handles automatic re-authentication on 401.
 */
export const inventoryClient = new InventoryClient();