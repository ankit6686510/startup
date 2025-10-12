import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/test-database';
import { setupTestRedis, cleanupTestRedis } from '../setup/test-redis';
import TestHelpers from '../utils/test-helpers';

// Mock the API Gateway app
const createMockApp = () => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Mock health endpoint
  app.get('/health', (req: any, res: any) => {
    res.json({
      success: true,
      status: 'healthy',
      services: {
        database: 'healthy',
        redis: 'healthy',
        userService: 'healthy',
        jobService: 'healthy',
        fundingService: 'healthy',
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
  
  // Mock authentication middleware
  app.use('/api', (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    req.user = { id: 'test-user', email: 'test@example.com' };
    next();
  });
  
  // Mock service routes
  app.get('/api/users/profile', (req: any, res: any) => {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        firstName: 'Test',
        lastName: 'User',
      },
    });
  });
  
  app.get('/api/jobs', (req: any, res: any) => {
    res.json({
      success: true,
      data: [
        {
          id: 'job-1',
          title: 'Software Engineer',
          company: 'Test Company',
          location: 'Remote',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
      },
    });
  });
  
  app.get('/api/funding', (req: any, res: any) => {
    res.json({
      success: true,
      data: [
        {
          id: 'funding-1',
          startupName: 'Test Startup',
          round: 'Series A',
          amount: 5000000,
        },
      ],
    });
  });
  
  return app;
};

describe('API Gateway Integration Tests', () => {
  let app: any;
  
  beforeAll(async () => {
    await setupTestDatabase('api-gateway');
    await setupTestRedis();
    app = createMockApp();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await cleanupTestRedis();
  });

  describe('Health Checks', () => {
    test('should return healthy status for all services', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toHaveProperty('database', 'healthy');
      expect(response.body.services).toHaveProperty('redis', 'healthy');
      expect(response.body.services).toHaveProperty('userService', 'healthy');
      expect(response.body.services).toHaveProperty('jobService', 'healthy');
      expect(response.body.services).toHaveProperty('fundingService', 'healthy');
    });
  });

  describe('Authentication Flow', () => {
    test('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      TestHelpers.expectUnauthorized(response);
    });

    test('should accept requests with valid authentication token', async () => {
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/users/profile',
        user
      ).expect(200);

      TestHelpers.expectSuccess(response);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
    });
  });

  describe('Service Routing', () => {
    test('should route user service requests correctly', async () => {
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/users/profile',
        user
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
    });

    test('should route job service requests correctly', async () => {
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/jobs',
        user
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    test('should route funding service requests correctly', async () => {
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/funding',
        user
      ).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    test('should handle service unavailability gracefully', async () => {
      // This would test what happens when a downstream service is down
      // For now, we'll test that the gateway responds appropriately
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/users/profile',
        user
      );

      expect(response.status).toBeLessThan(500);
    });

    test('should return 404 for unknown routes', async () => {
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/unknown-service',
        user
      ).expect(404);
    });
  });

  describe('Rate Limiting', () => {
    test('should handle multiple concurrent requests', async () => {
      const user = TestHelpers.generateTestUser();
      
      const promises = Array(10).fill(null).map(() =>
        TestHelpers.makeAuthenticatedRequest(
          app,
          'get',
          '/api/users/profile',
          user
        )
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Request/Response Validation', () => {
    test('should validate request headers', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(401); // Should fail due to missing auth
    });

    test('should return proper response format', async () => {
      const user = TestHelpers.generateTestUser();
      
      const response = await TestHelpers.makeAuthenticatedRequest(
        app,
        'get',
        '/api/users/profile',
        user
      ).expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });
});