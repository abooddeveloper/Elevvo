import type { RequestHandler } from "express";
import { prisma } from "../prisma.js";
import { redisClient } from "../redis.js";

const cacheVersionKey = "products:cache-version";
const cacheTtlSeconds = 60 * 60;

export const getProducts: RequestHandler = async (request, response, next) => {
  const page = Math.max(1, Number.parseInt(String(request.query.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(request.query.limit ?? "20"), 10) || 20));

  try {
    const cacheVersion = await redisClient.get(cacheVersionKey) ?? "0";
    const cacheKey = `products:${cacheVersion}:${page}:${limit}`;
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts !== null) {
      response.json(JSON.parse(cachedProducts));
      return;
    }

    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ name: "asc" }, { id: "asc" }]
    });

    await redisClient.set(cacheKey, JSON.stringify(products), { EX: cacheTtlSeconds });
    response.json(products);
  } catch (error) {
    next(error);
  }
};

export const invalidateProductsCache = async (): Promise<void> => {
  await redisClient.incr(cacheVersionKey);
};
