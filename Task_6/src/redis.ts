import { createClient } from "redis";
import type { RedisReply } from "rate-limit-redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379"
});

redisClient.on("error", (error) => {
  console.error("Redis client error", error);
});

export const sendRateLimitCommand = async (...args: string[]): Promise<RedisReply> => {
  const result: unknown = await redisClient.sendCommand(args);
  if (typeof result === "boolean" || typeof result === "number" || typeof result === "string") {
    return result;
  }
  if (Array.isArray(result) && result.every(
    (item): item is boolean | number | string =>
      typeof item === "boolean" || typeof item === "number" || typeof item === "string"
  )) {
    return result;
  }
  throw new TypeError("Unexpected response from Redis rate-limit command");
};
