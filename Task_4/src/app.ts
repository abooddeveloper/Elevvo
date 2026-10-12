import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { observabilityMiddleware } from "./middleware/observabilityMiddleware.js";
import { userRoutes } from "./routes/userRoutes.js";

export const app = express();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",").map((origin) => origin.trim()).filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: false,
  maxAge: 600
}));

app.use(observabilityMiddleware);
app.use(express.json());
app.use("/api/users", userRoutes);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof Error && error.message === "Origin is not allowed by CORS") {
    response.status(403).json({ error: "Origin is not allowed" });
    return;
  }
  const statusCode = "status" in error && typeof error.status === "number"
    ? error.status
    : 500;
  const message = statusCode === 400 ? "Invalid JSON payload" : "Internal server error";

  response.status(statusCode).json({ error: message });
};

app.use(errorHandler);
