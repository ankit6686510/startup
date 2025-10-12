# Integration Tests for Startup Service

This directory contains comprehensive integration tests for all startup service endpoints.

## Test Structure

```
src/tests/
├── setup.ts          # Test database setup and utilities
├── jest.setup.js     # Jest environment configuration
├── startup.test.ts   # Startup endpoint tests
├── founder.test.ts   # Founder endpoint tests
├── health.test.ts    # Health check endpoint tests
└── README.md         # This file
```

## Running Tests

### Prerequisites

1. **PostgreSQL Database**: Ensure PostgreSQL is running locally
2. **Test Database**: Create a test database (configured in jest.setup.js)
3. **Environment**: Copy `.env.example` to `.env` and configure test values

```bash
# Install dependencies
npm install

# Set up test database
createdb startupcompass_test
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Set up test data and run integration tests
npm run test:all
```

### Environment Variables for Testing

```bash
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=startupcompass_test
DB_USER=postgres
DB_PASSWORD=test
JWT_SECRET=test-jwt-secret
LOG_LEVEL=error
```

## Test Coverage

### Startup Endpoints (`startup.test.ts`)
- ✅ GET `/api/v1/startups` - List startups with pagination and filtering
- ✅ POST `/api/v1/startups` - Create new startup with founders
- ✅ GET `/api/v1/startups/:id` - Get startup by ID
- ✅ GET `/api/v1/startups/slug/:slug` - Get startup by slug
- ✅ PUT `/api/v1/startups/:id` - Update startup
- ✅ DELETE `/api/v1/startups/:id` - Delete startup
- ✅ GET `/api/v1/startups/search` - Search startups
- ✅ GET `/api/v1/startups/featured` - Get featured startups
- ✅ GET `/api/v1/startups/stats` - Get platform statistics
- ✅ GET `/api/v1/startups/industry/:industry` - Get startups by industry

### Founder Endpoints (`founder.test.ts`)
- ✅ GET `/api/v1/founders/:startupId` - Get founders for startup
- ✅ GET `/api/v1/founders/detail/:id` - Get founder details
- ✅ PUT `/api/v1/founders/:id` - Update founder information

### Health Endpoints (`health.test.ts`)
- ✅ GET `/health` - Comprehensive health check
- ✅ GET `/health/ready` - Readiness probe
- ✅ GET `/health/live` - Liveness probe

## Test Features

### 🔧 **Database Management**
- Automatic test database setup and teardown
- Clean slate for each test (data isolation)
- Migration handling

### 🔐 **Authentication Testing**
- JWT token generation for test users
- Role-based access testing (user, admin)
- Authentication middleware validation

### 📊 **Data Validation**
- Input validation testing
- Error response validation
- Data consistency checks

### 🚀 **Performance Testing**
- Response time validation
- Concurrent request handling
- Load testing for health endpoints

### 🛡️ **Error Handling**
- 404 error responses
- Validation error responses
- Database error simulation
- Malformed request handling

## Test Data Helpers

The tests include utility functions for creating consistent test data:

```typescript
// Create test startup
const startup = createTestStartup({
  name: 'Custom Startup',
  industry: 'AI_ML'
});

// Create test founder
const founder = createTestFounder({
  name: 'Jane Doe',
  title: 'CTO'
});

// Generate JWT tokens
const userToken = generateTestToken();
const adminToken = generateAdminToken();
```

## Debugging Tests

### Verbose Mode
```bash
JEST_VERBOSE=true npm test
```

### Run Single Test File
```bash
npm test startup.test.ts
npm test founder.test.ts
npm test health.test.ts
```

### Run Specific Test
```bash
npm test -- --testNamePattern="should create startup"
```

### Coverage Reports
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

## CI/CD Integration

These tests are designed to run in continuous integration environments:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Database Schema Testing

Tests automatically handle:
- Database migrations
- Schema validation
- Foreign key constraints
- Index performance

## Monitoring & Metrics

Test results provide insights into:
- API response times
- Database query performance
- Error rates by endpoint
- Test coverage metrics

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify test database exists

2. **Port Conflicts**
   - Tests run on random available ports
   - Check for conflicting services

3. **Timeout Issues**
   - Increase Jest timeout in config
   - Check database query performance

4. **Memory Issues**
   - Tests run serially to avoid conflicts
   - Clear test data between tests

### Debug Commands

```bash
# Check database connection
npm run test -- --testNamePattern="database"

# Test specific endpoint
npm run test -- --testNamePattern="GET /api/v1/startups"

# Run with debugging
DEBUG=* npm test
