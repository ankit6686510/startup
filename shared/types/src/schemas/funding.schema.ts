import { z } from 'zod';
import { FundingRound, InvestorType, Currency, DataSource } from '../common/enums';

// Funding round schema
export const FundingRoundSchema = z.object({
  id: z.string().uuid().optional(),
  startupId: z.string().uuid(),
  roundType: z.nativeEnum(FundingRound),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.nativeEnum(Currency),
  amountUsd: z.number().min(0).optional(),
  announcedDate: z.date(),
  closedDate: z.date().optional(),
  valuation: z.number().min(0).optional(),
  preMoneyValuation: z.number().min(0).optional(),
  postMoneyValuation: z.number().min(0).optional(),
  leadInvestor: z.string().optional(),
  participants: z.array(z.string().uuid()),
  description: z.string().max(1000).optional(),
  sourceUrl: z.string().url().optional(),
  dataSource: z.nativeEnum(DataSource),
  verified: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Investor schema
export const InvestorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  type: z.nativeEnum(InvestorType),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  location: z.object({
    country: z.string(),
    city: z.string().optional()
  }).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  aum: z.number().min(0).optional(),
  typical_check_size: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.nativeEnum(Currency)
  }).optional(),
  focus_stages: z.array(z.nativeEnum(FundingRound)).optional(),
  focus_industries: z.array(z.string()).optional(),
  portfolio_count: z.number().min(0).optional(),
  exits_count: z.number().min(0).optional(),
  unicorns_count: z.number().min(0).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
    crunchbase: z.string().url().optional()
  }).optional(),
  dataSource: z.nativeEnum(DataSource),
  verified: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Create funding round request schema
export const CreateFundingRoundRequestSchema = z.object({
  startupId: z.string().uuid(),
  roundType: z.nativeEnum(FundingRound),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.nativeEnum(Currency),
  announcedDate: z.date(),
  closedDate: z.date().optional(),
  valuation: z.number().min(0).optional(),
  leadInvestor: z.string().optional(),
  participants: z.array(z.object({
    investorId: z.string().uuid(),
    isLead: z.boolean(),
    amount: z.number().min(0).optional(),
    boardSeat: z.boolean().optional()
  })),
  description: z.string().max(1000).optional(),
  sourceUrl: z.string().url().optional()
});

// Create investor request schema
export const CreateInvestorRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.nativeEnum(InvestorType),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  location: z.object({
    country: z.string(),
    city: z.string().optional()
  }).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  focusStages: z.array(z.nativeEnum(FundingRound)).optional(),
  focusIndustries: z.array(z.string()).optional(),
  typicalCheckSize: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.nativeEnum(Currency)
  }).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    crunchbase: z.string().url().optional()
  }).optional()
});

// Validation functions
export const validateFundingRound = (data: unknown) => FundingRoundSchema.safeParse(data);
export const validateInvestor = (data: unknown) => InvestorSchema.safeParse(data);
export const validateCreateFundingRoundRequest = (data: unknown) => CreateFundingRoundRequestSchema.safeParse(data);
export const validateCreateInvestorRequest = (data: unknown) => CreateInvestorRequestSchema.safeParse(data);

// Type exports
export type FundingRoundSchemaType = z.infer<typeof FundingRoundSchema>;
export type InvestorSchemaType = z.infer<typeof InvestorSchema>;
export type CreateFundingRoundRequestSchemaType = z.infer<typeof CreateFundingRoundRequestSchema>;
export type CreateInvestorRequestSchemaType = z.infer<typeof CreateInvestorRequestSchema>;
