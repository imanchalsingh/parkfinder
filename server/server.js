import express from "express";
import parkingApi from "./getData/parkingApi.js";
import connectDB from "./database/db.js";
import bookingRouter from "./routes/bookingRoute.js";
import getbookingdata from "./getData/booking.js";
import authRoutes from "./routes/authRoutes.js";
import auth2faRoutes from "./routes/auth2faRoutes.js";
import adminSlotsRouter from "./routes/slotManage.js";
import userManage from "./routes/userManage.js";
import parkingLogRoute from "./routes/parkingLogRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import predictionRoute from "./routes/predictionRoute.js";
import favoritesRoute from "./routes/favoritesRoute.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import contactRoute from "./routes/contactRoute.js";
import cors from "cors";
import dotenv from "dotenv";
import floorVisualizationRoute from "./routes/floorVisualizationRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import { connectRedis } from "./utils/cache.js";
import "./jobs/bookingExpiry.js";
import { setupLogger } from "./utils/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.js";

// Initialize global logger override
setupLogger();

dotenv.config({ path: ".env" });

// Connect to Redis
if (process.env.NODE_ENV !== 'test') {
  connectRedis();
}

// Validate critical environment variables at startup
const requiredEnvVars = ["JWT_SECRET", "ADMIN_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  console.error("   Please set these in your .env file or system environment.");
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // Trust first proxy for express-rate-limit to work correctly behind reverse proxies

const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
  }),
);
// Middleware to parse JSON body (if needed later)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Request ID Tracking Context
app.use(requestIdMiddleware);

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}
// use auth route.
app.use("/api/auth", authRoutes);
app.use("/api/auth/2fa", auth2faRoutes);
// get/Use Booking APi data
app.use("/api", getbookingdata);

// Nested parking sub-routes — these MUST be registered BEFORE the general
// "/api/parking" mount below. Express matches mounted routers by path prefix
// in registration order, so if the broader "/api/parking" router is mounted
// first, it intercepts requests like "/api/parking/:id/floors" before they
// ever reach floorVisualizationRoute or peakHoursRoute.
app.use("/api/parking/:parkingId/floors", floorVisualizationRoute);
app.use("/api/parking/:parkingId/peak-hours", peakHoursRoute);

// get/Use Parking API routes (general — must come AFTER the nested routes above)
app.use("/api/parking", parkingApi);

// Use Booking Routes
app.use("/api/bookings", bookingRouter);
// Use slot management route.
app.use("/api/admin/slots", adminSlotsRouter);
// use user management route.
app.use("/api/admin/users", userManage);
// use admin analytics routes.
app.use("/api/admin/analytics", analyticsRoutes);
// use parkingLog --- entry exit of vehicle
app.use("/api", parkingLogRoute);
// use favorites route
app.use("/api/favorites", favoritesRoute);

// use contact route
app.use("/api/contact", contactRoute);
// use reviews route
app.use("/api/reviews", reviewRoute);
// use dashboard.js
app.use("/api/dashboard", dashboardRoute);

// use predictions — availability forecast based on historical occupancy
app.use("/api/predictions", predictionRoute);

// Setup Swagger Docs
// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Parking Slot API");
});

import { errorHandler } from "./middleware/errorHandler.js";

// Global Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
