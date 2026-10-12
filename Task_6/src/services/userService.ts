import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import type { UserRole } from "../types/user.js";

const SALT_ROUNDS = 12;

export const userService = {
  getAll(skip = 0, take = 20) {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  },

  getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  },

  getByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async create(input: { name: string; email: string; password: string; role?: UserRole }) {
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        role: input.role ?? "USER",
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  },

  verifyPassword(user: { passwordHash: string }, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  },

  async delete(id: string) {
    const result = await prisma.user.deleteMany({ where: { id } });
    return result.count > 0;
  }
};
