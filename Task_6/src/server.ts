import "dotenv/config";
import { app } from "./app.js";
import { redisClient } from "./redis.js";

const port = Number(process.env.PORT) || 3000;

try {
  await redisClient.connect();
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
} catch (error) {
  console.error("Failed to connect to Redis", error);
  process.exitCode = 1;
}