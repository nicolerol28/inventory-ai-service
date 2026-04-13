#!/usr/bin/env node
import "dotenv/config";
import { mcpServer } from "./mcp-server.js";

mcpServer.startStdio().catch((error: Error) => {
  process.stderr.write(`[MCP] Error starting stdio: ${error.message}\n`);
  process.exit(1);
});