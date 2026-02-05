import { z } from 'zod';
import { commonSchemas, validateConfig } from '@startup-platform/config-validator';

const common = commonSchemas as any;

const envSchema = z.object({
  // Extend common schemas
  NODE_ENV: common.nodeEnv,
  PORT: common.port.default(3003),

  // Database
  DB_HOST: common.dbConfig.shape.host,
  DB_PORT: common.dbConfig.shape.port,
  DB_USERNAME: common.dbConfig.shape.username,
  DB_PASSWORD: common.dbConfig.shape.password,
  DB_NAME: common.dbConfig.shape.database,

  // Redis
  REDIS_HOST: common.redisConfig.shape.host,
  REDIS_PORT: common.redisConfig.shape.port,
  REDIS_PASSWORD: z.string().optional(),

  // Service URLs
  STARTUP_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  USER_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

// Validate and extract env vars
const env = validateConfig(envSchema as any);

export const config = {
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
  },
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  services: {
    startup: env.STARTUP_SERVICE_URL,
    user: env.USER_SERVICE_URL,
    notification: env.NOTIFICATION_SERVICE_URL,
  },
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
  },
};
