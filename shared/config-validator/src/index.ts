import { z } from 'zod';
export { z };
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env file if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Common configuration schemas shared across services
 */
export const commonSchemas = {
  /**
   * Node environment (development, production, test)
   */
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  /**
   * Server port
   */
  port: z.string().transform(Number).or(z.number()).default(3000),

  /**
   * Database credentials
   */
  dbConfig: z.object({
    host: z.string(),
    port: z.string().transform(Number).or(z.number()).default(5432),
    username: z.string(),
    password: z.string(),
    database: z.string(),
  }),

  /**
   * Redis configuration
   */
  redisConfig: z.object({
    host: z.string().default('localhost'),
    port: z.string().transform(Number).or(z.number()).default(6379),
  }),

  /**
   * JWT Configuration
   */
  jwtConfig: z.object({
    secret: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    expiresIn: z.string().default('7d'),
  }),
};

/**
 * Helper to validate configuration and exit if invalid
 */
export function validateConfig<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, unknown> = process.env,
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid configuration:', JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
}
