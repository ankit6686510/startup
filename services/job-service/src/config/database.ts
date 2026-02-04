import { DataSource } from 'typeorm';
import { Job } from '@/models/Job';
import { JobApplication } from '@/models/JobApplication';
import { SavedJob } from '@/models/SavedJob';
import { JobAlert } from '@/models/JobAlert';
import { JobView } from '@/models/JobView';
import { JobAnalytics } from '@/models/JobAnalytics';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'startup_platform_jobs',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Job,
    JobApplication,
    SavedJob,
    JobAlert,
    JobView,
    JobAnalytics
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