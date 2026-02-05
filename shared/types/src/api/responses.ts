import { PaginatedResponse, SearchResponse } from '../common/pagination';
import { Startup, StartupSummary, Founder, StartupMetrics } from '../entities/startup';
import { FundingRoundData, Investor, InvestorSummary } from '../entities/funding';
import { Job, JobSummary, JobApplication, JobStats } from '../entities/job';
import { User, AuthUser, UserStats } from '../entities/user';
import { NewsArticle, NewsSummary, TrendingTopic } from '../entities/news';

// Generic API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  timestamp: Date;
  requestId?: string;
  meta?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Authentication responses
export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// Startup responses
export interface GetStartupsResponse extends PaginatedResponse<StartupSummary> {}

export interface SearchStartupsResponse extends SearchResponse<StartupSummary> {}

export interface GetStartupResponse {
  startup: Startup;
  founders: Founder[];
  fundingRounds?: FundingRoundData[];
  recentJobs?: JobSummary[];
  recentNews?: NewsSummary[];
  metrics?: StartupMetrics[];
}

export interface CreateStartupResponse {
  startup: Startup;
  message: string;
}

// Funding responses
export interface GetFundingRoundsResponse extends PaginatedResponse<FundingRoundData> {}

export interface GetInvestorsResponse extends PaginatedResponse<InvestorSummary> {}

export interface GetInvestorResponse {
  investor: Investor;
  portfolioCompanies: StartupSummary[];
  recentInvestments: FundingRoundData[];
  stats: {
    totalInvestments: number;
    totalPortfolioValue: number;
    exitCount: number;
    unicornCount: number;
  };
}

export interface FundingAnalyticsResponse {
  totalFunding: number;
  totalDeals: number;
  averageDealSize: number;
  topInvestors: {
    investorId: string;
    investorName: string;
    dealCount: number;
    totalInvested: number;
  }[];
  fundingByStage: {
    stage: string;
    amount: number;
    dealCount: number;
  }[];
  fundingByIndustry: {
    industry: string;
    amount: number;
    dealCount: number;
  }[];
  trendData: {
    period: string;
    amount: number;
    deals: number;
  }[];
}

// Job responses
export interface GetJobsResponse extends PaginatedResponse<JobSummary> {}

export interface SearchJobsResponse extends SearchResponse<JobSummary> {}

export interface GetJobResponse {
  job: Job;
  startup: StartupSummary;
  similarJobs: JobSummary[];
  stats: JobStats;
}

export interface GetJobApplicationsResponse extends PaginatedResponse<JobApplication> {}

export interface JobAnalyticsResponse {
  totalJobs: number;
  totalApplications: number;
  averageApplicationsPerJob: number;
  topCategories: {
    category: string;
    count: number;
    avgSalary?: number;
  }[];
  topSkills: {
    skill: string;
    count: number;
    avgSalary?: number;
  }[];
  salaryTrends: {
    category: string;
    level: string;
    avgSalary: number;
    medianSalary: number;
  }[];
  hiringTrends: {
    period: string;
    jobsPosted: number;
    applications: number;
    hires: number;
  }[];
}

// News responses
export interface GetNewsResponse extends PaginatedResponse<NewsSummary> {}

export interface SearchNewsResponse extends SearchResponse<NewsSummary> {}

export interface GetNewsArticleResponse {
  article: NewsArticle;
  relatedArticles: NewsSummary[];
  relatedStartups: StartupSummary[];
}

export interface GetTrendingTopicsResponse {
  topics: TrendingTopic[];
  period: string;
  calculatedAt: Date;
}

// User responses
export interface GetUsersResponse extends PaginatedResponse<User> {}

export interface GetUserResponse {
  user: User;
  stats: UserStats;
  recentActivity: any[]; // UserActivity[]
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

// Analytics responses
export interface DashboardStatsResponse {
  totalStartups: number;
  totalJobs: number;
  totalFunding: number;
  totalUsers: number;
  growth: {
    startups: number;
    jobs: number;
    funding: number;
    users: number;
  };
  recentActivity: {
    newStartups: StartupSummary[];
    recentFunding: FundingRoundData[];
    latestJobs: JobSummary[];
    trendingNews: NewsSummary[];
  };
}

export interface PlatformAnalyticsResponse {
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  contentStats: {
    totalStartups: number;
    verifiedStartups: number;
    totalJobs: number;
    activeJobs: number;
    totalArticles: number;
    totalFunding: number;
  };
  topContent: {
    mostViewedStartups: StartupSummary[];
    mostAppliedJobs: JobSummary[];
    mostReadArticles: NewsSummary[];
  };
  trends: {
    period: string;
    data: {
      startups: number;
      jobs: number;
      funding: number;
      users: number;
    }[];
  };
}

// Search and discovery responses
export interface GlobalSearchResponse {
  startups: {
    results: StartupSummary[];
    total: number;
  };
  jobs: {
    results: JobSummary[];
    total: number;
  };
  news: {
    results: NewsSummary[];
    total: number;
  };
  investors: {
    results: InvestorSummary[];
    total: number;
  };
  totalResults: number;
  searchTime: number;
}

export interface SuggestionsResponse {
  startups: string[];
  jobs: string[];
  skills: string[];
  locations: string[];
  industries: string[];
}

// File and media responses
export interface FileUploadResponse {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

export interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
  totalSize: number;
  uploadedAt: Date;
}

// Export/Import responses
export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  format: string;
  recordCount: number;
  expiresAt: Date;
}

export interface ImportResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
  downloadUrl?: string; // For error report
}

// Health check and system responses
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    elasticsearch: 'healthy' | 'unhealthy';
    externalApis: 'healthy' | 'unhealthy';
  };
  timestamp: Date;
  uptime: number;
  version: string;
}

export interface SystemStatsResponse {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}
