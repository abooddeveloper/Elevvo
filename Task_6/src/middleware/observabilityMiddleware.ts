import { performance } from "node:perf_hooks";
import type { RequestHandler } from "express";

export const observabilityMiddleware: RequestHandler = (request, response, next) => {
    const timestamp = new Date().toISOString();
    const startedAt = performance.now();

    response.on("finish", () => {
    console.log(JSON.stringify({
    timestamp,
    method: request.method,
    path: request.path,
    durationMs: Number((performance.now() - startedAt).toFixed(2))
    }));
    });

    next();
};