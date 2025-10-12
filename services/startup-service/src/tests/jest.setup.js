// Jest setup file for environment variables and global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'startupcompass_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'error';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Suppress console.log in tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  if (process.env.JEST_VERBOSE === 'true') {
    originalConsoleLog(...args);
  }
};

console.error = (...args) => {
  originalConsoleError(...args);
};

// Global test helpers
global.testHelpers = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  generateRandomEmail: () => {
    return `test${Math.random().toString(36).substring(2)}@example.com`;
  }
};
