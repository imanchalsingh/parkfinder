import express from "express";
import { getPredictions } from "../controllers/prediction.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

// GET /api/predictions/:parkingId
// Returns predicted availability for the next 8 hours based on historical data
router.get("/:parkingId", cacheMiddleware({ ttl: 3600 }), getPredictions);

export default router;
