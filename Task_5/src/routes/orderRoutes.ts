import { Router } from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

export const orderRoutes = Router();
orderRoutes.use(authenticateToken);
orderRoutes.get("/", getOrders);
orderRoutes.post("/", createOrder);
