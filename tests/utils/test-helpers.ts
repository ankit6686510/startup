import request from 'supertest';
import { Express } from 'express';
import jwt from 'jsonwebtoken';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export class TestHelpers {
  static generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      id: `test-user-${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      ...overrides,
    };
  }

  static generateAuthToken(user: TestUser): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  static async makeAuthenticatedRequest(
    app: Express,
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    user?: TestUser,
    data?: any
  ) {
    const testUser = user || this.generateTestUser();
    const token = this.generateAuthToken(testUser);
    
    const req = request(app)[method](path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    
    if (data && (method === 'post' || method === 'put')) {
      req.send(data);
    }
    
    return req;
  }

  static async expectValidationError(
    response: request.Response,
    field?: string
  ) {
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    
    if (field) {
      expect(response.body.error).toContain(field);
    }
  }

  static async expectUnauthorized(response: request.Response) {
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  }

  static async expectForbidden(response: request.Response) {
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  }

  static async expectNotFound(response: request.Response) {
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  }

  static async expectSuccess(
    response: request.Response,
    expectedStatus: number = 200
  ) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', true);
  }

  static generateTestData(type: string, overrides: any = {}) {
    const generators = {
      startup: () => ({
        name: `Test Startup ${Date.now()}`,
        description: 'A test startup for automated testing',
        industry: 'Technology',
        stage: 'seed',
        location: 'San Francisco, CA',
        website: 'https://test-startup.com',
        ...overrides,
      }),
      
      job: () => ({
        title: `Test Job ${Date.now()}`,
        description: 'A test job posting for automated testing',
        company: 'Test Company',
        location: 'Remote',
        type: 'full-time',
        salary: { min: 80000, max: 120000 },
        requirements: ['JavaScript', 'Node.js', 'TypeScript'],
        ...overrides,
      }),
      
      funding: () => ({
        startupId: `startup-${Date.now()}`,
        round: 'Series A',
        amount: 5000000,
        currency: 'USD',
        leadInvestor: 'Test Ventures',
        valuation: 25000000,
        ...overrides,
      }),
      
      user: () => ({
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        ...overrides,
      }),
    };

    const generator = generators[type as keyof typeof generators];
    if (!generator) {
      throw new Error(`Unknown test data type: ${type}`);
    }
    
    return generator();
  }

  static async waitFor(
    condition: () => Promise<boolean> | boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default TestHelpers;