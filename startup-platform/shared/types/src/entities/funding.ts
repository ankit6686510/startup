import { FundingRound, InvestorType, Currency, DataSource } from '../common/enums';

export interface FundingRoundData {
  id: string;
  startupId: string;
  roundType: FundingRound;
  amount: number;
  currency: Currency;
  amountUsd: number; // Normalized to USD for comparison
  announcedDate: Date;
  closedDate?: Date;
  valuation?: number;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  leadInvestor?: string;
  participants: string[]; // Investor IDs
  description?: string;
  sourceUrl?: string;
  dataSource: DataSource;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investor {
  id: string;
  name: string;
  slug: string;
  type: InvestorType;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: {
    country: string;
    city?: string;
  };
  foundedYear?: number;
  aum?: number; // Assets under management in USD
  typical_check_size?: {
    min: number;
    max: number;
    currency: Currency;
  };
  focus_stages?: FundingRound[];
  focus_industries?: string[];
  portfolio_count?: number;
  exits_count?: number;
  unicorns_count?: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    crunchbase?: string;
  };
  dataSource: DataSource;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundingParticipant {
  id: string;
  fundingRoundId: string;
  investorId: string;
  isLead: boolean;
  amount?: number; // Individual investment amount if known
  equity?: number; // Percentage equity received
  boardSeat?: boolean;
  notes?: string;
  createdAt: Date;
}

export interface InvestorPortfolio {
  id: string;
  investorId: string;
  startupId: string;
  first_investment_date: Date;
  total_invested?: number;
  total_rounds?: number;
  current_status: 'active' | 'exited' | 'failed';
  exit_type?: 'ipo' | 'acquisition' | 'merger' | 'buyout';
  exit_date?: Date;
  exit_valuation?: number;
  multiple?: number; // Return multiple
  createdAt: Date;
  updatedAt: Date;
}

export interface FundingNews {
  id: string;
  startupId: string;
  fundingRoundId?: string;
  title: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  amount?: number;
  currency?: Currency;
  roundType?: FundingRound;
  leadInvestor?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}

// Summary interfaces for lists/cards
export interface FundingSummary {
  startupId: string;
  startupName: string;
  totalFunding: number;
  lastRoundType: FundingRound;
  lastRoundAmount: number;
  lastRoundDate: Date;
  totalRounds: number;
  leadInvestors: string[];
  valuation?: number;
}

export interface InvestorSummary {
  id: string;
  name: string;
  slug: string;
  type: InvestorType;
  logoUrl?: string;
  portfolioCount: number;
  totalInvested?: number;
  focusStages: FundingRound[];
  location?: {
    country: string;
    city?: string;
  };
}

// Request/Response types
export interface CreateFundingRoundRequest {
  startupId: string;
  roundType: FundingRound;
  amount: number;
  currency: Currency;
  announcedDate: Date;
  closedDate?: Date;
  valuation?: number;
  leadInvestor?: string;
  participants: {
    investorId: string;
    isLead: boolean;
    amount?: number;
    boardSeat?: boolean;
  }[];
  description?: string;
  sourceUrl?: string;
}

export interface UpdateFundingRoundRequest extends Partial<CreateFundingRoundRequest> {
  id: string;
}

export interface CreateInvestorRequest {
  name: string;
  type: InvestorType;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: {
    country: string;
    city?: string;
  };
  foundedYear?: number;
  focusStages?: FundingRound[];
  focusIndustries?: string[];
  typicalCheckSize?: {
    min: number;
    max: number;
    currency: Currency;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    crunchbase?: string;
  };
}

export interface UpdateInvestorRequest extends Partial<CreateInvestorRequest> {
  id: string;
}

// Analytics types
export interface FundingTrends {
  period: string; // 'month', 'quarter', 'year'
  totalAmount: number;
  totalDeals: number;
  averageDealSize: number;
  medianDealSize: number;
  byStage: {
    stage: FundingRound;
    amount: number;
    deals: number;
  }[];
  byIndustry: {
    industry: string;
    amount: number;
    deals: number;
  }[];
  topInvestors: {
    investorId: string;
    investorName: string;
    deals: number;
    totalInvested: number;
  }[];
}

export interface MarketInsights {
  hotSectors: string[];
  emergingInvestors: string[];
  averageValuation: number;
  medianValuation: number;
  timeToClose: number; // average days
  successRate: number; // percentage of successful closes
}
