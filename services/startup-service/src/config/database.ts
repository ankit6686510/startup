import { DataSource } from 'typeorm';
import { Startup } from '../models/Startup';
import { Founder } from '../models/Founder';
import { StartupMetrics } from '../models/StartupMetrics';
import { StartupClaim } from '../models/StartupClaim';
import { StartupTeam } from '../models/StartupTeam';
import { StartupPhoto } from '../models/StartupPhoto';
import { StartupVerification } from '../models/StartupVerification';
import { StartupFollow } from '../models/StartupFollow';
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
  ssl: config.server.env === 'production' ? { rejectUnauthorized: false } : false,
  connectTimeoutMS: 60000,
  extra: {
    connectionLimit: 10,
    acquireTimeoutMillis: 60000,
    timeout: 60000,
  },
});
