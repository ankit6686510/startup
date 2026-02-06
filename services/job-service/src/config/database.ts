import { DataSource } from 'typeorm';
import { Job } from '@/models/Job';
import { JobApplication } from '@/models/JobApplication';
import { SavedJob } from '@/models/SavedJob';
import { JobAlert } from '@/models/JobAlert';
import { JobView } from '@/models/JobView';
import { JobAnalytics } from '@/models/JobAnalytics';
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
  entities: [Job, JobApplication, SavedJob, JobAlert, JobView, JobAnalytics],
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
