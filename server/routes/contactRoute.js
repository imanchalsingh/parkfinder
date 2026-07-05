import express from "express";
import rateLimit from "express-rate-limit";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: "Too many contact requests created from this IP, please try again after 15 minutes.",
  },
});

router.post("/", contactRateLimit, submitContactForm);

export default router;
