import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const getTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS (or EMAIL_*).",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: Boolean(process.env.SMTP_SECURE) || port === 465,
    auth: { user, pass },
  });
};

export const sendPasswordResetEmail = async ({ to, resetToken }) => {
  const transporter = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

  await transporter.verify();
  await transporter.sendMail({
    from:
      process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject: "Reset your SmartPark password",
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your SmartPark password.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });

  return resetLink;
};

export const sendContactSupportEmail = async ({ name, email, subject, message }) => {
  const transporter = getTransporter();
  
  await transporter.verify();
  
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to: supportEmail,
    replyTo: email,
    subject: `Support Request: ${subject}`,
    html: `
      <h2>New Support Request from ${name}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  });
};

export const send2FAEmail = async ({ to, otp }) => {
  const transporter = getTransporter();

  await transporter.verify();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject: "Your SmartPark Login Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #1B42CB; text-align: center;">SmartPark Security</h2>
        <p>Hello,</p>
        <p>We noticed a login attempt from a new device. To verify your identity, please enter the following 6-digit code:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 5px; color: #111827;">${otp}</strong>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not attempt to log in, please secure your account by changing your password immediately.</p>
      </div>
    `
  });
};
