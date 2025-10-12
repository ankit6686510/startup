import { StartupStatus, StartupStage, Industry, DataSource } from '../common/enums';

export interface Startup {
  id: string;
  name: string;
  slug: string;
  description: string;
  vision?: string;
  mission?: string;
  website?: string;
  logoUrl?: string;
  industry: Industry;
  status: StartupStatus;
  stage: StartupStage;
  foundedYear: number;
  location: Location;
  employeeCount?: number;
  valuation?: number;
  totalFunding?: number;
  dataSource: DataSource;
  verified: boolean;
  claimedBy?: string; // User ID who claimed this startup
  socialLinks?: SocialLinks;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Founder {
  id: string;
  startupId: string;
  name: string;
  title: string;
  bio?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  imageUrl?: string;
  isPrimary: boolean;
  equity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  country: string;
  countryCode: string;
  city?: string;
  state?: string;
  region?: string;
  isRemote: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  productHunt?: string;
  crunchbase?: string;
  angelList?: string;
}

export interface StartupMetrics {
  id: string;
  startupId: string;
  metricDate: Date;
  revenue?: number;
  users?: number;
  activeUsers?: number;
  employees?: number;
  valuation?: number;
  burnRate?: number;
  runway?: number; // in months
  growthRate?: number; // percentage
  dataSource: DataSource;
  createdAt: Date;
}

export interface StartupClaim {
  id: string;
  startupId: string;
  userId: string;
  email: string;
  verificationToken: string;
  status: 'pending' | 'approved' | 'rejected';
  proofDocuments?: string[]; // URLs to uploaded documents
  adminNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin user ID
}

export interface StartupUpdate {
  id: string;
  startupId: string;
  type: 'funding' | 'product' | 'team' | 'milestone' | 'pivot' | 'acquisition' | 'other';
  title: string;
  content: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt: Date;
  createdAt: Date;
}

// Minimal startup for lists/cards
export interface StartupSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  industry: Industry;
  location: Location;
  foundedYear: number;
  totalFunding?: number;
  stage: StartupStage;
  status: StartupStatus;
  employeeCount?: number;
  tags?: string[];
}

// For creation/update requests
export interface CreateStartupRequest {
  name: string;
  description: string;
  website?: string;
  industry: Industry;
  foundedYear: number;
  location: Location;
  vision?: string;
  mission?: string;
  logoUrl?: string;
  socialLinks?: SocialLinks;
  founders: Omit<Founder, 'id' | 'startupId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateStartupRequest extends Partial<CreateStartupRequest> {
  id: string;
}
