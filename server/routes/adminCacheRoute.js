import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { cacheStats } from "../utils/cache/CacheStats.js";
import { cacheManager } from "../utils/cache/CacheManager.js";
import { getStats, flushCache, invalidateCache } from "../controllers/adminCacheController.js";
const router = express.Router();

// GET /api/admin/cache/stats
// View cache performance metrics
router.get("/stats", authMiddleware, adminMiddleware,getStats);

// POST /api/admin/cache/flush
// Manually flush the entire cache
router.post("/flush", authMiddleware, adminMiddleware,flushCache);

// POST /api/admin/cache/invalidate
// Invalidate cache by tag or namespace
router.post("/invalidate", authMiddleware, adminMiddleware,invalidateCache);

export default router;
