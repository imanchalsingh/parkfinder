import express from "express";
import contactRateLimiter from "../middleware/contactRateLimiter.js";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();


router.post("/", contactRateLimiter, submitContactForm);

export default router;
