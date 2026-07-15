import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail, send2FAEmail } from "../utils/email.js";
import eventBus from "../events/eventBus.js";
import { EVENTS } from "../events/constants.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: "Name is required and cannot be empty." });
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ success: false, message: "Email is required and cannot be empty." });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ success: false, message: "Password is required and cannot be empty." });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "Email already exists" });

    // Prevent random users from creating admin
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.json({
          success: false,
          message: "Invalid Admin Secret Key",
        });
      }
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "user",
    });

    await user.save();

    eventBus.emit(EVENTS.USER_REGISTERED, { user });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Account created successfully! Welcome!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

  export const login = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ success: false, message: "Email is required and cannot be empty." });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ success: false, message: "Password is required and cannot be empty." });
    }
    if (deviceId !== undefined && (typeof deviceId !== 'string' || deviceId.trim() === '')) {
      return res.status(400).json({ success: false, message: "Device ID must be a valid string if provided." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: INVALID_CREDENTIALS_MESSAGE });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: INVALID_CREDENTIALS_MESSAGE });
    }

    // Check if device is recognized
    if (deviceId && !user.trustedDevices.includes(deviceId)) {
      // Unrecognized device - Trigger Email 2FA
      const otp = crypto.randomInt(100000, 999999).toString();

      user.emailVerificationOTP = await bcrypt.hash(otp, 10);
      user.emailVerificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      eventBus.emit(EVENTS.TWO_FACTOR_REQUESTED, { email: user.email, otp });

      const tempToken = jwt.sign(
        { id: user._id, role: user.role, isEmail2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      return res.json({
        success: true,
        requiresEmail2FA: true,
        tempToken,
      });
    }

    // Check if device is recognized
    if (deviceId && !user.trustedDevices.includes(deviceId)) {
      // Unrecognized device - Trigger Email 2FA
      const otp = crypto.randomInt(100000, 999999).toString();
      
      user.emailVerificationOTP = await bcrypt.hash(otp, 10);
      user.emailVerificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      eventBus.emit(EVENTS.TWO_FACTOR_REQUESTED, { email: user.email, otp });

      const tempToken = jwt.sign(
        { id: user._id, role: user.role, isEmail2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      return res.json({
        success: true,
        requiresEmail2FA: true,
        tempToken,
      });
    }

    // Check if user is admin or manager and has 2FA enabled
    if (
      (user.role === "admin" || user.role === "manager") &&
      user.isTwoFactorEnabled
    ) {
      // Return a temporary short-lived token instead of the full access token
      const tempToken = jwt.sign(
        { id: user._id, role: user.role, isTemp: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" } // valid for 5 minutes
      );

      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import speakeasy from "speakeasy";

export const verify2FALogin = async (req, res) => {
  try {
    const { tempToken, token } = req.body;

    if (!tempToken || !token) {
      return res.status(400).json({ success: false, message: "Missing tokens" });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Temporary token expired or invalid" });
    }

    if (!decoded.isTemp) {
      return res.status(400).json({ success: false, message: "Invalid temporary token" });
    }

    const user = await User.findById(decoded.id).select("+twoFactorSecret");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: "2FA is not enabled for this user" });
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid 2FA token" });
    }

    // Generate real access token
    const finalToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: finalToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyEmail2FA = async (req, res) => {
  try {
    const { tempToken, otp, deviceId } = req.body;

    if (!tempToken || !otp || !deviceId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Temporary token expired or invalid" });
    }

    if (!decoded.isEmail2FA) {
      return res.status(400).json({ success: false, message: "Invalid token type" });
    }

    const user = await User.findById(decoded.id).select("+emailVerificationOTP");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpiry || user.emailVerificationOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired or is invalid. Please login again." });
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.emailVerificationOTP);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect verification code" });
    }

    // Mark device as trusted
    if (!user.trustedDevices.includes(deviceId)) {
      user.trustedDevices.push(deviceId);
    }

    // Clear OTP fields
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    // Check if user still needs TOTP (for admins/managers)
    if ((user.role === "admin" || user.role === "manager") && user.isTwoFactorEnabled) {
      const totpTempToken = jwt.sign(
        { id: user._id, role: user.role, isTemp: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      
      return res.json({
        success: true,
        requires2FA: true, // Needs authenticator app
        tempToken: totpTempToken,
      });
    }

    // Generate real access token
    const finalToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: finalToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verify = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const GENERIC_RESET_MESSAGE =
      "If an account with that email exists, a password reset link has been sent.";

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
      await user.save();

      eventBus.emit(EVENTS.PASSWORD_RESET_REQUESTED, { email: user.email, resetToken });
    }

    return res.status(200).json({
      success: true,
      message: GENERIC_RESET_MESSAGE,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to process password reset request",
    });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: err.message || "Failed to reset password",
      });
  }
}