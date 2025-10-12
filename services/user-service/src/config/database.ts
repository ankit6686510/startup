import { DataSource } from 'typeorm';
import { User } from '@/models/User';
import { UserProfile } from '@/models/UserProfile';
import { UserSession } from '@/models/UserSession';
import { EmailVerification } from '@/models/EmailVerification';
import { PasswordReset } from '@/models/PasswordReset';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'startup_platform_users',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User, 
    UserProfile, 
    UserSession, 
    EmailVerification, 
    PasswordReset
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectTimeoutMS: 60000,
  extra: {
    connectionLimit: 10,
    acquireTimeoutMillis: 60000,
    timeout: 60000,
  },
});