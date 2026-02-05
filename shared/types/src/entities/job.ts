import { JobType, WorkLocation, ExperienceLevel, JobCategory, Currency } from '../common/enums';
import { Location } from './startup';

export interface Job {
  id: string;
  startupId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave?: string[];
  type: JobType;
  category: JobCategory;
  experienceLevel: ExperienceLevel;
  workLocation: WorkLocation;
  location?: Location; // Physical location if onsite/hybrid
  salaryRange?: {
    min: number;
    max: number;
    currency: Currency;
    equity?: {
      min: number;
      max: number;
    };
  };
  skills: string[];
  benefits?: string[];
  applyUrl?: string;
  applyEmail?: string;
  externalJobId?: string; // ID from external job boards
  isActive: boolean;
  featured: boolean;
  urgent: boolean;
  postedDate: Date;
  applicationDeadline?: Date;
  filledDate?: Date;
  applicationCount?: number;
  viewCount?: number;
  sourceUrl?: string;
  contactPerson?: {
    name: string;
    email: string;
    title?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  resumeUrl?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  lastUpdated: Date;
  notes?: string; // Internal notes from recruiter
  stageHistory: ApplicationStage[];
}

export enum ApplicationStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  HIRED = 'hired',
}

export interface ApplicationStage {
  id: string;
  applicationId: string;
  stage: ApplicationStatus;
  notes?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  feedback?: string;
  rating?: number; // 1-5 scale
  updatedBy: string; // User ID of recruiter/founder
  createdAt: Date;
}

export interface JobAlert {
  id: string;
  userId: string;
  name: string;
  criteria: JobSearchCriteria;
  frequency: 'immediate' | 'daily' | 'weekly';
  isActive: boolean;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSearchCriteria {
  keywords?: string[];
  industries?: string[];
  locations?: string[];
  workLocation?: WorkLocation[];
  jobTypes?: JobType[];
  experienceLevels?: ExperienceLevel[];
  categories?: JobCategory[];
  salaryRange?: {
    min: number;
    max: number;
    currency: Currency;
  };
  fundingStages?: string[];
  companySize?: {
    min: number;
    max: number;
  };
  hasEquity?: boolean;
  isRemote?: boolean;
  postedWithin?: number; // days
}

export interface JobStats {
  id: string;
  jobId: string;
  date: Date;
  views: number;
  applications: number;
  clicks: number;
  shares: number;
  saves: number;
}

// Summary interfaces for lists/cards
export interface JobSummary {
  id: string;
  title: string;
  startupId: string;
  startupName: string;
  startupLogo?: string;
  location?: Location;
  workLocation: WorkLocation;
  type: JobType;
  experienceLevel: ExperienceLevel;
  salaryRange?: {
    min: number;
    max: number;
    currency: Currency;
  };
  postedDate: Date;
  featured: boolean;
  urgent: boolean;
  skills: string[];
}

export interface StartupJobStats {
  startupId: string;
  startupName: string;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  averageApplicationsPerJob: number;
  topCategories: {
    category: JobCategory;
    count: number;
  }[];
  hiringTrend: {
    month: string;
    jobsPosted: number;
    hires: number;
  }[];
}

// Request/Response types
export interface CreateJobRequest {
  startupId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave?: string[];
  type: JobType;
  category: JobCategory;
  experienceLevel: ExperienceLevel;
  workLocation: WorkLocation;
  location?: Location;
  salaryRange?: {
    min: number;
    max: number;
    currency: Currency;
    equity?: {
      min: number;
      max: number;
    };
  };
  skills: string[];
  benefits?: string[];
  applyUrl?: string;
  applyEmail?: string;
  applicationDeadline?: Date;
  contactPerson?: {
    name: string;
    email: string;
    title?: string;
  };
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string;
  isActive?: boolean;
  featured?: boolean;
  urgent?: boolean;
}

export interface CreateJobApplicationRequest {
  jobId: string;
  resumeUrl?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

export interface UpdateApplicationStatusRequest {
  applicationId: string;
  status: ApplicationStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
  scheduledAt?: Date;
}

// Analytics types
export interface JobMarketTrends {
  period: string;
  totalJobs: number;
  totalApplications: number;
  averageApplicationsPerJob: number;
  topCategories: {
    category: JobCategory;
    count: number;
    avgSalary?: number;
  }[];
  topSkills: {
    skill: string;
    count: number;
    avgSalary?: number;
  }[];
  topLocations: {
    location: string;
    count: number;
    avgSalary?: number;
  }[];
  salaryTrends: {
    category: JobCategory;
    experienceLevel: ExperienceLevel;
    avgSalary: number;
    medianSalary: number;
  }[];
  workLocationDistribution: {
    type: WorkLocation;
    percentage: number;
  }[];
}

export interface HiringInsights {
  timeToHire: number; // average days
  applicationToHireRatio: number;
  topPerformingJobs: {
    jobId: string;
    title: string;
    applicationRate: number;
    hireRate: number;
  }[];
  seasonalTrends: {
    month: string;
    jobsPosted: number;
    applications: number;
    hires: number;
  }[];
}
