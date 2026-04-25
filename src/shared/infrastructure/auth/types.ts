import type { Env } from "hono";

export interface AppEnv extends Env {
  Variables: {
    userId: string;
    userEmail: string;
    userRole: string;
    userName: string;
  };
}
