import { PaginationParams, SearchParams } from '../common/pagination';
import { LocationFilter } from '../common/location';
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

// Generic API request structure
export interface ApiRequest<T = any> {
  data?: T;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, string>;
}

// Startup API requests
export interface GetStartupsRequest extends PaginationParams {
  search?: string;
  industry?: Industry[];
  status?: StartupStatus[];
  fundingStage?: FundingRound[];
  location?: LocationFilter;
  foundedAfter?: Date;
  foundedBefore?: Date;
  minFunding?: number;
  maxFunding?: number;
  hasJobs?: boolean;
  verified?: boolean;
}

export interface GetStartupByIdRequest {
  id: string;
  includeFounders?: boolean;
  includeFunding?: boolean;
  includeJobs?: boolean;
  includeNews?: boolean;
  includeMetrics?: boolean;
}

export interface SearchStartupsRequest extends SearchParams {
  filters?: {
    industry?: Industry[];
    status?: StartupStatus[];
    fundingStage?: FundingRound[];
    location?: LocationFilter;
    foundedAfter?: Date;
    foundedBefore?: Date;
    minFunding?: number;
    maxFunding?: number;
  };
}

// Funding API requests
export interface GetFundingRoundsRequest extends PaginationParams {
  startupId?: string;
  roundType?: FundingRound[];
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  investorId?: string;
  verified?: boolean;
}

export interface GetInvestorsRequest extends PaginationParams {
  search?: string;
  type?: string[];
  location?: LocationFilter;
  focusStages?: FundingRound[];
  focusIndustries?: Industry[];
  minAum?: number;
  maxAum?: number;
}

// Job API requests
export interface GetJobsRequest extends PaginationParams {
  search?: string;
  startupId?: string;
  type?: JobType[];
  category?: JobCategory[];
  experienceLevel?: ExperienceLevel[];
  workLocation?: WorkLocation[];
  location?: LocationFilter;
  postedAfter?: Date;
  minSalary?: number;
  maxSalary?: number;
  hasEquity?: boolean;
  isActive?: boolean;
  featured?: boolean;
  skills?: string[];
}

export interface SearchJobsRequest extends SearchParams {
  filters?: {
    type?: JobType[];
    category?: JobCategory[];
    experienceLevel?: ExperienceLevel[];
    workLocation?: WorkLocation[];
    location?: LocationFilter;
    postedAfter?: Date;
    minSalary?: number;
    maxSalary?: number;
    hasEquity?: boolean;
    skills?: string[];
  };
}

// News API requests
export interface GetNewsRequest extends PaginationParams {
  search?: string;
  type?: NewsType[];
  startupId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sources?: string[];
  verified?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative'[];
}

export interface SearchNewsRequest extends SearchParams {
  filters?: {
    type?: NewsType[];
    startupId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sources?: string[];
    verified?: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative'[];
  };
}

// User API requests
export interface GetUsersRequest extends PaginationParams {
  search?: string;
  role?: string[];
  status?: string[];
  location?: LocationFilter;
  joinedAfter?: Date;
  emailVerified?: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  location?: {
    country: string;
    city?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

// Analytics API requests
export interface GetAnalyticsRequest {
  metric: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: Date;
  endDate?: Date;
  groupBy?: string[];
  filters?: Record<string, any>;
}

export interface GetTrendsRequest {
  entity: 'startups' | 'jobs' | 'funding' | 'news';
  metric: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
  location?: LocationFilter;
  industry?: Industry[];
}

// Bulk operations
export interface BulkCreateRequest<T> {
  items: T[];
  skipValidation?: boolean;
  upsert?: boolean;
}

export interface BulkUpdateRequest<T> {
  items: (T & { id: string })[];
  skipValidation?: boolean;
}

export interface BulkDeleteRequest {
  ids: string[];
  force?: boolean;
}

// File upload requests
export interface FileUploadRequest {
  file: string; // File path or base64 encoded data
  fileName: string;
  contentType: string;
  folder?: string;
  isPublic?: boolean;
}

export interface MultipleFileUploadRequest {
  files: FileUploadRequest[];
  folder?: string;
  isPublic?: boolean;
}

// Export/Import requests
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json';
  entity: 'startups' | 'jobs' | 'funding' | 'users';
  filters?: Record<string, any>;
  fields?: string[];
}

export interface ImportRequest {
  file: string; // File path or base64 encoded data
  entity: 'startups' | 'jobs' | 'funding' | 'users';
  mapping: Record<string, string>;
  skipValidation?: boolean;
  dryRun?: boolean;
}
