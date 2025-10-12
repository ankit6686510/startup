import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import app from '../index';
import { setupTestDatabase, cleanupTestDatabase, createTestStartup, createTestFounder, generateTestToken, generateAdminToken } from './setup';
import { AppDataSource } from '../config/database';
import { Startup } from '../models/Startup';
import { Founder } from '../models/Founder';
import { v4 as uuidv4 } from 'uuid';

describe('Startup Endpoints', () => {
  let testToken: string;
  let adminToken: string;
  let testStartupId: string;
  let testFounderId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    testToken = generateTestToken();
    adminToken = generateAdminToken();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await AppDataSource.getRepository(Founder).delete({});
    await AppDataSource.getRepository(Startup).delete({});
  });

  describe('GET /api/v1/startups', () => {
    test('should return empty list when no startups exist', async () => {
      const response = await request(app)
        .get('/api/v1/startups')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.pagination.total).toBe(0);
    });

    test('should return startups with pagination', async () => {
      // Create test startups
      const startup1 = createTestStartup({ name: 'Startup 1', slug: 'startup-1' });
      const startup2 = createTestStartup({ name: 'Startup 2', slug: 'startup-2' });

      const startupRepo = AppDataSource.getRepository(Startup);
      await startupRepo.save([
        { id: uuidv4(), ...startup1 },
        { id: uuidv4(), ...startup2 }
      ]);

      const response = await request(app)
        .get('/api/v1/startups')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    test('should filter startups by industry', async () => {
      const startup1 = createTestStartup({ name: 'AI Startup', slug: 'ai-startup', industry: 'AI_ML' });
      const startup2 = createTestStartup({ name: 'Fintech Startup', slug: 'fintech-startup', industry: 'FINTECH' });

      const startupRepo = AppDataSource.getRepository(Startup);
      await startupRepo.save([
        { id: uuidv4(), ...startup1 },
        { id: uuidv4(), ...startup2 }
      ]);

      const response = await request(app)
        .get('/api/v1/startups?industry=AI_ML')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].industry).toBe('AI_ML');
    });

    test('should search startups by name', async () => {
      const startup1 = createTestStartup({ name: 'Amazing AI Startup', slug: 'amazing-ai-startup' });
      const startup2 = createTestStartup({ name: 'Boring Fintech App', slug: 'boring-fintech-app' });

      const startupRepo = AppDataSource.getRepository(Startup);
      await startupRepo.save([
        { id: uuidv4(), ...startup1 },
        { id: uuidv4(), ...startup2 }
      ]);

      const response = await request(app)
        .get('/api/v1/startups?search=Amazing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].name).toBe('Amazing AI Startup');
    });
  });

  describe('POST /api/v1/startups', () => {
    test('should create a new startup with founders', async () => {
      const startupData = {
        ...createTestStartup(),
        founders: [createTestFounder()]
      };

      const response = await request(app)
        .post('/api/v1/startups')
        .send(startupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startup.name).toBe(startupData.name);
      expect(response.body.data.message).toBe('Startup created successfully');

      // Verify startup was created in database
      const startupRepo = AppDataSource.getRepository(Startup);
      const createdStartup = await startupRepo.findOne({
        where: { name: startupData.name },
        relations: ['founders']
      });

      expect(createdStartup).toBeTruthy();
      expect(createdStartup!.founders).toHaveLength(1);
    });

    test('should return validation error for missing required fields', async () => {
      const invalidData = {
        name: '', // Empty name should fail validation
        description: 'Test'
      };

      const response = await request(app)
        .post('/api/v1/startups')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Name is required');
    });

    test('should return validation error for duplicate slug', async () => {
      const startupData = createTestStartup();
      
      // Create first startup
      const startupRepo = AppDataSource.getRepository(Startup);
      await startupRepo.save({ id: uuidv4(), ...startupData });

      // Try to create duplicate
      const duplicateData = {
        ...createTestStartup(),
        founders: [createTestFounder()]
      };

      const response = await request(app)
        .post('/api/v1/startups')
        .send(duplicateData)
        .expect(201); // Should succeed with auto-generated unique slug

      expect(response.body.success).toBe(true);
      expect(response.body.data.startup.slug).not.toBe(startupData.slug);
    });
  });

  describe('GET /api/v1/startups/:id', () => {
    beforeEach(async () => {
      // Create test startup
      const startupData = createTestStartup();
      const founderData = createTestFounder();

      const startupRepo = AppDataSource.getRepository(Startup);
      const founderRepo = AppDataSource.getRepository(Founder);

      const startup = await startupRepo.save({ id: uuidv4(), ...startupData });
      testStartupId = startup.id;

      await founderRepo.save({ 
        id: uuidv4(), 
        ...founderData, 
        startupId: testStartupId 
      });
    });

    test('should return startup by ID with founders', async () => {
      const response = await request(app)
        .get(`/api/v1/startups/${testStartupId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startup.id).toBe(testStartupId);
      expect(response.body.data.founders).toHaveLength(1);
    });

    test('should return 404 for non-existent startup', async () => {
      const nonExistentId = uuidv4();
      
      const response = await request(app)
        .get(`/api/v1/startups/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Startup not found');
    });

    test('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .get('/api/v1/startups/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid startup ID format');
    });
  });

  describe('GET /api/v1/startups/slug/:slug', () => {
    beforeEach(async () => {
      const startupData = createTestStartup();
      const startupRepo = AppDataSource.getRepository(Startup);
      const startup = await startupRepo.save({ id: uuidv4(), ...startupData });
      testStartupId = startup.id;
    });

    test('should return startup by slug', async () => {
      const response = await request(app)
        .get('/api/v1/startups/slug/test-startup')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startup.slug).toBe('test-startup');
    });

    test('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/v1/startups/slug/non-existent-slug')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Startup not found');
    });
  });

  describe('PUT /api/v1/startups/:id', () => {
    beforeEach(async () => {
      const startupData = createTestStartup();
      const startupRepo = AppDataSource.getRepository(Startup);
      const startup = await startupRepo.save({ id: uuidv4(), ...startupData });
      testStartupId = startup.id;
    });

    test('should update startup successfully', async () => {
      const updateData = {
        name: 'Updated Startup Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/v1/startups/${testStartupId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startup.name).toBe('Updated Startup Name');
      expect(response.body.data.message).toBe('Startup updated successfully');
    });

    test('should return 404 for non-existent startup', async () => {
      const nonExistentId = uuidv4();
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/v1/startups/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Startup not found');
    });
  });

  describe('DELETE /api/v1/startups/:id', () => {
    beforeEach(async () => {
      const startupData = createTestStartup();
      const startupRepo = AppDataSource.getRepository(Startup);
      const startup = await startupRepo.save({ id: uuidv4(), ...startupData });
      testStartupId = startup.id;
    });

    test('should delete startup successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/startups/${testStartupId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Startup deleted successfully');

      // Verify startup was deleted
      const startupRepo = AppDataSource.getRepository(Startup);
      const deletedStartup = await startupRepo.findOne({ where: { id: testStartupId } });
      expect(deletedStartup).toBeNull();
    });

    test('should return 404 for non-existent startup', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .delete(`/api/v1/startups/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Startup not found');
    });
  });

  describe('GET /api/v1/startups/search', () => {
    beforeEach(async () => {
      const startups = [
        createTestStartup({ name: 'AI Technology Startup', slug: 'ai-tech-startup', industry: 'AI_ML' }),
        createTestStartup({ name: 'Financial Services App', slug: 'fintech-app', industry: 'FINTECH' }),
        createTestStartup({ name: 'Health AI Platform', slug: 'health-ai', industry: 'HEALTHTECH' })
      ];

      const startupRepo = AppDataSource.getRepository(Startup);
      for (const startup of startups) {
        await startupRepo.save({ id: uuidv4(), ...startup });
      }
    });

    test('should search startups by query', async () => {
      const response = await request(app)
        .get('/api/v1/startups/search?q=AI')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.meta.searchQuery).toBe('AI');
    });

    test('should return 400 for empty search query', async () => {
      const response = await request(app)
        .get('/api/v1/startups/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Search query is required');
    });
  });

  describe('GET /api/v1/startups/featured', () => {
    beforeEach(async () => {
      const startups = [
        createTestStartup({ name: 'Featured Startup 1', slug: 'featured-1', verified: true, totalFunding: 1000000 }),
        createTestStartup({ name: 'Featured Startup 2', slug: 'featured-2', verified: true, totalFunding: 2000000 }),
        createTestStartup({ name: 'Unverified Startup', slug: 'unverified', verified: false })
      ];

      const startupRepo = AppDataSource.getRepository(Startup);
      for (const startup of startups) {
        await startupRepo.save({ id: uuidv4(), ...startup });
      }
    });

    test('should return featured startups (verified only)', async () => {
      const response = await request(app)
        .get('/api/v1/startups/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((startup: any) => {
        expect(startup.verified).toBe(true);
      });
    });

    test('should limit featured startups', async () => {
      const response = await request(app)
        .get('/api/v1/startups/featured?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/startups/stats', () => {
    beforeEach(async () => {
      const startups = [
        createTestStartup({ name: 'AI Startup', slug: 'ai-1', industry: 'AI_ML', verified: true }),
        createTestStartup({ name: 'Fintech Startup', slug: 'fintech-1', industry: 'FINTECH', verified: false }),
        createTestStartup({ name: 'Another AI', slug: 'ai-2', industry: 'AI_ML', verified: true })
      ];

      const startupRepo = AppDataSource.getRepository(Startup);
      for (const startup of startups) {
        await startupRepo.save({ id: uuidv4(), ...startup });
      }
    });

    test('should return platform statistics', async () => {
      const response = await request(app)
        .get('/api/v1/startups/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.verified).toBe(2);
      expect(response.body.data.byIndustry['AI_ML']).toBe(2);
      expect(response.body.data.byIndustry['FINTECH']).toBe(1);
    });
  });

  describe('GET /api/v1/startups/industry/:industry', () => {
    beforeEach(async () => {
      const startups = [
        createTestStartup({ name: 'AI Startup 1', slug: 'ai-1', industry: 'AI_ML' }),
        createTestStartup({ name: 'AI Startup 2', slug: 'ai-2', industry: 'AI_ML' }),
        createTestStartup({ name: 'Fintech Startup', slug: 'fintech-1', industry: 'FINTECH' })
      ];

      const startupRepo = AppDataSource.getRepository(Startup);
      for (const startup of startups) {
        await startupRepo.save({ id: uuidv4(), ...startup });
      }
    });

    test('should return startups by industry', async () => {
      const response = await request(app)
        .get('/api/v1/startups/industry/AI_ML')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((startup: any) => {
        expect(startup.industry).toBe('AI_ML');
      });
    });

    test('should return 400 for invalid industry', async () => {
      const response = await request(app)
        .get('/api/v1/startups/industry/INVALID_INDUSTRY')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid industry');
    });

    test('should limit results', async () => {
      const response = await request(app)
        .get('/api/v1/startups/industry/AI_ML?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
