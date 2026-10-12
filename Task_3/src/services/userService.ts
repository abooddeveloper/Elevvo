import { randomUUID } from "node:crypto";
import type { User, UserInput } from "../types/user.js";

const users = new Map<string, User>();

export const userService = {
  getAll(): User[] {
    return [...users.values()];
  },

  getById(id: string): User | undefined {
    return users.get(id);
  },

  create(input: UserInput): User {
    const user: User = { id: randomUUID(), ...input };
    users.set(user.id, user);
    return user;
  },

  update(id: string, input: UserInput): User | undefined {
    if (!users.has(id)) return undefined;

    const user: User = { id, ...input };
    users.set(id, user);
    return user;
  },

  delete(id: string): boolean {
    return users.delete(id);
  }
};