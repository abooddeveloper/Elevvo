import express, { type ErrorRequestHandler } from "express";
import { observabilityMiddleware } from "./middleware/observabilityMiddleware.js";
import { userRoutes } from "./routes/userRoutes.js";

export const app = express();

app.use(observabilityMiddleware);
app.use(express.json());
app.use("/api/users", userRoutes);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = "status" in error && typeof error.status === "number"
    ? error.status
    : 500;
  const message = statusCode === 400 ? "Invalid JSON payload" : "Internal server error";

  response.status(statusCode).json({ error: message });
};

app.use(errorHandler);