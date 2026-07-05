import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import Review from "../models/Review.js";
import Parking from "../models/Parking.js";

const router = express.Router();

// POST /api/reviews
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { parkingId, rating, comment } = req.body;
    
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ success: false, message: "Parking not found" });
    }

    const review = new Review({
      userId: req.user._id,
      parkingId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reviews/parking/:parkingId
router.get("/parking/:parkingId", async (req, res) => {
  try {
    const reviews = await Review.find({ 
      parkingId: req.params.parkingId,
      isDeleted: false // Exclude soft-deleted reviews
    }).populate("userId", "name");
    
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reviews/:id (Soft-Delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Check authorization: Must be the author or an admin
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this review" });
    }

    // Perform soft-delete
    review.isDeleted = true;
    review.deletedAt = new Date();
    await review.save();

    res.status(200).json({ success: true, message: "Review deleted successfully", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reviews/admin/all
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Admins can see all reviews, including soft-deleted ones
    const reviews = await Review.find().populate("userId", "name").populate("parkingId", "name");
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
