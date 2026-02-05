import { z } from 'zod';
import { commonSchemas, validateConfig } from '@startup-platform/config-validator';

const common = commonSchemas as any;

const envSchema = z.object({
  // Extend common schemas
  NODE_ENV: common.nodeEnv,
  PORT: common.port.default(3000),

  // JWT
  JWT_SECRET: common.jwtConfig.shape.secret,
  JWT_EXPIRES_IN: common.jwtConfig.shape.expiresIn,

  // Redis
  REDIS_HOST: common.redisConfig.shape.host,
  REDIS_PORT: common.redisConfig.shape.port,
  REDIS_PASSWORD: z.string().optional(),

  // Service URLs
  STARTUP_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  USER_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  JOB_SERVICE_URL: z.string().url().default('http://localhost:3003'),
  FUNDING_SERVICE_URL: z.string().url().default('http://localhost:3004'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  NEWS_AGGREGATOR_URL: z.string().url().default('http://localhost:3006'),

  // CORS & Rate Limit
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FILE: z.string().default('logs/api-gateway.log'),

  // API
  API_VERSION: z.string().default('v1'),
});

// Validate and extract env vars
const env = validateConfig(envSchema as any) as z.infer<typeof envSchema>;

export const config = {
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  services: {
    startup: env.STARTUP_SERVICE_URL,
    user: env.USER_SERVICE_URL,
    job: env.JOB_SERVICE_URL,
    funding: env.FUNDING_SERVICE_URL,
    notification: env.NOTIFICATION_SERVICE_URL,
    newsAggregator: env.NEWS_AGGREGATOR_URL,
  },
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },
  api: {
    version: env.API_VERSION,
  },
};