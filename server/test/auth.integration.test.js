import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Auth Endpoints Integration Tests', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    adminSecret: 'test_admin_secret'
  };

  describe('POST /api/auth/signup', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account created successfully! Welcome!');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(validUser.email);
    });

    it('should fail registration with duplicate email', async () => {
      // Create user first
      await request(app).post('/api/auth/signup').send(validUser);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should successfully register an admin with correct secret', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(adminUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('admin');
    });

    it('should fail admin registration with incorrect secret', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ ...adminUser, adminSecret: 'wrong_secret' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid Admin Secret Key');
    });

    it('should fail validation when payload is invalid (schema validation)', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'not-an-email', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create a user for login tests
      await request(app).post('/api/auth/signup').send(validUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Incorrect password');
    });

    it('should fail login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /api/auth/verify', () => {
    let token;

    beforeAll(async () => {
      const response = await request(app).post('/api/auth/signup').send(validUser);
      token = response.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(validUser.email);
    });

    it('should fail access without token', async () => {
      const response = await request(app).get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access Denied. No token provided.');
    });

    it('should fail access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token.');
    });
  });
});
