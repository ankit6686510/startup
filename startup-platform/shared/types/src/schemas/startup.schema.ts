import { z } from 'zod';
import { StartupStatus, StartupStage, Industry, DataSource } from '../common/enums';

// Location schema
export const LocationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().length(2, 'Country code must be 2 characters'),
  city: z.string().optional(),
  state: z.string().optional(),
  region: z.string().optional(),
  isRemote: z.boolean().default(false),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
});

// Social links schema
export const SocialLinksSchema = z.object({
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  github: z.string().url().optional(),
  productHunt: z.string().url().optional(),
  crunchbase: z.string().url().optional(),
  angelList: z.string().url().optional()
});

// Founder schema
export const FounderSchema = z.object({
  id: z.string().uuid().optional(),
  startupId: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().min(1, 'Title is required').max(100),
  bio: z.string().max(1000).optional(),
  email: z.string().email().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  isPrimary: z.boolean().default(false),
  equity: z.number().min(0).max(100).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Startup schema
export const StartupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  vision: z.string().max(500).optional(),
  mission: z.string().max(500).optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  industry: z.nativeEnum(Industry),
  status: z.nativeEnum(StartupStatus).default(StartupStatus.ACTIVE),
  stage: z.nativeEnum(StartupStage),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()),
  location: LocationSchema,
  employeeCount: z.number().min(0).optional(),
  valuation: z.number().min(0).optional(),
  totalFunding: z.number().min(0).optional(),
  dataSource: z.nativeEnum(DataSource).default(DataSource.MANUAL),
  verified: z.boolean().default(false),
  claimedBy: z.string().uuid().optional(),
  socialLinks: SocialLinksSchema.optional(),
  tags: z.array(z.string()).max(20).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Startup metrics schema
export const StartupMetricsSchema = z.object({
  id: z.string().uuid().optional(),
  startupId: z.string().uuid(),
  metricDate: z.date(),
  revenue: z.number().min(0).optional(),
  users: z.number().min(0).optional(),
  activeUsers: z.number().min(0).optional(),
  employees: z.number().min(0).optional(),
  valuation: z.number().min(0).optional(),
  burnRate: z.number().min(0).optional(),
  runway: z.number().min(0).optional(),
  growthRate: z.number().optional(),
  dataSource: z.nativeEnum(DataSource),
  createdAt: z.date().optional()
});

// Startup claim schema
export const StartupClaimSchema = z.object({
  id: z.string().uuid().optional(),
  startupId: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  verificationToken: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  proofDocuments: z.array(z.string().url()).optional(),
  adminNotes: z.string().max(1000).optional(),
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  reviewedBy: z.string().uuid().optional()
});

// Create startup request schema
export const CreateStartupRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  website: z.string().url().optional(),
  industry: z.nativeEnum(Industry),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()),
  location: LocationSchema,
  vision: z.string().max(500).optional(),
  mission: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  socialLinks: SocialLinksSchema.optional(),
  founders: z.array(FounderSchema.omit({ 
    id: true, 
    startupId: true, 
    createdAt: true, 
    updatedAt: true 
  })).min(1, 'At least one founder is required')
});

// Update startup request schema
export const UpdateStartupRequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  website: z.string().url().optional(),
  industry: z.nativeEnum(Industry).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  location: LocationSchema.optional(),
  vision: z.string().max(500).optional(),
  mission: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  socialLinks: SocialLinksSchema.optional()
});

// Search and filter schemas
export const StartupFiltersSchema = z.object({
  industry: z.array(z.nativeEnum(Industry)).optional(),
  status: z.array(z.nativeEnum(StartupStatus)).optional(),
  stage: z.array(z.nativeEnum(StartupStage)).optional(),
  foundedAfter: z.date().optional(),
  foundedBefore: z.date().optional(),
  minFunding: z.number().min(0).optional(),
  maxFunding: z.number().min(0).optional(),
  hasJobs: z.boolean().optional(),
  verified: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Validation functions
export const validateStartup = (data: unknown) => StartupSchema.safeParse(data);
export const validateCreateStartupRequest = (data: unknown) => CreateStartupRequestSchema.safeParse(data);
export const validateUpdateStartupRequest = (data: unknown) => UpdateStartupRequestSchema.safeParse(data);
export const validateStartupMetrics = (data: unknown) => StartupMetricsSchema.safeParse(data);
export const validateStartupClaim = (data: unknown) => StartupClaimSchema.safeParse(data);
export const validateStartupFilters = (data: unknown) => StartupFiltersSchema.safeParse(data);

// Type exports
export type LocationSchemaType = z.infer<typeof LocationSchema>;
export type SocialLinksSchemaType = z.infer<typeof SocialLinksSchema>;
export type FounderSchemaType = z.infer<typeof FounderSchema>;
export type StartupSchemaType = z.infer<typeof StartupSchema>;
export type StartupMetricsSchemaType = z.infer<typeof StartupMetricsSchema>;
export type StartupClaimSchemaType = z.infer<typeof StartupClaimSchema>;
export type CreateStartupRequestSchemaType = z.infer<typeof CreateStartupRequestSchema>;
export type UpdateStartupRequestSchemaType = z.infer<typeof UpdateStartupRequestSchema>;
export type StartupFiltersSchemaType = z.infer<typeof StartupFiltersSchema>;
