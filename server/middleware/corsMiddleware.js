// server/middleware/corsMiddleware.js
import cors from "cors";

const corsMiddleware = cors({
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
});

export default corsMiddleware;