import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

// Setup test database
export const setupTestDatabase = async () => {
  try {
    // Initialize test database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Run migrations
    await AppDataSource.runMigrations();

    logger.info('Test database setup completed');
  } catch (error) {
    logger.error('Test database setup failed:', error);
    throw error;
  }
};

// Cleanup test database
export const cleanupTestDatabase = async () => {
  try {
    if (AppDataSource.isInitialized) {
      // Clear all tables
      const entities = AppDataSource.entityMetadatas;

      for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        await repository.delete({});
      }

      await AppDataSource.destroy();
    }

    logger.info('Test database cleanup completed');
  } catch (error) {
    logger.error('Test database cleanup failed:', error);
    throw error;
  }
};

// Create test data helpers
export const createTestStartup = (overrides: any = {}) => ({
  name: 'Test Startup',
  slug: 'test-startup',
  description: 'A test startup for integration testing',
  website: 'https://test-startup.com',
  industry: 'AI_ML',
  foundedYear: 2023,
  vision: 'Test vision',
  mission: 'Test mission',
  locationCountry: 'United States',
  locationCountryCode: 'US',
  locationCity: 'San Francisco',
  locationState: 'California',
  locationRegion: 'North America',
  locationIsRemote: false,
  stage: 'GROWTH',
  status: 'ACTIVE',
  employeeCount: 10,
  tags: ['AI', 'Testing'],
  dataSource: 'USER_SUBMITTED',
  verified: false,
  ...overrides,
});

export const createTestFounder = (overrides: any = {}) => ({
  name: 'John Doe',
  title: 'CEO & Founder',
  bio: 'Test founder bio',
  email: 'john@test-startup.com',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  isPrimary: true,
  equity: 50.0,
  ...overrides,
});

// JWT token generation for tests
export const generateTestToken = () => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  return jwt.sign(
    {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
      verified: true,
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
};

export const generateAdminToken = () => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  return jwt.sign(
    {
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: 'admin',
      verified: true,
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
};
