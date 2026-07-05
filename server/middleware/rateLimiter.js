import rateLimit from "express-rate-limit";

export const authLimiter = process.env.NODE_ENV === "test"
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: "Too many requests. Please try again later.",
    });

export const resetLimiter = process.env.NODE_ENV === "test"
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 3,
      message: "Too many password reset requests.",
    });