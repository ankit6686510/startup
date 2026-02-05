import {
  Industry,
  FundingRound,
  JobType,
  WorkLocation,
  ExperienceLevel,
  JobCategory,
  StartupStatus,
  NewsType,
} from '../common/enums';
import { LocationFilter } from '../common/location';

// Base filter interface
export interface BaseFilter {
  field: string;
  value: any;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'exists';
}

// Startup filters
export interface StartupFilters {
  industry?: Industry[];
  status?: StartupStatus[];
  fundingStage?: FundingRound[];
  location?: LocationFilter;
  foundedYear?: {
    min?: number;
    max?: number;
  };
  funding?: {
    min?: number;
    max?: number;
  };
  employeeCount?: {
    min?: number;
    max?: number;
  };
  verified?: boolean;
  hasJobs?: boolean;
  hasFunding?: boolean;
  tags?: string[];
}

// Job filters
export interface JobFilters {
  type?: JobType[];
  category?: JobCategory[];
  experienceLevel?: ExperienceLevel[];
  workLocation?: WorkLocation[];
  location?: LocationFilter;
  postedDate?: {
    days?: number; // Posted within last N days
    after?: Date;
    before?: Date;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  hasEquity?: boolean;
  isActive?: boolean;
  featured?: boolean;
  urgent?: boolean;
  skills?: string[];
  benefits?: string[];
  startupStage?: FundingRound[];
  startupIndustry?: Industry[];
}

// Funding filters
export interface FundingFilters {
  roundType?: FundingRound[];
  amount?: {
    min?: number;
    max?: number;
  };
  date?: {
    after?: Date;
    before?: Date;
  };
  investors?: string[]; // Investor IDs
  investorTypes?: string[];
  location?: LocationFilter;
  verified?: boolean;
  hasLead?: boolean;
}

// News filters
export interface NewsFilters {
  type?: NewsType[];
  publishedDate?: {
    days?: number;
    after?: Date;
    before?: Date;
  };
  sources?: string[];
  verified?: boolean;
  sentiment?: ('positive' | 'neutral' | 'negative')[];
  startups?: string[]; // Startup IDs
  tags?: string[];
  hasImage?: boolean;
}

// User filters
export interface UserFilters {
  role?: string[];
  status?: string[];
  location?: LocationFilter;
  joinedDate?: {
    after?: Date;
    before?: Date;
  };
  emailVerified?: boolean;
  lastActive?: {
    days?: number;
    after?: Date;
  };
  hasStartupAffiliation?: boolean;
}

// Investor filters
export interface InvestorFilters {
  type?: string[];
  location?: LocationFilter;
  focusStages?: FundingRound[];
  focusIndustries?: Industry[];
  checkSize?: {
    min?: number;
    max?: number;
  };
  aum?: {
    min?: number;
    max?: number;
  };
  portfolioSize?: {
    min?: number;
    max?: number;
  };
  exitCount?: {
    min?: number;
    max?: number;
  };
  verified?: boolean;
}

// Filter presets for common use cases
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  category: 'startups' | 'jobs' | 'funding' | 'news' | 'investors';
  filters: Record<string, any>;
  isPublic: boolean;
  createdBy?: string;
  usageCount?: number;
}

// Common filter presets
export const STARTUP_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'hot-ai-startups',
    name: 'Hot AI Startups',
    description: 'AI/ML startups with recent funding',
    category: 'startups',
    filters: {
      industry: ['ai_ml'],
      fundingStage: ['seed', 'series_a', 'series_b'],
      status: ['active'],
      verified: true,
    },
    isPublic: true,
  },
  {
    id: 'unicorn-companies',
    name: 'Unicorn Companies',
    description: 'Startups valued at $1B+',
    category: 'startups',
    filters: {
      funding: { min: 1000000000 },
      status: ['active'],
    },
    isPublic: true,
  },
  {
    id: 'early-stage-fintech',
    name: 'Early Stage Fintech',
    description: 'Pre-seed to Series A fintech companies',
    category: 'startups',
    filters: {
      industry: ['fintech'],
      fundingStage: ['pre_seed', 'seed', 'series_a'],
      status: ['active'],
    },
    isPublic: true,
  },
];

export const JOB_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'remote-engineering',
    name: 'Remote Engineering Jobs',
    description: 'Remote software engineering positions',
    category: 'jobs',
    filters: {
      category: ['engineering'],
      workLocation: ['remote'],
      isActive: true,
    },
    isPublic: true,
  },
  {
    id: 'senior-product-roles',
    name: 'Senior Product Roles',
    description: 'Senior product management positions',
    category: 'jobs',
    filters: {
      category: ['product'],
      experienceLevel: ['senior', 'lead', 'principal'],
      isActive: true,
    },
    isPublic: true,
  },
  {
    id: 'startup-founding-team',
    name: 'Founding Team Roles',
    description: 'Early employee opportunities at startups',
    category: 'jobs',
    filters: {
      startupStage: ['pre_seed', 'seed'],
      hasEquity: true,
      isActive: true,
    },
    isPublic: true,
  },
];

// Dynamic filter building
export interface FilterBuilder {
  addFilter(filter: BaseFilter): FilterBuilder;
  addMultipleFilters(filters: BaseFilter[]): FilterBuilder;
  removeFilter(field: string): FilterBuilder;
  clearFilters(): FilterBuilder;
  build(): Record<string, any>;
}

// Filter validation
export interface FilterValidationRule {
  field: string;
  required?: boolean;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  min?: number;
  max?: number;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean;
}

export interface FilterValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// Filter analytics
export interface FilterUsageStats {
  field: string;
  usageCount: number;
  popularValues: {
    value: any;
    count: number;
  }[];
  lastUsed: Date;
}

export interface FilterPerformanceMetrics {
  field: string;
  averageQueryTime: number;
  indexEfficiency: number;
  resultAccuracy: number;
}
