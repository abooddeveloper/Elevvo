export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export type UserInput = Pick<User, "name" | "email">;
