import type { RequestHandler } from "express";
import { userService } from "../services/userService.js";
import type { UserInput } from "../types/user.js";

function isUserInput(value: unknown): value is UserInput {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;

  return typeof body.name === "string" && body.name.trim().length > 0
    && typeof body.email === "string" && body.email.trim().length > 0;
}

export const getUsers: RequestHandler = (_request, response) => {
  response.json(userService.getAll());
};

export const getUser: RequestHandler<{ id: string }> = (request, response) => {
  const user = userService.getById(request.params.id);
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.json(user);
};

export const createUser: RequestHandler = (request, response) => {
  if (!isUserInput(request.body)) {
    response.status(400).json({ error: "name and email are required strings" });
    return;
  }

  const user = userService.create({
    name: request.body.name.trim(),
    email: request.body.email.trim()
  });
  response.status(201).json(user);
};

export const updateUser: RequestHandler<{ id: string }> = (request, response) => {
  if (!isUserInput(request.body)) {
    response.status(400).json({ error: "name and email are required strings" });
    return;
  }

  const user = userService.update(request.params.id, {
    name: request.body.name.trim(),
    email: request.body.email.trim()
  });
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