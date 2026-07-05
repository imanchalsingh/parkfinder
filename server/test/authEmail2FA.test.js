import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";
import * as emailUtils from "../utils/email.js";

// Mock the email utility to prevent actual emails from being sent
vi.mock("../utils/email.js", () => ({
  send2FAEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
}));

describe("Email 2FA Authentication Flow", () => {
  let userEmail = "email2fa.test@example.com";
  let userPassword = "password123";
  let userId;
  let deviceId = "test-device-uuid-1234";

  beforeEach(async () => {
    // Clear the user if exists
    await User.deleteOne({ email: userEmail });

    // Create a new user
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Email 2FA Test User",
        email: userEmail,
        password: userPassword,
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    userId = res.body.user._id;
  });

  afterAll(async () => {
    await User.deleteOne({ email: userEmail });
  });

  it("should trigger Email 2FA for an unrecognized device", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password: userPassword,
        deviceId: "unrecognized-device-5678",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresEmail2FA).toBe(true);
    expect(res.body.tempToken).toBeDefined();

    // Verify that the email utility was called
    expect(emailUtils.send2FAEmail).toHaveBeenCalled();
  });

  it("should bypass Email 2FA if deviceId is in trustedDevices", async () => {
    // Manually add device to trustedDevices
    await User.findByIdAndUpdate(userId, {
      $push: { trustedDevices: deviceId },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password: userPassword,
        deviceId: deviceId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresEmail2FA).toBeUndefined(); // Should not require it
    expect(res.body.token).toBeDefined(); // Returns actual token immediately
  });

  it("should successfully verify Email 2FA OTP and add device to trusted", async () => {
    // Clear trusted devices first
    await User.findByIdAndUpdate(userId, { trustedDevices: [] });

    // 1. Login to trigger 2FA
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password: userPassword,
        deviceId: "new-device-9999",
      });

    expect(loginRes.body.requiresEmail2FA).toBe(true);
    const tempToken = loginRes.body.tempToken;

    // We can't easily extract the plain text OTP since it's hashed in the DB.
    // However, we can mock the bcrypt.compare or just generate a known OTP for testing.
    // Instead of mocking bcrypt, we can just fetch the user and overwrite the hash with a known OTP's hash.
    const bcrypt = await import("bcrypt");
    const knownOtp = "123456";
    const hashedOtp = await bcrypt.hash(knownOtp, 10);
    
    await User.findByIdAndUpdate(userId, {
      emailVerificationOTP: hashedOtp,
      emailVerificationOTPExpiry: Date.now() + 10 * 60 * 1000,
    });

    // 2. Verify with correct OTP
    const verifyRes = await request(app)
      .post("/api/auth/login/verify-email-2fa")
      .send({
        tempToken,
        otp: knownOtp,
        deviceId: "new-device-9999",
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.token).toBeDefined();

    // 3. Check if device was added to trusted
    const updatedUser = await User.findById(userId);
    expect(updatedUser.trustedDevices).toContain("new-device-9999");
  });
});
