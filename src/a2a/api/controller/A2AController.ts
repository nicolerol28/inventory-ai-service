import { Hono } from "hono";
import { buildAgentCard } from "../../domain/model/agent-card.js";
import { A2AUseCase } from "../../application/usecase/A2AUseCase.js";
import { authMiddleware } from "../../../shared/infrastructure/auth/authMiddleware.js";
import type { AppEnv } from "../../../shared/infrastructure/auth/types.js";
import type {
  JsonRpcRequest,
  JsonRpcResponse,
  MessageSendParams,
} from "../../domain/model/a2a.js";

export const a2aRouter = new Hono<AppEnv>();

const a2aUseCase = new A2AUseCase();

a2aRouter.get("/.well-known/agent.json", (c) => {
  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;
  return c.json(buildAgentCard(baseUrl));
});

a2aRouter.post("/a2a", authMiddleware, async (c) => {
  const body = await c.req.json<JsonRpcRequest>();

  if (body.jsonrpc !== "2.0" || body.id == null) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: { code: -32600, message: "Invalid Request" },
      id: body.id ?? null,
    };
    return c.json(response, 400);
  }

  if (body.method !== "message/send") {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not found" },
      id: body.id,
    };
    return c.json(response, 404);
  }

  const params = body.params as MessageSendParams | undefined;
  if (!params?.message?.parts?.length) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      error: { code: -32602, message: "Invalid params: message.parts is required" },
      id: body.id,
    };
    return c.json(response, 422);
  }

  const task = await a2aUseCase.handleMessageSend(params);

  const response: JsonRpcResponse = {
    jsonrpc: "2.0",
    result: task,
    id: body.id,
  };
  return c.json(response);
});
