import { Mastra } from "@mastra/core";
import { inventoryAgent } from "../assistant/infrastructure/mastra/agent.js";

export const mastra = new Mastra({
  agents: { inventoryAgent },
});