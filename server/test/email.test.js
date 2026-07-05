import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';
import {
  sendPasswordResetEmail,
  sendContactSupportEmail,
  send2FAEmail,
} from '../utils/email';

vi.mock('nodemailer');

describe('Email Utility', () => {
  let mockSendMail;
  let mockVerify;

  beforeEach(() => {
    mockSendMail = vi.fn().mockResolvedValue(true);
    mockVerify = vi.fn().mockResolvedValue(true);

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
      verify: mockVerify,
    });

    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'password123';
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sendPasswordResetEmail sends an email with the correct reset link', async () => {
    const to = 'user@example.com';
    const resetToken = 'abc123token';

    const result = await sendPasswordResetEmail({ to, resetToken });

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        subject: 'Reset your SmartPark password',
        html: expect.stringContaining(`http://localhost:5173/reset-password/abc123token`),
      })
    );
    expect(result).toBe(`http://localhost:5173/reset-password/${resetToken}`);
  });

  it('sendContactSupportEmail sends an email to support with correct replyTo', async () => {
    process.env.SUPPORT_EMAIL = 'support@example.com';
    
    const params = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Help me',
      message: 'I have an issue.\nPlease help.',
    };

    await sendContactSupportEmail(params);

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'support@example.com',
        replyTo: 'john@example.com',
        subject: 'Support Request: Help me',
        html: expect.stringContaining('I have an issue.<br>Please help.'),
      })
    );
  });

  it('send2FAEmail sends an email with the OTP', async () => {
    const to = 'user@example.com';
    const otp = '123456';

    await send2FAEmail({ to, otp });

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        subject: 'Your SmartPark Login Verification Code',
        html: expect.stringContaining('123456'),
      })
    );
  });

  it('throws an error if SMTP environment variables are missing', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.EMAIL_HOST;

    await expect(sendPasswordResetEmail({ to: 'user@example.com', resetToken: '123' })).rejects.toThrow(
      /Email service is not configured/
    );
  });
});
