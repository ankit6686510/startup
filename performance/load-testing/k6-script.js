import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp-up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp-up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp-down to 0 users
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.1'],              // Custom error rate below 10%
    response_time: ['p(95)<2000'],     // Custom response time metric
  },
  
  // Test data
  ext: {
    loadimpact: {
      distribution: {
        'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
        'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 25 },
        'amazon:sg:singapore': { loadZone: 'amazon:sg:singapore', percent: 25 },
      },
    },
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'user1@example.com', password: 'TestPassword123!' },
  { email: 'user2@example.com', password: 'TestPassword123!' },
  { email: 'user3@example.com', password: 'TestPassword123!' },
];

const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce'];
const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
const fundingRounds = ['Seed', 'Series A', 'Series B', 'Series C'];

// Utility functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Authentication helper
function authenticate() {
  const user = randomChoice(testUsers);
  const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  requestCount.add(1);
  responseTime.add(response.timings.duration);
  
  const success = check(response, {
    'login status is 200 or 401': (r) => [200, 401].includes(r.status),
    'login response has data': (r) => r.status === 200 ? r.json('data') !== undefined : true,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  if (response.status === 200) {
    const data = response.json('data');
    return data.token;
  }
  
  return null;
}

// Main test function
export default function () {
  group('Health Checks', () => {
    // Basic health check
    const healthResponse = http.get(`${BASE_URL}/health`);
    requestCount.add(1);
    responseTime.add(healthResponse.timings.duration);
    
    const healthSuccess = check(healthResponse, {
      'health check status is 200': (r) => r.status === 200,
      'health check has status': (r) => r.json('status') !== undefined,
    });
    
    if (!healthSuccess) {
      errorRate.add(1);
    }
    
    // Readiness check
    const readyResponse = http.get(`${BASE_URL}/health/ready`);
    requestCount.add(1);
    responseTime.add(readyResponse.timings.duration);
    
    check(readyResponse, {
      'ready check status is 200': (r) => r.status === 200,
    });
    
    // Liveness check
    const liveResponse = http.get(`${BASE_URL}/health/live`);
    requestCount.add(1);
    responseTime.add(liveResponse.timings.duration);
    
    check(liveResponse, {
      'live check status is 200': (r) => r.status === 200,
    });
  });
  
  group('User Authentication', () => {
    const token = authenticate();
    
    if (token) {
      // Get user profile
      const profileResponse = http.get(`${BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      requestCount.add(1);
      responseTime.add(profileResponse.timings.duration);
      
      const profileSuccess = check(profileResponse, {
        'profile status is 200': (r) => r.status === 200,
        'profile has user data': (r) => r.json('data') !== undefined,
      });
      
      if (!profileSuccess) {
        errorRate.add(1);
      }
    }
  });
  
  group('Startup Browsing', () => {
    // List startups
    const startupsResponse = http.get(`${BASE_URL}/startups?page=${randomInt(1, 5)}&limit=${randomInt(10, 20)}&industry=${randomChoice(industries)}`);
    requestCount.add(1);
    responseTime.add(startupsResponse.timings.duration);
    
    const startupsSuccess = check(startupsResponse, {
      'startups list status is 200': (r) => r.status === 200,
      'startups list has data': (r) => r.json('data') !== undefined,
      'startups list has pagination': (r) => r.json('pagination') !== undefined,
    });
    
    if (!startupsSuccess) {
      errorRate.add(1);
    }
    
    // Get specific startup
    const startupResponse = http.get(`${BASE_URL}/startups/${randomInt(1, 100)}`);
    requestCount.add(1);
    responseTime.add(startupResponse.timings.duration);
    
    check(startupResponse, {
      'startup detail status is 200 or 404': (r) => [200, 404].includes(r.status),
    });
  });
  
  group('Job Search', () => {
    // Search jobs
    const jobsResponse = http.get(`${BASE_URL}/jobs?page=${randomInt(1, 3)}&limit=${randomInt(10, 30)}&type=${randomChoice(jobTypes)}&location=Remote`);
    requestCount.add(1);
    responseTime.add(jobsResponse.timings.duration);
    
    const jobsSuccess = check(jobsResponse, {
      'jobs list status is 200': (r) => r.status === 200,
      'jobs list has data': (r) => r.json('data') !== undefined,
      'jobs list has pagination': (r) => r.json('pagination') !== undefined,
    });
    
    if (!jobsSuccess) {
      errorRate.add(1);
    }
    
    // Get specific job
    const jobResponse = http.get(`${BASE_URL}/jobs/${randomInt(1, 50)}`);
    requestCount.add(1);
    responseTime.add(jobResponse.timings.duration);
    
    check(jobResponse, {
      'job detail status is 200 or 404': (r) => [200, 404].includes(r.status),
    });
  });
  
  group('Funding Data', () => {
    // List funding rounds
    const fundingResponse = http.get(`${BASE_URL}/funding?page=${randomInt(1, 3)}&limit=${randomInt(10, 20)}&round=${randomChoice(fundingRounds)}`);
    requestCount.add(1);
    responseTime.add(fundingResponse.timings.duration);
    
    const fundingSuccess = check(fundingResponse, {
      'funding list status is 200': (r) => r.status === 200,
      'funding list has data': (r) => r.json('data') !== undefined,
    });
    
    if (!fundingSuccess) {
      errorRate.add(1);
    }
    
    // Get specific funding round
    const fundingDetailResponse = http.get(`${BASE_URL}/funding/${randomInt(1, 30)}`);
    requestCount.add(1);
    responseTime.add(fundingDetailResponse.timings.duration);
    
    check(fundingDetailResponse, {
      'funding detail status is 200 or 404': (r) => [200, 404].includes(r.status),
    });
  });
  
  // Simulate user think time
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Starting load test for StartupCompass Platform');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test duration: ${options.stages.reduce((total, stage) => total + parseInt(stage.duration), 0)} minutes`);
  
  // Verify the application is running
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`Application health check failed: ${healthCheck.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function (runs once after all VUs finish)
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Base URL tested: ${data.baseUrl}`);
}

// Scenario-based testing
export const scenarios = {
  // Constant load scenario
  constant_load: {
    executor: 'constant-vus',
    vus: 10,
    duration: '5m',
    tags: { scenario: 'constant' },
  },
  
  // Ramping load scenario
  ramping_load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 0 },
    ],
    tags: { scenario: 'ramping' },
  },
  
  // Spike testing scenario
  spike_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '10s', target: 0 },
    ],
    tags: { scenario: 'spike' },
  },
  
  // Stress testing scenario
  stress_test: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '5m', target: 300 },
      { duration: '2m', target: 0 },
    ],
    tags: { scenario: 'stress' },
  },
  
  // Soak testing scenario (long duration)
  soak_test: {
    executor: 'constant-vus',
    vus: 50,
    duration: '30m',
    tags: { scenario: 'soak' },
  },
};

// Custom checks for business logic
export function businessLogicTests() {
  group('Business Logic Performance', () => {
    const token = authenticate();
    
    if (token) {
      // Test user registration performance
      const registrationData = {
        email: `loadtest${randomString()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Load',
        lastName: 'Test',
      };
      
      const regResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(registrationData), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      requestCount.add(1);
      responseTime.add(regResponse.timings.duration);
      
      check(regResponse, {
        'registration completes within 3s': (r) => r.timings.duration < 3000,
        'registration status is 201 or 409': (r) => [201, 409].includes(r.status),
      });
      
      // Test startup creation performance
      const startupData = {
        name: `LoadTest Startup ${randomString()}`,
        description: 'A startup created during load testing',
        industry: randomChoice(industries),
        stage: 'seed',
        location: 'San Francisco, CA',
      };
      
      const startupResponse = http.post(`${BASE_URL}/startups`, JSON.stringify(startupData), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      requestCount.add(1);
      responseTime.add(startupResponse.timings.duration);
      
      check(startupResponse, {
        'startup creation completes within 2s': (r) => r.timings.duration < 2000,
        'startup creation status is 201 or 401': (r) => [201, 401].includes(r.status),
      });
      
      // Test job posting performance
      const jobData = {
        title: `LoadTest Job ${randomString()}`,
        description: 'A job posted during load testing',
        company: 'LoadTest Company',
        location: 'Remote',
        type: randomChoice(jobTypes),
        salary: {
          min: 80000,
          max: 120000,
        },
      };
      
      const jobResponse = http.post(`${BASE_URL}/jobs`, JSON.stringify(jobData), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      requestCount.add(1);
      responseTime.add(jobResponse.timings.duration);
      
      check(jobResponse, {
        'job posting completes within 2s': (r) => r.timings.duration < 2000,
        'job posting status is 201 or 401': (r) => [201, 401].includes(r.status),
      });
    }
  });
}

// Export additional test functions
export { businessLogicTests };