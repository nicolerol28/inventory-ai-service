import "dotenv/config";
process.stdout.setEncoding("utf8");
import { serve } from "@hono/node-server";
import { HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { assistantRouter } from "./assistant/api/controller/AssistantController.js";
import { mcpServer } from "./mcp-server.js";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", cors({
  origin: ["http://localhost:5173", "https://inventory.nicoleroldan.com"],
  allowMethods: ["GET", "POST"],
}));

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/v1/assistant", assistantRouter);

// MCP HTTP Streaming
app.all("/mcp", async (c) => {
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
  console.log(`MCP HTTP Streaming en http://localhost:${PORT}/mcp`);
});