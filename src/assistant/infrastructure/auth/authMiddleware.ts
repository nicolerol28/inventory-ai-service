import type { Context, Next } from "hono";
import { verifyToken } from "./JwtValidator.js";

export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = header.slice(7); // Remove "Bearer "

  try {
    const payload = verifyToken(token);
    c.set("userId", payload.userId);
    c.set("userEmail", payload.sub);
    c.set("userRole", payload.role);
    c.set("userName", payload.name);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}