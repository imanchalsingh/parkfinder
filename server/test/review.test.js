import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import reviewRoutes from "../routes/reviewRoute.js";
import Review from "../models/Review.js";
import Parking from "../models/Parking.js";

// Mock the models
vi.mock("../models/Review.js", () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../models/Parking.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

// Mock the auth middleware to simulate a logged in user
vi.mock("../middleware/auth.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = { _id: "user123", role: "user" };
    next();
  },
  adminMiddleware: (req, res, next) => {
    // Note: since our mock always runs next(), we need to simulate the role manually
    // For the admin test, authMiddleware mock runs, setting user123.
    // The test will handle it by re-mocking or checking the role directly if needed.
    // For simplicity, we just set role to admin for the admin route test explicitly
    req.user.role = "admin";
    next();
  }
}));

// Create an express app for testing
const app = express();
app.use(express.json());
app.use("/api/reviews", reviewRoutes);

describe("Review Routes - Soft Delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DELETE /api/reviews/:id", () => {
    it("should soft-delete a review if the user is the author", async () => {
      const mockReview = {
        _id: "review123",
        userId: { toString: () => "user123" },
        isDeleted: false,
        save: vi.fn().mockResolvedValue(true)
      };

      Review.findById.mockResolvedValue(mockReview);

      const res = await request(app).delete("/api/reviews/review123");

      expect(res.status).toBe(200);
      expect(mockReview.isDeleted).toBe(true);
      expect(mockReview.deletedAt).toBeDefined();
      expect(mockReview.save).toHaveBeenCalled();
      expect(res.body.message).toBe("Review deleted successfully");
    });

    it("should return 403 if a regular user tries to delete someone else's review", async () => {
      const mockReview = {
        _id: "review123",
        userId: { toString: () => "otherUser456" },
        isDeleted: false,
        save: vi.fn()
      };

      Review.findById.mockResolvedValue(mockReview);

      const res = await request(app).delete("/api/reviews/review123");

      expect(res.status).toBe(403);
      expect(mockReview.isDeleted).toBe(false);
      expect(mockReview.save).not.toHaveBeenCalled();
      expect(res.body.message).toBe("Unauthorized to delete this review");
    });

    it("should return 404 if review does not exist", async () => {
      Review.findById.mockResolvedValue(null);

      const res = await request(app).delete("/api/reviews/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Review not found");
    });
  });

  describe("GET /api/reviews/parking/:parkingId", () => {
    it("should only return reviews where isDeleted is false", async () => {
      const mockReviews = [
        { _id: "1", comment: "Great", isDeleted: false },
        { _id: "2", comment: "Good", isDeleted: false },
      ];

      // Mock chain for populate
      Review.find.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockReviews)
      });

      const res = await request(app).get("/api/reviews/parking/parking123");

      expect(res.status).toBe(200);
      expect(Review.find).toHaveBeenCalledWith({
        parkingId: "parking123",
        isDeleted: false
      });
      expect(res.body.data).toEqual(mockReviews);
    });
  });

  describe("GET /api/reviews/admin/all", () => {
    it("should return all reviews for admins including deleted ones", async () => {
      const mockReviews = [
        { _id: "1", comment: "Great", isDeleted: false },
        { _id: "2", comment: "Bad", isDeleted: true },
      ];

      Review.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockReviews)
        })
      });

      const res = await request(app).get("/api/reviews/admin/all");

      expect(res.status).toBe(200);
      expect(Review.find).toHaveBeenCalledWith(); // called without isDeleted filter
      expect(res.body.data).toEqual(mockReviews);
    });
  });
});
