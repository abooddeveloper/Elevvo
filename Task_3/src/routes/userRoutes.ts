import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser
} from "../controllers/userController.js";

export const userRoutes = Router();

userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUser);
userRoutes.post("/", createUser);
userRoutes.put("/:id", updateUser);
userRoutes.delete("/:id", deleteUser);