import express from "express";
import {
  getFloorVisualization,
  getFloorDetail,
} from "../controllers/floorVisualization.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router({ mergeParams: true });

// GET /api/parking/:parkingId/floors
router.get("/", cacheMiddleware({ ttl: 60 }), getFloorVisualization);

// GET /api/parking/:parkingId/floors/:floorNumber
router.get("/:floorNumber", cacheMiddleware({ ttl: 60 }), getFloorDetail);

export default router;