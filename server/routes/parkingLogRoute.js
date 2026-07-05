import express from "express";
import { enterVehicle, exitVehicle } from "../controllers/parkingLog.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/entry/:bookingId", authMiddleware, adminMiddleware, enterVehicle);
router.post("/exit/:bookingId", authMiddleware, adminMiddleware, exitVehicle);

export default router;