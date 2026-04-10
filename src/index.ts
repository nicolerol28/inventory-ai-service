import "dotenv/config";
process.stdout.setEncoding("utf8");
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { assistantRouter } from "./assistant/api/controller/AssistantController.js";

const app = new Hono();

// CORS — permite llamadas desde el frontend React
app.use("*", cors({
  origin: ["http://localhost:5173", "https://inventory.nicoleroldan.com"],
  allowMethods: ["GET", "POST"],
}));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Rutas del asistente
app.route("/api/v1/assistant", assistantRouter);

const PORT = parseInt(process.env["PORT"] ?? "3000");

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`inventory-ai-service corriendo en http://localhost:${PORT}`);
  console.log(`POST /api/v1/assistant/index`);
  console.log(`POST /api/v1/assistant/chat`);
});
