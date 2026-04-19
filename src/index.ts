import "dotenv/config";
process.stdout.setEncoding("utf8");
import { serve } from "@hono/node-server";
import { HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { assistantRouter } from "./assistant/api/controller/AssistantController.js";
import { conversationRouter } from "./assistant/api/controller/ConversationController.js";
import { mcpServer } from "./mcp-server.js";
import { startSeedJob } from "./assistant/infrastructure/seed/SeedService.js";

const app = new Hono<{ Bindings: HttpBindings }>();

const isProduction = process.env["NODE_ENV"] === "production";

app.use("*", cors({
  origin: [
    ...(isProduction ? [] : ["http://localhost:5173"]),
    "https://inventory.nicoleroldan.com",
    "https://inventory-ai-chat.vercel.app",
    `${process.env["CHAT_UI_URL"] ?? ""}`,
  ].filter(Boolean),
  allowMethods: ["GET", "POST", "PATCH", "DELETE"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/v1/assistant", assistantRouter);
app.route("/api/v1/conversations", conversationRouter);

// MCP HTTP Streaming
app.all("/mcp", async (c) => {
  const MCP_API_KEY = process.env["MCP_API_KEY"];

  if (!MCP_API_KEY) {
    console.warn("[MCP] MCP_API_KEY not configured — denying all MCP HTTP requests");
    return c.json({ error: "MCP HTTP access is not enabled" }, 401);
  }

  const provided =
    c.req.header("x-api-key") ??
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (provided !== MCP_API_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { incoming: req, outgoing: res } = c.env;
  await mcpServer.startHTTP({
    url: new URL(c.req.url),
    httpPath: "/mcp",
    req,
    res,
  });
  return new Response(null);
});

const PORT = parseInt(process.env["PORT"] ?? "3000");

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`inventory-ai-service corriendo en http://localhost:${PORT}`);
  console.log(`POST /api/v1/assistant/index`);
  console.log(`POST /api/v1/assistant/chat`);
  console.log(`GET  /api/v1/conversations`);
  console.log(`MCP HTTP Streaming en http://localhost:${PORT}/mcp`);

  // Start the daily seed job
  startSeedJob();
});