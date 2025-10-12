import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/test-database';
import { setupTestRedis, cleanupTestRedis } from '../setup/test-redis';
import TestHelpers from '../utils/test-helpers';

// Mock multiple services for E2E testing
const createE2ETestApp = () => {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Mock data stores
  const users: any[] = [];
  const startups: any[] = [];
  const jobs: any[] = [];
  const funding: any[] = [];
  const applications: any[] = [];
  
  let userIdCounter = 1;
  let startupIdCounter = 1;
  let jobIdCounter = 1;
  let fundingIdCounter = 1;
  let applicationIdCounter = 1;
  
  // Authentication middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    // Mock user from token
    req.user = users.find(u => u.id === 'user-1') || {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    };
    next();
  };
  
  // User endpoints
  app.post('/auth/register', (req: any, res: any) => {
    const { email, password, firstName, lastName, role = 'user' } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    if (users.find(u => u.email === email)) {
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
      role,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    
    users.push(user);
    
    res.status(201).json({
      success: true,
      data: {
        user,
        token: TestHelpers.generateAuthToken(user),
      },
    });
  });
  
  app.post('/auth/login', (req: any, res: any) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
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
  
  // Startup endpoints
  app.post('/startups', authenticate, (req: any, res: any) => {
    const { name, description, industry, stage, location, website } = req.body;
    
    if (!name || !description || !industry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const startup = {
      id: `startup-${startupIdCounter++}`,
      name,
      description,
      industry,
      stage: stage || 'idea',
      location,
      website,
      founderId: req.user.id,
      createdAt: new Date().toISOString(),
    };
    
    startups.push(startup);
    
    res.status(201).json({
      success: true,
      data: startup,
    });
  });
  
  app.get('/startups', (req: any, res: any) => {
    const { page = 1, limit = 10, industry, stage } = req.query;
    
    let filteredStartups = [...startups];
    
    if (industry) {
      filteredStartups = filteredStartups.filter(s => s.industry === industry);
    }
    
    if (stage) {
      filteredStartups = filteredStartups.filter(s => s.stage === stage);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedStartups = filteredStartups.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedStartups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredStartups.length,
        pages: Math.ceil(filteredStartups.length / limit),
      },
    });
  });
  
  // Job endpoints
  app.post('/jobs', authenticate, (req: any, res: any) => {
    const { title, description, company, location, type, salary, requirements } = req.body;
    
    if (!title || !description || !company) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const job = {
      id: `job-${jobIdCounter++}`,
      title,
      description,
      company,
      location: location || 'Remote',
      type: type || 'full-time',
      salary,
      requirements: requirements || [],
      postedBy: req.user.id,
      createdAt: new Date().toISOString(),
    };
    
    jobs.push(job);
    
    res.status(201).json({
      success: true,
      data: job,
    });
  });
  
  app.get('/jobs', (req: any, res: any) => {
    const { page = 1, limit = 10, location, type, company } = req.query;
    
    let filteredJobs = [...jobs];
    
    if (location) {
      filteredJobs = filteredJobs.filter(j => 
        j.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (type) {
      filteredJobs = filteredJobs.filter(j => j.type === type);
    }
    
    if (company) {
      filteredJobs = filteredJobs.filter(j => 
        j.company.toLowerCase().includes(company.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / limit),
      },
    });
  });
  
  // Job application endpoints
  app.post('/jobs/:jobId/apply', authenticate, (req: any, res: any) => {
    const { jobId } = req.params;
    const { coverLetter, resume } = req.body;
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }
    
    // Check if user already applied
    const existingApplication = applications.find(a => 
      a.jobId === jobId && a.applicantId === req.user.id
    );
    
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: 'Already applied to this job',
      });
    }
    
    const application = {
      id: `application-${applicationIdCounter++}`,
      jobId,
      applicantId: req.user.id,
      coverLetter,
      resume,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };
    
    applications.push(application);
    
    res.status(201).json({
      success: true,
      data: application,
    });
  });
  
  // Funding endpoints
  app.post('/funding', authenticate, (req: any, res: any) => {
    const { startupId, round, amount, currency, leadInvestor, valuation } = req.body;
    
    if (!startupId || !round || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const startup = startups.find(s => s.id === startupId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: 'Startup not found',
      });
    }
    
    const fundingRound = {
      id: `funding-${fundingIdCounter++}`,
      startupId,
      round,
      amount,
      currency: currency || 'USD',
      leadInvestor,
      valuation,
      announcedAt: new Date().toISOString(),
    };
    
    funding.push(fundingRound);
    
    res.status(201).json({
      success: true,
      data: fundingRound,
    });
  });
  
  app.get('/funding', (req: any, res: any) => {
    const { page = 1, limit = 10, round, minAmount, maxAmount } = req.query;
    
    let filteredFunding = [...funding];
    
    if (round) {
      filteredFunding = filteredFunding.filter(f => f.round === round);
    }
    
    if (minAmount) {
      filteredFunding = filteredFunding.filter(f => f.amount >= parseInt(minAmount));
    }
    
    if (maxAmount) {
      filteredFunding = filteredFunding.filter(f => f.amount <= parseInt(maxAmount));
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFunding = filteredFunding.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedFunding,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredFunding.length,
        pages: Math.ceil(filteredFunding.length / limit),
      },
    });
  });
  
  return app;
};

describe('StartupCompass Platform E2E Tests', () => {
  let app: any;
  let testUser: any;
  let authToken: string;
  
  beforeAll(async () => {
    await setupTestDatabase('e2e-test');
    await setupTestRedis();
    app = createE2ETestApp();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await cleanupTestRedis();
  });

  describe('Complete User Journey', () => {
    test('should complete full user registration and login flow', async () => {
      const userData = TestHelpers.generateTestData('user');
      
      // Register user
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      TestHelpers.expectSuccess(registerResponse, 201);
      expect(registerResponse.body.data).toHaveProperty('user');
      expect(registerResponse.body.data).toHaveProperty('token');
      
      testUser = registerResponse.body.data.user;
      authToken = registerResponse.body.data.token;
      
      // Login with same credentials
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      TestHelpers.expectSuccess(loginResponse);
      expect(loginResponse.body.data.user.email).toBe(userData.email);
    });
  });

  describe('Startup Management Flow', () => {
    test('should create and list startups', async () => {
      const startupData = TestHelpers.generateTestData('startup');
      
      // Create startup
      const createResponse = await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(startupData)
        .expect(201);

      TestHelpers.expectSuccess(createResponse, 201);
      expect(createResponse.body.data.name).toBe(startupData.name);
      expect(createResponse.body.data.founderId).toBe(testUser.id);
      
      const startupId = createResponse.body.data.id;
      
      // List startups
      const listResponse = await request(app)
        .get('/startups')
        .expect(200);

      TestHelpers.expectSuccess(listResponse);
      expect(listResponse.body.data).toBeInstanceOf(Array);
      expect(listResponse.body.data.length).toBeGreaterThan(0);
      expect(listResponse.body.data[0].id).toBe(startupId);
    });

    test('should filter startups by industry and stage', async () => {
      // Create startups with different industries
      const techStartup = TestHelpers.generateTestData('startup', {
        industry: 'Technology',
        stage: 'seed',
      });
      
      const healthStartup = TestHelpers.generateTestData('startup', {
        industry: 'Healthcare',
        stage: 'series-a',
      });
      
      await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(techStartup)
        .expect(201);
      
      await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(healthStartup)
        .expect(201);
      
      // Filter by industry
      const techResponse = await request(app)
        .get('/startups?industry=Technology')
        .expect(200);

      expect(techResponse.body.data.every((s: any) => s.industry === 'Technology')).toBe(true);
      
      // Filter by stage
      const seedResponse = await request(app)
        .get('/startups?stage=seed')
        .expect(200);

      expect(seedResponse.body.data.every((s: any) => s.stage === 'seed')).toBe(true);
    });
  });

  describe('Job Board Flow', () => {
    test('should create job and handle applications', async () => {
      const jobData = TestHelpers.generateTestData('job');
      
      // Create job
      const createJobResponse = await request(app)
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(201);

      TestHelpers.expectSuccess(createJobResponse, 201);
      expect(createJobResponse.body.data.title).toBe(jobData.title);
      
      const jobId = createJobResponse.body.data.id;
      
      // List jobs
      const listJobsResponse = await request(app)
        .get('/jobs')
        .expect(200);

      TestHelpers.expectSuccess(listJobsResponse);
      expect(listJobsResponse.body.data).toBeInstanceOf(Array);
      expect(listJobsResponse.body.pagination).toHaveProperty('total');
      
      // Apply to job
      const applicationData = {
        coverLetter: 'I am very interested in this position...',
        resume: 'https://example.com/resume.pdf',
      };
      
      const applyResponse = await request(app)
        .post(`/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);

      TestHelpers.expectSuccess(applyResponse, 201);
      expect(applyResponse.body.data.jobId).toBe(jobId);
      expect(applyResponse.body.data.applicantId).toBe(testUser.id);
      expect(applyResponse.body.data.status).toBe('pending');
      
      // Try to apply again (should fail)
      const duplicateApplyResponse = await request(app)
        .post(`/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(409);

      expect(duplicateApplyResponse.body.success).toBe(false);
      expect(duplicateApplyResponse.body.error).toContain('Already applied');
    });

    test('should filter jobs by location and type', async () => {
      const remoteJob = TestHelpers.generateTestData('job', {
        location: 'Remote',
        type: 'full-time',
      });
      
      const onsiteJob = TestHelpers.generateTestData('job', {
        location: 'San Francisco, CA',
        type: 'part-time',
      });
      
      await request(app)
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(remoteJob)
        .expect(201);
      
      await request(app)
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(onsiteJob)
        .expect(201);
      
      // Filter by location
      const remoteResponse = await request(app)
        .get('/jobs?location=Remote')
        .expect(200);

      expect(remoteResponse.body.data.every((j: any) => 
        j.location.includes('Remote')
      )).toBe(true);
      
      // Filter by type
      const fullTimeResponse = await request(app)
        .get('/jobs?type=full-time')
        .expect(200);

      expect(fullTimeResponse.body.data.every((j: any) => 
        j.type === 'full-time'
      )).toBe(true);
    });
  });

  describe('Funding Tracking Flow', () => {
    test('should create and track funding rounds', async () => {
      // First create a startup
      const startupData = TestHelpers.generateTestData('startup');
      const startupResponse = await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(startupData)
        .expect(201);
      
      const startupId = startupResponse.body.data.id;
      
      // Create funding round
      const fundingData = TestHelpers.generateTestData('funding', {
        startupId,
      });
      
      const createFundingResponse = await request(app)
        .post('/funding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundingData)
        .expect(201);

      TestHelpers.expectSuccess(createFundingResponse, 201);
      expect(createFundingResponse.body.data.startupId).toBe(startupId);
      expect(createFundingResponse.body.data.round).toBe(fundingData.round);
      expect(createFundingResponse.body.data.amount).toBe(fundingData.amount);
      
      // List funding rounds
      const listFundingResponse = await request(app)
        .get('/funding')
        .expect(200);

      TestHelpers.expectSuccess(listFundingResponse);
      expect(listFundingResponse.body.data).toBeInstanceOf(Array);
      expect(listFundingResponse.body.data.length).toBeGreaterThan(0);
    });

    test('should filter funding by round and amount', async () => {
      // Create startup first
      const startupData = TestHelpers.generateTestData('startup');
      const startupResponse = await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(startupData)
        .expect(201);
      
      const startupId = startupResponse.body.data.id;
      
      // Create different funding rounds
      const seedFunding = TestHelpers.generateTestData('funding', {
        startupId,
        round: 'Seed',
        amount: 1000000,
      });
      
      const seriesAFunding = TestHelpers.generateTestData('funding', {
        startupId,
        round: 'Series A',
        amount: 10000000,
      });
      
      await request(app)
        .post('/funding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(seedFunding)
        .expect(201);
      
      await request(app)
        .post('/funding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(seriesAFunding)
        .expect(201);
      
      // Filter by round
      const seedResponse = await request(app)
        .get('/funding?round=Seed')
        .expect(200);

      expect(seedResponse.body.data.every((f: any) => f.round === 'Seed')).toBe(true);
      
      // Filter by amount range
      const bigRoundsResponse = await request(app)
        .get('/funding?minAmount=5000000')
        .expect(200);

      expect(bigRoundsResponse.body.data.every((f: any) => 
        f.amount >= 5000000
      )).toBe(true);
    });
  });

  describe('Cross-Service Integration', () => {
    test('should handle complex workflow across multiple services', async () => {
      // 1. Create a startup
      const startupData = TestHelpers.generateTestData('startup');
      const startupResponse = await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(startupData)
        .expect(201);
      
      const startupId = startupResponse.body.data.id;
      
      // 2. Create a job for the startup
      const jobData = TestHelpers.generateTestData('job', {
        company: startupData.name,
      });
      
      const jobResponse = await request(app)
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(201);
      
      const jobId = jobResponse.body.data.id;
      
      // 3. Announce funding for the startup
      const fundingData = TestHelpers.generateTestData('funding', {
        startupId,
      });
      
      const fundingResponse = await request(app)
        .post('/funding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundingData)
        .expect(201);
      
      // 4. Apply to the job
      const applicationData = {
        coverLetter: 'Excited about this opportunity at a funded startup!',
        resume: 'https://example.com/resume.pdf',
      };
      
      const applicationResponse = await request(app)
        .post(`/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);
      
      // Verify all data is connected
      expect(startupResponse.body.data.name).toBe(startupData.name);
      expect(jobResponse.body.data.company).toBe(startupData.name);
      expect(fundingResponse.body.data.startupId).toBe(startupId);
      expect(applicationResponse.body.data.jobId).toBe(jobId);
    });

    test('should handle pagination across all services', async () => {
      // Test pagination for startups
      const startupsResponse = await request(app)
        .get('/startups?page=1&limit=5')
        .expect(200);

      expect(startupsResponse.body.pagination).toHaveProperty('page', 1);
      expect(startupsResponse.body.pagination).toHaveProperty('limit', 5);
      expect(startupsResponse.body.pagination).toHaveProperty('total');
      expect(startupsResponse.body.pagination).toHaveProperty('pages');
      
      // Test pagination for jobs
      const jobsResponse = await request(app)
        .get('/jobs?page=1&limit=3')
        .expect(200);

      expect(jobsResponse.body.pagination).toHaveProperty('page', 1);
      expect(jobsResponse.body.pagination).toHaveProperty('limit', 3);
      
      // Test pagination for funding
      const fundingResponse = await request(app)
        .get('/funding?page=1&limit=2')
        .expect(200);

      expect(fundingResponse.body.pagination).toHaveProperty('page', 1);
      expect(fundingResponse.body.pagination).toHaveProperty('limit', 2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid resource IDs gracefully', async () => {
      // Try to apply to non-existent job
      const response = await request(app)
        .post('/jobs/invalid-job-id/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          coverLetter: 'Test application',
          resume: 'https://example.com/resume.pdf',
        })
        .expect(404);

      TestHelpers.expectNotFound(response);
    });

    test('should handle unauthorized access properly', async () => {
      const startupData = TestHelpers.generateTestData('startup');
      
      const response = await request(app)
        .post('/startups')
        .send(startupData)
        .expect(401);

      TestHelpers.expectUnauthorized(response);
    });

    test('should validate required fields across all endpoints', async () => {
      // Test startup creation with missing fields
      const incompleteStartup = { name: 'Test Startup' }; // Missing description, industry
      
      const startupResponse = await request(app)
        .post('/startups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteStartup)
        .expect(400);

      TestHelpers.expectValidationError(startupResponse);
      
      // Test job creation with missing fields
      const incompleteJob = { title: 'Test Job' }; // Missing description, company
      
      const jobResponse = await request(app)
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteJob)
        .expect(400);

      TestHelpers.expectValidationError(jobResponse);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle concurrent requests across services', async () => {
      const promises = [];
      
      // Concurrent startup creation
      for (let i = 0; i < 5; i++) {
        const startupData = TestHelpers.generateTestData('startup');
        promises.push(
          request(app)
            .post('/startups')
            .set('Authorization', `Bearer ${authToken}`)
            .send(startupData)
        );
      }
      
      // Concurrent job creation
      for (let i = 0; i < 5; i++) {
        const jobData = TestHelpers.generateTestData('job');
        promises.push(
          request(app)
            .post('/jobs')
            .set('Authorization', `Bearer ${authToken}`)
            .send(jobData)
        );
      }
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should respond to list endpoints quickly', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        request(app).get('/startups'),
        request(app).get('/jobs'),
        request(app).get('/funding'),
      ]);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
    });
  });
});