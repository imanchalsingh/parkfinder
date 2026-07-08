import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { validateRequest } from '../middleware/validate.js';
import { signupSchema } from '../validators/auth.validator.js';
import { errorHandler } from '../middleware/errorHandler.js';

describe('Validation Middleware', () => {
  const app = express();
  app.use(express.json());

  app.post('/test-signup', validateRequest(signupSchema), (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });

  app.use(errorHandler);

  it('should pass validation for a valid payload', async () => {
    const validPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/test-signup')
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(validPayload.email);
  });

  it('should fail validation when required fields are missing', async () => {
    const invalidPayload = {
      name: 'John Doe',
      // Missing email and password
    };

    const response = await request(app)
      .post('/test-signup')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toBeInstanceOf(Array);
    
    const fields = response.body.error.details.map(e => e.field);
    expect(fields).toContain('body.email');
    expect(fields).toContain('body.password');
  });

  it('should fail validation for invalid email format', async () => {
    const invalidPayload = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
    };

    const response = await request(app)
      .post('/test-signup')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].field).toBe('body.email');
  });
  
  it('should fail validation for short passwords', async () => {
    const invalidPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    };

    const response = await request(app)
      .post('/test-signup')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.error.details[0].field).toBe('body.password');
  });
});
