import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;      // email
  userId: number;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env["JWT_SECRET"];

export function verifyToken(token: string): JwtPayload {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}