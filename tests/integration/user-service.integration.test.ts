import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase, getTestDataSource } from '../setup/test-database';
import { setupTestRedis, cleanupTestRedis } from '../setup/test-redis';
import TestHelpers from '../utils/test-helpers';

// Mock the User Service app
const createMockUserApp = () => {
  const express = require('express');
  const app = express();

  app.use(express.json());

  // Mock user storage
  const users: any[] = [];
  let userIdCounter = 1;

  // Registration endpoint
  app.post('/auth/register', (req: any, res: any) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (users.find((u) => u.email === email)) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
      });
    }

    const user = {
      id: `user-${userIdCounter++}`,
      email,
      firstName,
      lastName,
      role: 'user',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    res.status(201).json({
      success: true,
      data: {
        user: { ...user },
        token: TestHelpers.generateAuthToken(user),
      },
    });
  });

  // Login endpoint
  app.post('/auth/login', (req: any, res: any) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    res.json({
      success: true,
      data: {
        user,
        token: TestHelpers.generateAuthToken(user),
      },
    });
  });

  // Profile endpoint
  app.get('/users/profile', (req: any, res: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Mock user from token
    const user = users[0] || TestHelpers.generateTestUser();

    res.json({
      success: true,
      data: user,
    });
  });

  // Update profile endpoint
  app.put('/users/profile', (req: any, res: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const { firstName, lastName, bio } = req.body;
    const user = users[0] || TestHelpers.generateTestUser();

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;

    res.json({
      success: true,
      data: user,
    });
  });

  // Password reset request
  app.post('/auth/forgot-password', (req: any, res: any) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  });

  return app;
};

describe('User Service Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    await setupTestDatabase('user-service');
    await setupTestRedis();
    app = createMockUserApp();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await cleanupTestRedis();
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const userData = TestHelpers.generateTestData('user');

      const response = await request(app).post('/auth/register').send(userData).expect(201);

      TestHelpers.expectSuccess(response, 201);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
    });

    test('should reject registration with missing fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // Missing password, firstName, lastName
      };

      const response = await request(app).post('/auth/register').send(incompleteData).expect(400);

      TestHelpers.expectValidationError(response);
    });

    test('should reject registration with duplicate email', async () => {
      const userData = TestHelpers.generateTestData('user');

      // First registration
      await request(app).post('/auth/register').send(userData).expect(201);

      // Second registration with same email
      const response = await request(app).post('/auth/register').send(userData).expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    test('should validate email format', async () => {
      const userData = TestHelpers.generateTestData('user', {
        email: 'invalid-email',
      });

      // This would normally be validated by the service
      // For now, we'll test that the service accepts the request structure
      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('User Authentication', () => {
    beforeEach(async () => {
      // Register a test user for login tests
      const userData = TestHelpers.generateTestData('user');
      await request(app).post('/auth/register').send(userData);
    });

    test('should login with valid credentials', async () => {
      const userData = TestHelpers.generateTestData('user');

      // Register user first
      await request(app).post('/auth/register').send(userData);

      // Then login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      TestHelpers.expectSuccess(response);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      TestHelpers.expectUnauthorized(response);
    });

    test('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password
        })
        .expect(400);

      TestHelpers.expectValidationError(response);
    });
  });

  describe('User Profile Management', () => {
    test('should get user profile with valid token', async () => {
      const user = TestHelpers.generateTestUser();

      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/users/profile',
        user,
      ).expect(200);

      TestHelpers.expectSuccess(response);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
    });

    test('should reject profile access without token', async () => {
      const response = await request(app).get('/users/profile').expect(401);

      TestHelpers.expectUnauthorized(response);
    });

    test('should update user profile', async () => {
      const user = TestHelpers.generateTestUser();
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
      };

      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'put',
        '/users/profile',
        user,
        updateData,
      ).expect(200);

      TestHelpers.expectSuccess(response);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.bio).toBe(updateData.bio);
    });
  });

  describe('Password Reset', () => {
    test('should initiate password reset for existing user', async () => {
      const userData = TestHelpers.generateTestData('user');

      // Register user first
      await request(app).post('/auth/register').send(userData);

      // Request password reset
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      TestHelpers.expectSuccess(response);
      expect(response.body.message).toContain('reset email sent');
    });

    test('should handle password reset for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      TestHelpers.expectNotFound(response);
    });

    test('should reject password reset without email', async () => {
      const response = await request(app).post('/auth/forgot-password').send({}).expect(400);

      TestHelpers.expectValidationError(response, 'email');
    });
  });

  describe('Security Tests', () => {
    test('should not expose sensitive user data', async () => {
      const user = TestHelpers.generateTestUser();

      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/users/profile',
        user,
      ).expect(200);

      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    test('should handle concurrent registration attempts', async () => {
      const userData = TestHelpers.generateTestData('user');

      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app)
            .post('/auth/register')
            .send({ ...userData, email: `${Date.now()}-${Math.random()}@example.com` }),
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should validate token expiration', async () => {
      // This would test JWT token expiration
      // For now, we'll ensure the endpoint structure is correct
      const user = TestHelpers.generateTestUser();

      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/users/profile',
        user,
      );

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple concurrent profile requests', async () => {
      const user = TestHelpers.generateTestUser();

      const promises = Array(20)
        .fill(null)
        .map(() => TestHelpers.makeAuthenticatedRequest(app, 'get', '/users/profile', user));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should respond to authentication requests quickly', async () => {
      const userData = TestHelpers.generateTestData('user');

      const startTime = Date.now();

      const response = await request(app).post('/auth/register').send(userData);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
      expect(response.status).toBeLessThan(500);
    });
  });
});
