import express from "express";
import { getPeakHours } from "../controllers/peakHours.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router({ mergeParams: true });

// GET /api/parking/:parkingId/peak-hours
router.get("/", cacheMiddleware({ ttl: 3600 }), getPeakHours);

export default router;