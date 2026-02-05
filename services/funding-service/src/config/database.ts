import { DataSource } from 'typeorm';
import { FundingRound } from '@/models/FundingRound';
import { Investor } from '@/models/Investor';
import { Investment } from '@/models/Investment';
import { Valuation } from '@/models/Valuation';
import { MarketData } from '@/models/MarketData';
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
    FundingRound,
    Investor,
    Investment,
    Valuation,
    MarketData
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