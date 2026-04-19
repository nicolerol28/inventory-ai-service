import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { agentInstructions, agentTools, agentModel } from "./agent-config.js";

const memory = new Memory({
  storage: new PostgresStore({
    id: "inventory-memory-storage",
    connectionString: process.env["DATABASE_URL"],
  }),
  options: {
    lastMessages: 20,
    observationalMemory: true,
  },
});

export const inventoryAgent = new Agent({
  id: "inventory-assistant",
  name: "Inventory Assistant",
  model: agentModel,
  memory,
  instructions: agentInstructions(),
  tools: agentTools,
});