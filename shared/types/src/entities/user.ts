import { UserRole, UserStatus } from '../common/enums';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phone?: string;
  location?: {
    country: string;
    city?: string;
  };
  timezone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  preferences: UserPreferences;
  startupAffiliations?: UserStartupAffiliation[];
  lastLogin?: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  emailNotifications: {
    newJobs: boolean;
    fundingNews: boolean;
    startupUpdates: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    jobAlerts: boolean;
    mentions: boolean;
    messages: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  jobSearch: {
    activelySearching: boolean;
    openToOpportunities: boolean;
    preferredLocations: string[];
    preferredSalaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
    preferredWorkLocation: 'remote' | 'onsite' | 'hybrid' | 'any';
  };
}

export interface UserStartupAffiliation {
  id: string;
  userId: string;
  startupId: string;
  relationship: 'founder' | 'employee' | 'advisor' | 'investor' | 'former_employee';
  title?: string;
  startDate?: Date;
  endDate?: Date;
  equity?: number;
  isVerified: boolean;
  verificationProof?: string[];
  createdAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  type:
    | 'profile_view'
    | 'startup_view'
    | 'job_view'
    | 'job_apply'
    | 'startup_save'
    | 'job_save'
    | 'search'
    | 'share';
  entityType?: 'startup' | 'job' | 'investor' | 'user';
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface UserConnection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  requestedAt: Date;
  respondedAt?: Date;
}

export interface UserSavedItem {
  id: string;
  userId: string;
  itemType: 'startup' | 'job' | 'investor' | 'news';
  itemId: string;
  notes?: string;
  tags?: string[];
  savedAt: Date;
}

export interface UserReview {
  id: string;
  reviewerId: string;
  startupId: string;
  rating: number; // 1-5 scale
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  workLifeBalance?: number;
  compensation?: number;
  culture?: number;
  management?: number;
  careerGrowth?: number;
  isAnonymous: boolean;
  isVerifiedEmployee: boolean;
  jobTitle?: string;
  employmentType?: 'current' | 'former';
  workDuration?: string;
  wouldRecommend: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Authentication related types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  profilePicture?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface EmailVerification {
  token: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
}

// Profile and settings update types
export interface UpdateUserProfileRequest {
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
  profilePicture?: string;
}

export interface UpdateUserPreferencesRequest {
  emailNotifications?: Partial<UserPreferences['emailNotifications']>;
  pushNotifications?: Partial<UserPreferences['pushNotifications']>;
  privacy?: Partial<UserPreferences['privacy']>;
  jobSearch?: Partial<UserPreferences['jobSearch']>;
}

export interface CreateAffiliationRequest {
  startupId: string;
  relationship: 'founder' | 'employee' | 'advisor' | 'investor' | 'former_employee';
  title?: string;
  startDate?: Date;
  endDate?: Date;
  equity?: number;
  verificationProof?: string[];
}

export interface CreateReviewRequest {
  startupId: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  workLifeBalance?: number;
  compensation?: number;
  culture?: number;
  management?: number;
  careerGrowth?: number;
  isAnonymous: boolean;
  jobTitle?: string;
  employmentType: 'current' | 'former';
  workDuration?: string;
  wouldRecommend: boolean;
}

// Analytics and summary types
export interface UserStats {
  userId: string;
  profileViews: number;
  startupsViewed: number;
  jobsViewed: number;
  jobsApplied: number;
  startupsSaved: number;
  jobsSaved: number;
  reviewsWritten: number;
  connections: number;
  searchQueries: number;
  lastActivityDate: Date;
}

export interface UserEngagement {
  period: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  topActivities: {
    activity: string;
    count: number;
  }[];
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}
