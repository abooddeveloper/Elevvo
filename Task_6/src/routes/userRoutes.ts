import { Router } from "express";
import { deleteUser, getUser, getUsers, login, registerUser } from "../controllers/userController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/loginLimiter.js";

export const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginLimiter, login);
userRoutes.get("/", authenticateToken, authorizeRole("ADMIN"), getUsers);
userRoutes.get("/:id", authenticateToken, getUser);
userRoutes.delete("/:id", authenticateToken, authorizeRole("ADMIN"), deleteUser);
