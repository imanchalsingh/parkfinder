// server/routes/reviewRoute.js
import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
// 🟢 Import controllers from the new file
import {
  createReview,
  getReviewsByParking,
  deleteReview,
  getAllReviewsAdmin
} from "../controllers/reviewController.js";

const router = express.Router();

// POST /api/reviews
router.post("/", authMiddleware, createReview);

// GET /api/reviews/parking/:parkingId
router.get("/parking/:parkingId", getReviewsByParking);

// DELETE /api/reviews/:id
router.delete("/:id", authMiddleware, deleteReview);

// GET /api/reviews/admin/all
router.get("/admin/all", authMiddleware, adminMiddleware, getAllReviewsAdmin);

export default router;