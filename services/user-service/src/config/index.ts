import { z } from 'zod';
import { commonSchemas, validateConfig } from '@startup-platform/config-validator';

const common = commonSchemas as any;

const envSchema = z.object({
  // Extend common schemas
  NODE_ENV: common.nodeEnv,
  PORT: common.port.default(3002),

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

  // JWT
  JWT_SECRET: common.jwtConfig.shape.secret,
  JWT_EXPIRES_IN: common.jwtConfig.shape.expiresIn,

  // SMTP
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .transform((v: string) => v === 'true')
    .default('false'),
  FROM_EMAIL: z.string().email().default('noreply@startupcompass.com'),
  FROM_NAME: z.string().default('StartupCompass'),

  // Service URLs
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
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
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    secure: env.SMTP_SECURE,
    from: env.FROM_EMAIL,
    fromName: env.FROM_NAME,
  },
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
  },
  urls: {
    frontend: env.FRONTEND_URL,
  },
};
