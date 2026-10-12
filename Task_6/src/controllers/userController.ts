import type { RequestHandler } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { userService } from "../services/userService.js";
import { jwtSecret } from "../middleware/authMiddleware.js";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  role: z.enum(["USER", "ADMIN"])
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128)
}).strict();

export const registerUser: RequestHandler = async (request, response, next) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid registration data", details: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const email = parsed.data.email.toLowerCase();
    const user = await userService.create({ ...parsed.data, email });
    response.status(201).json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({ error: "Email is already registered" });
      return;
    }
    next(error);
  }
};

export const login: RequestHandler = async (request, response, next) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid login data" });
    return;
  }

  try {
    const user = await userService.getByEmail(parsed.data.email);
    const valid = user ? await userService.verifyPassword(user, parsed.data.password) : false;
    if (!user || !valid) {
      response.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ role: user.role }, jwtSecret(), {
    subject: user.id,
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "express-typescript-api",
    audience: "express-typescript-api"
  });
    response.json({ token, tokenType: "Bearer", expiresIn: 3600, user: {
      id: user.id, name: user.name, email: user.email, role: user.role
    } });
  } catch (error) { next(error); }
};

export const getUsers: RequestHandler = async (request, response, next) => {
  const page = Math.max(1, Number.parseInt(String(request.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(request.query.limit ?? "20"), 10) || 20));
  try { response.json(await userService.getAll((page - 1) * limit, limit)); }
  catch (error) { next(error); }
};

export const getUser: RequestHandler<{ id: string }> = async (request, response, next) => {
  if (request.auth?.role !== "ADMIN" && request.auth?.sub !== request.params.id) {
    response.status(403).json({ error: "Insufficient permissions" });
    return;
  }
  try {
    const user = await userService.getById(request.params.id);
    if (!user) {
      response.status(404).json({ error: "User not found" });
      return;
    }
    response.json(user);
  } catch (error) { next(error); }
};

export const deleteUser: RequestHandler<{ id: string }> = async (request, response, next) => {
  try {
    if (!await userService.delete(request.params.id)) {
      response.status(404).json({ error: "User not found" });
      return;
    }
    response.status(204).end();
  } catch (error) { next(error); }
};
