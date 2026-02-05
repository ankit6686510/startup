import { DataSource } from 'typeorm';
import { User } from '@/models/User';
import { UserProfile } from '@/models/UserProfile';
import { UserSession } from '@/models/UserSession';
import { EmailVerification } from '@/models/EmailVerification';
import { PasswordReset } from '@/models/PasswordReset';
import { config } from './index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  // CRITICAL: Only synchronize in development. Never in production.
  synchronize: config.server.env === 'development',
  logging: config.server.env === 'development',
  entities: [
    User,
    UserProfile,
    UserSession,
    EmailVerification,
    PasswordReset
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: config.server.env === 'production' ? { rejectUnauthorized: false } : false,
  connectTimeoutMS: 60000,
  extra: {
    connectionLimit: 10,
    acquireTimeoutMillis: 60000,
    timeout: 60000,
  },
});