// server/middleware/contactRateLimiter.js
import rateLimit from "express-rate-limit";

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact requests per 15 minutes
  message: {
    success: false,
    message: "Too many contact requests created from this IP, please try again after 15 minutes.",
  },
});

export default contactRateLimiter;