// Startup data types and interfaces

export type FundingStage = 'IDEA' | 'SEED' | 'SERIES_A' | 'SERIES_B' | 'SERIES_C' | 'SERIES_D' | 'SERIES_E' | 'GROWTH' | 'LATE_STAGE' | 'PUBLIC';
export type StartupStatus = 'ACTIVE' | 'ACQUIRED' | 'CLOSED' | 'PIVOT';
export type EmployeeRange = '1-10' | '11-50' | '51-100' | '101-500' | '501-1000' | '1000+';

// Core Startup Interface
export interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo?: string;
  website?: string;
  founded: string; // ISO date
  status: StartupStatus;

  // Basic Info
  industry: string;
  subIndustries?: string[];
  location: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Team
  foundersCount: number;
  founders?: Founder[];
  employeeCount?: EmployeeRange;

  // Funding
  fundingStage: FundingStage;
  totalFunded: number; // in USD
  lastFundingRound?: FundingRound;
  fundingHistory?: FundingRound[];

  // Metrics
  followersCount: number;
  isFollowing?: boolean;
  isSaved?: boolean;

  // Media
  images?: string[];
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    crunchbase?: string;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;

  // UI Flags
  tags?: string[];
  verified?: boolean;
  trending?: boolean;
}

// Founder/Team Member
export interface Founder {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  linkedIn?: string;
  twitter?: string;
}

// Funding Round
export interface FundingRound {
  id: string;
  stage: FundingStage;
  amount: number; // in USD
  currency: string;
  date: string; // ISO date
  investors?: string[];
  description?: string;
}

// Job Opening (related to startup)
export interface StartupJob {
  id: string;
  startupId: string;
  title: string;
  description: string;
  location: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt: string;
  applicants?: number;
}

// News/Press Article
export interface StartupNews {
  id: string;
  startupId: string;
  title: string;
  summary: string;
  content?: string;
  image?: string;
  source: string;
  sourceUrl: string;
  category: 'FUNDING' | 'PRODUCT' | 'PARTNERSHIP' | 'HIRING' | 'AWARD' | 'OTHER';
  publishedAt: string;
}

// Startup Detailed View (includes related data)
export interface StartupDetail extends Startup {
  team: Founder[];
  jobOpenings: StartupJob[];
  news: StartupNews[];
  relatedStartups?: Startup[];
}

// Search & Filter Options
export interface StartupFilters {
  search?: string;
  industries?: string[];
  fundingStages?: FundingStage[];
  minFunding?: number;
  maxFunding?: number;
  locations?: string[];
  status?: StartupStatus[];
  employeeCount?: EmployeeRange[];
  sortBy?: 'TRENDING' | 'NEWEST' | 'FUNDING' | 'FOLLOWERS' | 'NAME';
  sortOrder?: 'ASC' | 'DESC';
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Startup Comparison
export interface StartupComparison {
  startups: Startup[];
  metrics: {
    name: string;
    values: Array<number | string>;
  }[];
}

// Trending Startup
export interface TrendingStartup extends Startup {
  trendScore: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

// Industry Stats
export interface IndustryStats {
  name: string;
  count: number;
  totalFunding: number;
  averageFunding: number;
}

// Search Result
export interface StartupSearchResult {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  industry: string;
  location: {
    city: string;
    country: string;
  };
  fundingStage: FundingStage;
  totalFunded: number;
}
