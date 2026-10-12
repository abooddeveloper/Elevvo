import type { RequestHandler } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
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

export const registerUser: RequestHandler = async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid registration data", details: parsed.error.flatten().fieldErrors });
    return;
  }
  if (userService.getByEmail(parsed.data.email)) {
    response.status(409).json({ error: "Email is already registered" });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const user = await userService.create({ ...parsed.data, email });
  response.status(201).json({ user });
};

export const login: RequestHandler = async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid login data" });
    return;
  }

  const user = userService.getByEmail(parsed.data.email);
  const valid = user
    ? await userService.verifyPassword(user, parsed.data.password)
    : false;
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
};

export const getUsers: RequestHandler = (_request, response) => {
  response.json(userService.getAll());
};

export const getUser: RequestHandler<{ id: string }> = (request, response) => {
  if (request.auth?.role !== "ADMIN" && request.auth?.sub !== request.params.id) {
    response.status(403).json({ error: "Insufficient permissions" });
    return;
  }
  const user = userService.getById(request.params.id);
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }
  response.json(user);
};

export const deleteUser: RequestHandler<{ id: string }> = (request, response) => {
  if (!userService.delete(request.params.id)) {
    response.status(404).json({ error: "User not found" });
    return;
  }
  response.status(204).end();
};
