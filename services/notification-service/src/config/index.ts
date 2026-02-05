import { z, commonSchemas, validateConfig } from '@startup-platform/config-validator';

const envSchema = z.object({
    // Extend common schemas
    NODE_ENV: commonSchemas.nodeEnv,
    PORT: commonSchemas.port.default(3005),

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

    // SMTP
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().transform(Number).default('587'),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_SECURE: z.enum(['true', 'false']).transform(v => v === 'true').default('false'),
    FROM_EMAIL: z.string().email().default('noreply@startupcompass.com'),
    FROM_NAME: z.string().default('StartupCompass'),

    // Service URLs
    USER_SERVICE_URL: z.string().url().default('http://localhost:3002'),
    STARTUP_SERVICE_URL: z.string().url().default('http://localhost:3001'),
    JOB_SERVICE_URL: z.string().url().default('http://localhost:3003'),
    FUNDING_SERVICE_URL: z.string().url().default('http://localhost:3004'),
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
    email: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        secure: env.SMTP_SECURE,
        from: env.FROM_EMAIL,
        fromName: env.FROM_NAME,
    },
    services: {
        user: env.USER_SERVICE_URL,
        startup: env.STARTUP_SERVICE_URL,
        job: env.JOB_SERVICE_URL,
        funding: env.FUNDING_SERVICE_URL,
    },
    cors: {
        allowedOrigins: env.ALLOWED_ORIGINS.split(','),
    },
};
