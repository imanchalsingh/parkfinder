import crypto from "crypto";
import { asyncLocalStorage } from "../utils/logger.js";

export const requestIdMiddleware = (req, res, next) => {
  // Use existing header if provided (useful for distributed tracing)
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  
  // Attach to request object for standard usage
  req.id = requestId;
  
  // Set in response header so clients can track their requests
  res.setHeader("X-Request-Id", requestId);

  // Wrap the request context inside AsyncLocalStorage
  asyncLocalStorage.run({ requestId }, () => {
    // Log the incoming request right at the start
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });
};
