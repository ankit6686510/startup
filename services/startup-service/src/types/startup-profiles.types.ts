// Request/Response DTOs for Startup Profiles & Discovery

// ==================== TEAM MANAGEMENT ====================

export interface CreateTeamMemberRequest {
  name: string;
  title: string;
  role: string; // TeamRole enum value
  bio?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  profileImageUrl?: string;
  expertise?: string[];
  education?: string[];
}

export interface UpdateTeamMemberRequest {
  name?: string;
  title?: string;
  role?: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  profileImageUrl?: string;
  expertise?: string[];
  education?: string[];
  orderIndex?: number;
  isFeatured?: boolean;
}

export interface TeamMemberResponse {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  expertise: string[];
  education: string[];
  isFeatured: boolean;
  orderIndex: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReorderTeamRequest {
  memberIds: string[];
}

// ==================== PHOTO GALLERY ====================

export interface CreatePhotoRequest {
  title: string;
  caption?: string;
  category: string; // PhotoCategory enum value
  imageUrl: string; // S3 URL
  thumbnailUrl: string; // S3 URL
  altText?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSize?: number;
}

export interface UpdatePhotoRequest {
  title?: string;
  caption?: string;
  category?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  altText?: string;
  width?: number;
  height?: number;
  orderIndex?: number;
  isFeatured?: boolean;
}

export interface PhotoResponse {
  id: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  altText: string;
  width: number;
  height: number;
  mimeType: string;
  fileSize: number;
  isFeatured: boolean;
  orderIndex: number;
  viewsCount: number;
  likesCount: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReorderPhotosRequest {
  photoIds: string[];
}

// ==================== PROFILE MANAGEMENT ====================

export interface UpdateStartupProfileRequest {
  description?: string;
  longDescription?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  culture?: string;
  foundingDate?: Date;
  headquarters?: string;
  companySize?: string;
}

export interface StartupProfileResponse {
  startup: {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    mission: string;
    vision: string;
    values: string[];
    industry: string;
    fundingStage: string;
    totalFunding: number;
    website: string;
    headquartersLocation: string;
    foundingDate: Date;
    createdAt: Date;
  };
  teamMembers: TeamMemberResponse[];
  photos: PhotoResponse[];
  followers: number;
  profileCompleteness: number;
  verification: {
    status: string;
    emailVerified: boolean;
    documentsVerified: boolean;
    linkedinVerified: boolean;
  };
}

export interface ProfileCompletionResponse {
  completionPercentage: number;
  missingItems: string[];
  nextSteps: string[];
}

// ==================== VERIFICATION ====================

export interface StartEmailVerificationRequest {
  email: string;
}

export interface SubmitDocumentsRequest {
  registrationNumber: string;
  documentUrl: string;
}

export interface ApproveVerificationRequest {
  reviewedBy: string;
  notes?: string;
}

export interface RejectVerificationRequest {
  reviewedBy: string;
  reason: string;
}

export interface VerificationStatusResponse {
  status: string; // VerificationStatus enum value
  emailVerified: boolean;
  documentsVerified: boolean;
  linkedinVerified: boolean;
  reviewedAt?: Date;
  rejectionReason?: string;
  canResubmit: boolean;
}

// ==================== DISCOVERY & SEARCH ====================

export interface SearchStartupsRequest {
  keyword?: string;
  industry?: string[];
  stage?: string[];
  location?: string[];
  fundingMin?: number;
  fundingMax?: number;
  employeeMin?: number;
  employeeMax?: number;
  foundedAfter?: Date;
  foundedBefore?: Date;
  hasVerification?: boolean;
  sortBy?: 'trending' | 'followers' | 'recent' | 'relevance';
  limit?: number;
  offset?: number;
}

export interface SearchResultsResponse {
  data: StartupSearchResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
  filters?: SearchStartupsRequest;
}

export interface StartupSearchResult {
  id: string;
  name: string;
  description: string;
  industry: string;
  fundingStage: string;
  totalFunding: number;
  headquarters: string;
  followers: number;
  verified: boolean;
  trendingScore?: number;
  relevanceScore?: number;
  logoUrl?: string;
  foundingDate: Date;
}

export interface TrendingStartupsResponse {
  data: TrendingStartup[];
  period: string;
}

export interface TrendingStartup {
  id: string;
  name: string;
  description: string;
  industry: string;
  fundingStage: string;
  trendingScore: number;
  newFollowersLast7Days: number;
  photoViewsIncrease: number;
  photoLikesIncrease: number;
  logoUrl?: string;
}

export interface RecommendedStartupResponse {
  startup: {
    id: string;
    name: string;
    description: string;
    industry: string;
    fundingStage: string;
    headquarters: string;
    logoUrl?: string;
  };
  similarityScore: number;
  commonFactors: string[];
}

export interface RecommendationsResponse {
  data: RecommendedStartupResponse[];
  count: number;
}

export interface SimilarStartupsResponse {
  data: RecommendedStartupResponse[];
  count: number;
}

// ==================== FOLLOW & BOOKMARK ====================

export interface FollowStartupRequest {
  metadata?: {
    followedFrom?: string;
  };
}

export interface FollowResponseDto {
  id: string;
  userId: string;
  startupId: string;
  isBookmarked: boolean;
  notificationPreferences: 'all' | 'major' | 'none';
  followedAt: Date;
  updatedAt: Date;
}

export interface UserFollowsResponse {
  data: {
    follow: FollowResponseDto;
    startup: StartupSearchResult;
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface UserBookmarksResponse {
  data: {
    bookmark: FollowResponseDto;
    startup: StartupSearchResult;
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface FollowStatusResponse {
  isFollowing: boolean;
  isBookmarked: boolean;
  notificationPreferences?: 'all' | 'major' | 'none';
  followedAt?: Date;
}

// ==================== ANALYTICS ====================

export interface ProfileAnalyticsResponse {
  teamMembersCount: number;
  photosCount: number;
  followers: number;
  totalPhotoViews: number;
  totalPhotoLikes: number;
  totalTeamViews: number;
  averagePhotoLikes: number;
  mostViewedPhoto?: PhotoResponse;
}

export interface FeaturedContentResponse {
  featuredTeamMembers: TeamMemberResponse[];
  featuredPhotos: PhotoResponse[];
}

export interface DiscoveryPageResponse {
  trending: TrendingStartup[];
  recommended: (StartupSearchResult & { similarityScore?: number })[];
  featured: StartupSearchResult[];
  sections: string[];
}

// ==================== SHARED TYPES ====================

export interface PaginationDto {
  limit: number;
  offset: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface BulkActionRequest {
  ids: string[];
  action: string;
}

export interface BulkActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: {
    id: string;
    error: string;
  }[];
}

// ==================== ENUMS ====================

export enum TeamRoleEnum {
  FOUNDER = 'FOUNDER',
  CEO = 'CEO',
  CTO = 'CTO',
  CFO = 'CFO',
  COO = 'COO',
  VP_ENGINEERING = 'VP_ENGINEERING',
  VP_SALES = 'VP_SALES',
  VP_MARKETING = 'VP_MARKETING',
  VP_PRODUCT = 'VP_PRODUCT',
  VP_OPERATIONS = 'VP_OPERATIONS',
  ENGINEER = 'ENGINEER',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  DESIGNER = 'DESIGNER',
  BUSINESS_DEVELOPMENT = 'BUSINESS_DEVELOPMENT',
  MARKETER = 'MARKETER',
  OPERATIONS = 'OPERATIONS',
  ADVISOR = 'ADVISOR',
  INVESTOR = 'INVESTOR',
}

export enum PhotoCategoryEnum {
  OFFICE = 'OFFICE',
  TEAM = 'TEAM',
  PRODUCT = 'PRODUCT',
  EVENT = 'EVENT',
  CULTURE = 'CULTURE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  OTHER = 'OTHER',
}

export enum VerificationStatusEnum {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum SortByEnum {
  TRENDING = 'trending',
  FOLLOWERS = 'followers',
  RECENT = 'recent',
  RELEVANCE = 'relevance',
}

export enum NotificationPreferenceEnum {
  ALL = 'all',
  MAJOR = 'major',
  NONE = 'none',
}

// ==================== QUERY FILTERS ====================

export interface FilterOptions {
  industries: { label: string; value: string }[];
  stages: { label: string; value: string }[];
  locations: { label: string; value: string }[];
  fundingRanges: { label: string; min: number; max: number }[];
  employeeCounts: { label: string; min: number; max: number }[];
  sortOptions: { label: string; value: string }[];
}

export interface SearchAggregations {
  industries: { name: string; count: number }[];
  stages: { name: string; count: number }[];
  locations: { name: string; count: number }[];
  verified: { name: string; count: number }[];
}
