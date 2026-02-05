import { z } from 'zod';

// Enums and Literals matching types.ts
export const FundingStageSchema = z.enum([
    'IDEA', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C',
    'SERIES_D', 'SERIES_E', 'GROWTH', 'LATE_STAGE', 'PUBLIC'
]);

export const StartupStatusSchema = z.enum([
    'ACTIVE', 'ACQUIRED', 'CLOSED', 'PIVOT'
]);

export const EmployeeRangeSchema = z.enum([
    '1-10', '11-50', '51-100', '101-500', '501-1000', '1000+'
]);

// Helper sub-schemas
export const FounderSchema = z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
    linkedIn: z.string().optional(),
    twitter: z.string().optional(),
});

export const FundingRoundSchema = z.object({
    id: z.string(),
    stage: FundingStageSchema,
    amount: z.number(),
    currency: z.string(),
    date: z.string(), // ISO date
    investors: z.array(z.string()).optional(),
    description: z.string().optional(),
});

export const StartupJobSchema = z.object({
    id: z.string(),
    startupId: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    salaryRange: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string(),
    }).optional(),
    postedAt: z.string(),
    applicants: z.number().optional(),
});

export const StartupNewsSchema = z.object({
    id: z.string(),
    startupId: z.string(),
    title: z.string(),
    summary: z.string(),
    content: z.string().optional(),
    image: z.string().optional(),
    source: z.string(),
    sourceUrl: z.string(),
    category: z.enum(['FUNDING', 'PRODUCT', 'PARTNERSHIP', 'HIRING', 'AWARD', 'OTHER']),
    publishedAt: z.string(),
});

// Core Startup Schema
export const StartupSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    description: z.string(),
    logo: z.string().optional(),
    website: z.string().optional(),
    founded: z.string(),
    status: StartupStatusSchema,

    industry: z.string(),
    subIndustries: z.array(z.string()).optional(),
    location: z.object({
        city: z.string(),
        country: z.string(),
        coordinates: z.object({
            latitude: z.number(),
            longitude: z.number(),
        }).optional(),
    }),

    foundersCount: z.number(),
    founders: z.array(FounderSchema).optional(),
    employeeCount: EmployeeRangeSchema.optional(),

    fundingStage: FundingStageSchema,
    totalFunded: z.number(),
    lastFundingRound: FundingRoundSchema.optional(),
    fundingHistory: z.array(FundingRoundSchema).optional(),

    followersCount: z.number(),
    isFollowing: z.boolean().optional(),
    isSaved: z.boolean().optional(),

    images: z.array(z.string()).optional(),
    socialMedia: z.object({
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        crunchbase: z.string().optional(),
    }).optional(),

    createdAt: z.string(),
    updatedAt: z.string(),
});

export const StartupDetailSchema = StartupSchema.extend({
    team: z.array(FounderSchema),
    jobOpenings: z.array(StartupJobSchema),
    news: z.array(StartupNewsSchema),
    relatedStartups: z.array(StartupSchema).optional(),
});

export const PaginatedStartupResponseSchema = z.object({
    items: z.array(StartupSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasMore: z.boolean(),
});

export const TrendingStartupSchema = StartupSchema.extend({
    trendScore: z.number(),
    weeklyGrowth: z.number(),
    monthlyGrowth: z.number(),
});

export const IndustryStatsSchema = z.object({
    name: z.string(),
    count: z.number(),
    totalFunding: z.number(),
    averageFunding: z.number(),
});

export const StartupSearchResultSchema = z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string(),
    logo: z.string().optional(),
    industry: z.string(),
    location: z.object({
        city: z.string(),
        country: z.string(),
    }),
    fundingStage: FundingStageSchema,
    totalFunded: z.number(),
});

export const StartupComparisonSchema = z.object({
    startups: z.array(StartupSchema),
    metrics: z.array(z.object({
        name: z.string(),
        values: z.array(z.union([z.number(), z.string()])),
    })),
});
