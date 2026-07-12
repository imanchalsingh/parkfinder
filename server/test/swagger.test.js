import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "../config/swagger.js";

// Import routers to ensure JSDoc comments are picked up
import authRoutes from "../routes/authRoutes.js";
import auth2faRoutes from "../routes/auth2faRoutes.js";
import slotManage from "../routes/slotManage.js";
import bookingRoute from "../routes/bookingRoute.js";

describe("Swagger Documentation Tests", () => {
  it("should generate valid Swagger JSON without errors", () => {
    // This will throw if any of the JSDoc YAML annotations are malformed
    const swaggerDocs = swaggerJsDoc(swaggerOptions);

    expect(swaggerDocs).toBeDefined();
    expect(swaggerDocs.openapi).toBe("3.0.0");
    expect(swaggerDocs.info.title).toBe("SmartPark API");
    
    // Verify that paths were successfully parsed from the routes
    expect(Object.keys(swaggerDocs.paths).length).toBeGreaterThan(0);
    
    // Check for specific endpoints we annotated
    expect(swaggerDocs.paths).toHaveProperty("/api/auth/login/verify-2fa");
    expect(swaggerDocs.paths).toHaveProperty("/api/auth/2fa/setup");
    expect(swaggerDocs.paths).toHaveProperty("/api/admin/slots/{id}");
    expect(swaggerDocs.paths).toHaveProperty("/api/bookings/my-bookings");
  });

  it("should serve Swagger UI on /api-docs endpoint", async () => {
    const app = express();
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    // Request the swagger UI html page
    const response = await request(app).get("/api-docs/");
    
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("Swagger UI");
  });
});
