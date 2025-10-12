import { DataSource } from 'typeorm';
import { FundingRound } from '@/models/FundingRound';
import { Investor } from '@/models/Investor';
import { Investment } from '@/models/Investment';
import { Valuation } from '@/models/Valuation';
import { MarketData } from '@/models/MarketData';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'startup_platform_funding',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    FundingRound,
    Investor,
    Investment,
    Valuation,
    MarketData
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