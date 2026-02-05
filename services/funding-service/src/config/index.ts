import { z, commonSchemas, validateConfig } from '@startup-platform/config-validator';

const envSchema = z.object({
    // Extend common schemas
    NODE_ENV: commonSchemas.nodeEnv,
    PORT: commonSchemas.port.default(3004),

    // Database
    DB_HOST: commonSchemas.dbConfig.shape.host,
    DB_PORT: commonSchemas.dbConfig.shape.port,
    DB_USERNAME: commonSchemas.dbConfig.shape.username,
    DB_PASSWORD: commonSchemas.dbConfig.shape.password,
    DB_NAME: commonSchemas.dbConfig.shape.database,

    // Redis
    REDIS_HOST: commonSchemas.redisConfig.shape.host,
    REDIS_PORT: commonSchemas.redisConfig.shape.port,
    REDIS_PASSWORD: z.string().optional(),

    // Service URLs
    STARTUP_SERVICE_URL: z.string().url().default('http://localhost:3001'),
    USER_SERVICE_URL: z.string().url().default('http://localhost:3002'),
    NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3005'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

// Validate and extract env vars
const env = validateConfig(envSchema) as z.infer<typeof envSchema>;

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
