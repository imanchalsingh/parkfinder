// server/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return next(new AppError("Access denied. No token provided.", 401, "UNAUTHORIZED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 401, "USER_NOT_FOUND"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Access denied. Admin only.", 403, "FORBIDDEN"));
  }
  next();
};