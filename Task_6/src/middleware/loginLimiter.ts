import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { sendRateLimitCommand } from "../redis.js";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  store: new RedisStore({
    sendCommand: sendRateLimitCommand,
    prefix: "login-limit:"
  }),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." }
});
