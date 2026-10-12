import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import type { StoredUser, User, UserInput, UserRole } from "../types/user.js";

const users = new Map<string, StoredUser>();
const SALT_ROUNDS = 12;

function publicUser(user: StoredUser): User {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export const userService = {
  getAll(): User[] {
    return [...users.values()].map(publicUser);
  },

  getById(id: string): User | undefined {
    const user = users.get(id);
    return user && publicUser(user);
  },

  getByEmail(email: string): StoredUser | undefined {
    return [...users.values()].find((user) => user.email === email.toLowerCase());
  },

  async create(input: UserInput & { password: string; role?: UserRole }): Promise<User> {
    const user: StoredUser = {
      id: randomUUID(),
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role ?? "USER",
      passwordHash: await bcrypt.hash(input.password, SALT_ROUNDS)
    };
    users.set(user.id, user);
    return publicUser(user);
  },

  async verifyPassword(user: StoredUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },

  delete(id: string): boolean {
    return users.delete(id);
  }
};
