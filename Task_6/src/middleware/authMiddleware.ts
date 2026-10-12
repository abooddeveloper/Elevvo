import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import type { UserRole } from "../types/user.js";

export interface TokenClaims {
  sub: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      auth?: TokenClaims;
    }
  }
}

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return secret;
}

export const authenticateToken: RequestHandler = (request, response, next) => {
  const authorization = request.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const claims = jwt.verify(match[1], jwtSecret(), {
      algorithms: ["HS256"],
      issuer: "express-typescript-api",
      audience: "express-typescript-api"
    });
    if (typeof claims === "string" || typeof claims.sub !== "string"
      || (claims.role !== "USER" && claims.role !== "ADMIN")) {
      response.status(401).json({ error: "Invalid token" });
      return;
    }
    request.auth = { sub: claims.sub, role: claims.role };
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired token" });
  }
};

export function authorizeRole(...roles: UserRole[]): RequestHandler {
  return (request, response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      response.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

