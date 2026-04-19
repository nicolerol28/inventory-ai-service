import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { agentInstructions, agentTools, agentModel } from "../assistant/infrastructure/mastra/agent-config.js";

const evalMemory = new Memory({
  storage: new PostgresStore({
    id: "eval-memory-storage",
    connectionString: process.env["DATABASE_URL"]!,
  }),
  options: {
    lastMessages: 20,
  },
});

export const evalAgent = new Agent({
  id: "inventory-eval-agent",
  name: "Inventory Eval Agent",
  model: agentModel,
  memory: evalMemory,
  instructions: agentInstructions(),
  tools: agentTools,
});