/**
 * Application Management Types & Interfaces
 * Complete type definitions for the application management system
 */

// ==================== ENUMS ====================

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  VIEWED = 'VIEWED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum DocumentType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  PORTFOLIO = 'portfolio',
  OTHER = 'other',
}

export enum FunnelStage {
  APPLIED = 'applied',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEWED = 'interviewed',
  OFFERED = 'offered',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  STATUS = 'status',
  QUALITY = 'quality',
}

// ==================== REQUEST INTERFACES ====================

export interface UploadDocumentRequest {
  file: Express.Multer.File;
  documentType: DocumentType;
  isPrimary?: boolean;
}

export interface UpdateStatusRequest {
  status: ApplicationStatus;
  reason?: string;
  notes?: string;
  changedBy?: string;
}

export interface BulkApplyRequest {
  jobIds: string[];
  commonData: {
    emailAddress: string;
    fullName: string;
    coverLetter?: string;
    yearsOfExperience?: number;
    salaryExpectation?: number;
    currentCompany?: string;
    currentTitle?: string;
    noticePeriodDays?: number;
    requiresVisaSponsorship?: boolean;
    willingToRelocate?: boolean;
    portfolio?: string;
    linkedIn?: string;
    github?: string;
    customResponses?: Record<string, any>;
  };
}

export interface BulkUpdateStatusRequest {
  applicationIds: string[];
  status: ApplicationStatus;
  reason?: string;
  changedBy?: string;
}

export interface ApplicationFilterRequest {
  status?: ApplicationStatus;
  jobId?: string;
  applicantId?: string;
  startupId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

// ==================== RESPONSE INTERFACES ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    facets?: Record<string, any>;
  };
  timestamp: string;
}

export interface DocumentResponse {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileMimeType: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface StatusHistoryResponse {
  id: string;
  status: ApplicationStatus;
  previousStatus?: ApplicationStatus;
  changedBy?: string;
  changeReason?: string;
  notes?: string;
  createdAt: Date;
}

export interface TimelineEvent {
  type: 'submission' | 'status_change' | 'document_upload' | 'interview_scheduled';
  timestamp: Date;
  data: Record<string, any>;
}

export interface ApplicationAnalyticsResponse {
  id: string;
  applicationId: string;
  jobId: string;
  funnelStage: FunnelStage;
  submissionTimeMs: number;
  viewCount: number;
  daysInReview?: number;
  daysToDecision?: number;
  matchScore?: number;
  qualityScore?: number;
  competitivenessRank?: number;
  respondedAt?: Date;
  createdAt: Date;
}

export interface PipelineAnalyticsResponse {
  totalApplications: number;
  funnelStages: {
    applied: number;
    reviewed: number;
    shortlisted: number;
    interviewed: number;
    offered: number;
    hired: number;
    rejected: number;
  };
  conversionRates: {
    appliedToReviewed: number;
    reviewedToShortlisted: number;
    shortlistedToInterviewed: number;
    interviewedToOffered: number;
    offeredToHired: number;
  };
  timings: {
    avgTimeToFirstResponse: number;
    avgTimeToDecision: number;
    avgDaysInReview: number;
  };
  topDropOffReason?: string;
}

export interface QualityMetricsResponse {
  totalApplications: number;
  avgMatchScore: number;
  avgResponseRate: number;
  topApplicants: Array<{
    id: string;
    applicantName: string;
    matchScore: number;
    yearsOfExperience?: number;
  }>;
  qualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export interface BulkApplyResponse {
  successful: Array<{
    id: string;
    jobId: string;
    applicantId: string;
    status: ApplicationStatus;
  }>;
  failed: Array<{
    jobId: string;
    error: string;
  }>;
}

export interface BulkUpdateStatusResponse {
  updatedCount: number;
  failed: Array<{
    id: string;
    error: string;
  }>;
}

// ==================== DATA INTERFACES ====================

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  fileUrl: string;
  storageKey: string;
  isPrimary: boolean;
  uploadedBy: string;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentMetadata {
  pages?: number;
  isTextExtracted?: boolean;
  extractedText?: string;
  uploadedVia?: 'web' | 'mobile' | 'api';
  fileHash?: string;
  scanStatus?: 'pending' | 'clean' | 'quarantined';
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  previousStatus?: ApplicationStatus;
  changedBy?: string;
  changeReason?: string;
  notes?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface ApplicationAnalytics {
  id: string;
  applicationId: string;
  jobId: string;
  applicantId: string;
  startupId: string;
  funnelStage: FunnelStage;
  funnelDropReason?: string;
  submissionTimeMs: number;
  viewCount: number;
  daysInReview?: number;
  daysToDecision?: number;
  matchScore?: number;
  qualityScore?: number;
  competitivenessRank?: number;
  totalApplicantsForJob: number;
  respondedAt?: Date;
  responseRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SERVICE INTERFACES ====================

export interface IApplicationManagementService {
  // Document Management
  uploadApplicationDocument(
    applicationId: string,
    documentType: DocumentType,
    file: UploadedFile,
    isPrimary?: boolean,
  ): Promise<ApplicationDocument>;

  getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]>;

  deleteApplicationDocument(documentId: string, applicationId: string): Promise<void>;

  // Status & History
  updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    changedBy?: string,
    changeReason?: string,
    notes?: string,
  ): Promise<{
    application: any;
    history: ApplicationStatusHistory;
  }>;

  getApplicationStatusHistory(applicationId: string): Promise<ApplicationStatusHistory[]>;

  getApplicationTimeline(applicationId: string): Promise<TimelineEvent[]>;

  // Bulk Operations
  bulkApplyToJobs(bulkData: BulkApplicationData): Promise<BulkApplyResponse>;

  bulkUpdateStatus(
    applicationIds: string[],
    newStatus: ApplicationStatus,
    changedBy?: string,
    reason?: string,
  ): Promise<BulkUpdateStatusResponse>;

  getApplicationsByFilter(
    filters: ApplicationFilters,
    page?: number,
    limit?: number,
  ): Promise<{
    applications: any[];
    total: number;
    facets: Record<string, any>;
  }>;

  // Analytics
  getApplicationAnalytics(applicationId: string): Promise<ApplicationAnalytics | null>;

  getPipelineAnalytics(startupId: string, jobId?: string): Promise<PipelineAnalyticsResponse>;

  getQualityMetrics(startupId: string, jobId?: string): Promise<QualityMetricsResponse>;
}

// ==================== UTILITY INTERFACES ====================

export interface UploadedFile {
  originalName: string;
  mimetype: string;
  size: number;
  path?: string;
  buffer?: Buffer;
}

export interface BulkApplicationData {
  jobIds: string[];
  applicantId: string;
  commonData?: any;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  applicantId?: string;
  startupId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: SortOption;
}

export interface StorageProvider {
  upload(file: UploadedFile, key: string): Promise<string>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

export interface NotificationPayload {
  applicationId: string;
  type: 'APPLICATION_STATUS_CHANGE' | 'APPLICATION_SUBMITTED' | 'INTERVIEW_SCHEDULED';
  status?: ApplicationStatus;
  message: string;
  metadata?: Record<string, any>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
  sortBy?: SortOption;
}

export interface FacetResult {
  value: string;
  count: number;
}

export interface FacetResults {
  statuses: FacetResult[];
  [key: string]: FacetResult[];
}

// ==================== ERROR TYPES ====================

export class ApplicationError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} ${id} not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// ==================== CONSTANT DEFINITIONS ====================

export const DOCUMENT_TYPES = [
  DocumentType.RESUME,
  DocumentType.COVER_LETTER,
  DocumentType.PORTFOLIO,
  DocumentType.OTHER,
];

export const APPLICATION_STATUSES = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.VIEWED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.INTERVIEW_SCHEDULED,
  ApplicationStatus.INTERVIEWED,
  ApplicationStatus.OFFER_EXTENDED,
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.DECLINED,
  ApplicationStatus.WITHDRAWN,
];

export const FUNNEL_STAGES = [
  FunnelStage.APPLIED,
  FunnelStage.REVIEWED,
  FunnelStage.SHORTLISTED,
  FunnelStage.INTERVIEWED,
  FunnelStage.OFFERED,
  FunnelStage.HIRED,
  FunnelStage.REJECTED,
];

export const STATUS_FLOW_MAP: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.SUBMITTED]: [
    ApplicationStatus.VIEWED,
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.VIEWED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
  [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.INTERVIEWED,
  ],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.INTERVIEW_SCHEDULED]: [
    ApplicationStatus.INTERVIEWED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.INTERVIEWED]: [ApplicationStatus.OFFER_EXTENDED, ApplicationStatus.REJECTED],
  [ApplicationStatus.OFFER_EXTENDED]: [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.DECLINED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.ACCEPTED]: [],
  [ApplicationStatus.DECLINED]: [],
  [ApplicationStatus.WITHDRAWN]: [],
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 50,
  MAX_LIMIT: 100,
};

export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIMES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
};

// ==================== TYPE GUARDS ====================

export function isValidApplicationStatus(value: any): value is ApplicationStatus {
  return Object.values(ApplicationStatus).includes(value);
}

export function isValidDocumentType(value: any): value is DocumentType {
  return Object.values(DocumentType).includes(value);
}

export function isValidFunnelStage(value: any): value is FunnelStage {
  return Object.values(FunnelStage).includes(value);
}

export function isSortOption(value: any): value is SortOption {
  return Object.values(SortOption).includes(value);
}
