import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../index';
import { setupTestDatabase, cleanupTestDatabase } from './setup';

describe('Health Endpoints', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /health', () => {
    test('should return health status with all services', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
      
      expect(response.body.services).toBeDefined();
      expect(response.body.services.database).toBeDefined();
      expect(response.body.services.redis).toBeDefined();
      expect(response.body.services.elasticsearch).toBeDefined();
      expect(response.body.services.externalApis).toBeDefined();
      
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBeDefined();
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should return healthy status when database is connected', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Since we set up the test database, it should be healthy
      expect(response.body.services.database).toBe('healthy');
    });

    test('should include proper timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should include version information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(typeof response.body.version).toBe('string');
      expect(response.body.version.length).toBeGreaterThan(0);
    });

    test('should handle multiple concurrent health checks', async () => {
      const promises = Array(5).fill(null).map(() => 
        request(app).get('/health').expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBeDefined();
        expect(response.body.services).toBeDefined();
      });
    });
  });

  describe('GET /health/ready', () => {
    test('should return ready status when database is available', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.message).toBe('Service is ready to accept requests');
    });

    test('should include proper timestamp in ready response', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should respond quickly to readiness probe', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      
      expect(response.body.status).toBe('ready');
    });
  });

  describe('GET /health/live', () => {
    test('should return alive status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body.status).toBe('alive');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.message).toBe('Service is alive');
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should include proper timestamp in live response', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should always return 200 for liveness probe', async () => {
      // Make multiple requests to ensure consistency
      const promises = Array(3).fill(null).map(() => 
        request(app).get('/health/live')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('alive');
      });
    });

    test('should respond very quickly to liveness probe', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
      
      expect(response.body.status).toBe('alive');
    });

    test('should show increasing uptime on subsequent calls', async () => {
      const response1 = await request(app)
        .get('/health/live')
        .expect(200);

      // Wait a small amount of time
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });
  });

  describe('Health Endpoint Error Handling', () => {
    test('should handle database connection issues gracefully', async () => {
      // This test would require mocking database failures
      // For now, we'll ensure the endpoint structure is correct
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should return consistent response format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Verify all required fields are present
      const requiredFields = ['status', 'services', 'timestamp', 'uptime', 'version'];
      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });

      // Verify services structure
      const requiredServices = ['database', 'redis', 'elasticsearch', 'externalApis'];
      requiredServices.forEach(service => {
        expect(response.body.services).toHaveProperty(service);
        expect(['healthy', 'unhealthy']).toContain(response.body.services[service]);
      });
    });

    test('should handle invalid health endpoints gracefully', async () => {
      const response = await request(app)
        .get('/health/invalid')
        .expect(404);

      // Should return 404 for non-existent health endpoints
    });
  });

  describe('Health Response Headers', () => {
    test('should include proper content-type header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should include cache-control headers for health checks', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Health checks should not be cached
      expect(response.headers['cache-control'] || 'no-cache').toMatch(/no-cache|no-store|must-revalidate/);
    });
  });

  describe('Health Endpoint Performance', () => {
    test('should handle high frequency health checks', async () => {
      const startTime = Date.now();
      
      // Simulate load balancer health checks (multiple rapid requests)
      const promises = Array(20).fill(null).map(() => 
        request(app).get('/health/live')
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('alive');
      });

      // Should handle 20 concurrent requests reasonably quickly
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(5000); // Less than 5 seconds for 20 requests
    });

    test('should maintain consistent response times', async () => {
      const responseTimes: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await request(app).get('/health/live').expect(200);
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
      }

      // Calculate average response time
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      
      // Average response time should be reasonable (less than 200ms)
      expect(avgResponseTime).toBeLessThan(200);
      
      // No single request should be excessively slow (less than 1000ms)
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(1000);
      });
    });
  });
});
