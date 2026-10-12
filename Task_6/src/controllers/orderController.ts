import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { invalidateProductsCache } from "./productController.js";

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive().max(999) }).strict()).min(1).max(50)
}).strict();

export const getOrders: RequestHandler = async (request, response, next) => {
  const page = Math.max(1, Number.parseInt(String(request.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(request.query.limit ?? "20"), 10) || 20));
  const isAdmin = request.auth?.role === "ADMIN";
  try {
    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: request.auth!.sub },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } }
    });
    response.json(orders);
  } catch (error) { next(error); }
};

export const createOrder: RequestHandler = async (request, response, next) => {
  const parsed = createOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid order data", details: parsed.error.flatten().fieldErrors });
    return;
  }
  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] } } });
      if (products.length !== quantities.size) throw new Error("PRODUCT_NOT_FOUND");
      for (const product of products) {
        const quantity = quantities.get(product.id)!;
        const changed = await tx.product.updateMany({ where: { id: product.id, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } });
        if (changed.count !== 1) throw new Error("INSUFFICIENT_STOCK");
      }
      return tx.order.create({
        data: {
          user: { connect: { id: request.auth!.sub } },
          items: { create: products.map((product) => ({
            quantity: quantities.get(product.id)!,
            unitPrice: product.price,
            product: { connect: { id: product.id } }
          })) }
        },
        include: { items: { include: { product: true } } }
      });
    });
    try {
      await invalidateProductsCache();
    } catch (error) {
      console.error("Failed to invalidate the product cache after order creation", error);
    }
    response.status(201).json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      response.status(400).json({ error: "One or more products do not exist" });
      return;
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      response.status(409).json({ error: "Insufficient product stock" });
      return;
    }
    next(error);
  }
};
