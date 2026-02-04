import { DataSource } from 'typeorm';
import { Startup } from '../models/Startup';
import { Founder } from '../models/Founder';
import { StartupMetrics } from '../models/StartupMetrics';
import { StartupClaim } from '../models/StartupClaim';
import { StartupTeam } from '../models/StartupTeam';
import { StartupPhoto } from '../models/StartupPhoto';
import { StartupVerification } from '../models/StartupVerification';
import { StartupFollow } from '../models/StartupFollow';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'startup_platform',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Startup,
    Founder,
    StartupMetrics,
    StartupClaim,
    StartupTeam,
    StartupPhoto,
    StartupVerification,
    StartupFollow,
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
