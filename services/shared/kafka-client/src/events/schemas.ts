import { z } from 'zod';

// Base event schema
export const BaseEventSchema = z.object({
    eventId: z.string().uuid(),
    eventType: z.string(),
    timestamp: z.string().datetime(),
    version: z.string().default('1.0'),
    metadata: z.record(z.any()).optional(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;

// ============================================
// USER EVENTS
// ============================================

export const UserRegisteredEventSchema = BaseEventSchema.extend({
    eventType: z.literal('UserRegistered'),
    data: z.object({
        userId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(['ADMIN', 'FOUNDER', 'INVESTOR', 'JOB_SEEKER', 'RECRUITER', 'USER']),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    }),
});

export const UserProfileUpdatedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('UserProfileUpdated'),
    data: z.object({
        userId: z.string().uuid(),
        updatedFields: z.array(z.string()),
        previousValues: z.record(z.any()).optional(),
    }),
});

export const UserDeletedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('UserDeleted'),
    data: z.object({
        userId: z.string().uuid(),
        deletedAt: z.string().datetime(),
        reason: z.string().optional(),
    }),
});

export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;
export type UserProfileUpdatedEvent = z.infer<typeof UserProfileUpdatedEventSchema>;
export type UserDeletedEvent = z.infer<typeof UserDeletedEventSchema>;

// ============================================
// STARTUP EVENTS
// ============================================

export const StartupCreatedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('StartupCreated'),
    data: z.object({
        startupId: z.string().uuid(),
        name: z.string(),
        founderId: z.string().uuid(),
        industry: z.string(),
        stage: z.string(),
    }),
});

export const StartupUpdatedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('StartupUpdated'),
    data: z.object({
        startupId: z.string().uuid(),
        updatedFields: z.array(z.string()),
    }),
});

export const StartupDeletedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('StartupDeleted'),
    data: z.object({
        startupId: z.string().uuid(),
        deletedAt: z.string().datetime(),
    }),
});

export const FundingRoundCreatedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('FundingRoundCreated'),
    data: z.object({
        fundingRoundId: z.string().uuid(),
        startupId: z.string().uuid(),
        amount: z.number(),
        roundType: z.string(),
        investors: z.array(z.string().uuid()),
    }),
});

export type StartupCreatedEvent = z.infer<typeof StartupCreatedEventSchema>;
export type StartupUpdatedEvent = z.infer<typeof StartupUpdatedEventSchema>;
export type StartupDeletedEvent = z.infer<typeof StartupDeletedEventSchema>;
export type FundingRoundCreatedEvent = z.infer<typeof FundingRoundCreatedEventSchema>;

// ============================================
// JOB EVENTS
// ============================================

export const JobPostedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('JobPosted'),
    data: z.object({
        jobId: z.string().uuid(),
        startupId: z.string().uuid(),
        title: z.string(),
        department: z.string(),
        location: z.string(),
        employmentType: z.string(),
    }),
});

export const JobUpdatedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('JobUpdated'),
    data: z.object({
        jobId: z.string().uuid(),
        updatedFields: z.array(z.string()),
    }),
});

export const JobClosedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('JobClosed'),
    data: z.object({
        jobId: z.string().uuid(),
        closedAt: z.string().datetime(),
        reason: z.string().optional(),
    }),
});

export const ApplicationSubmittedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('ApplicationSubmitted'),
    data: z.object({
        applicationId: z.string().uuid(),
        jobId: z.string().uuid(),
        applicantId: z.string().uuid(),
        startupId: z.string().uuid(),
        submittedAt: z.string().datetime(),
    }),
});

export const ApplicationStatusChangedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('ApplicationStatusChanged'),
    data: z.object({
        applicationId: z.string().uuid(),
        jobId: z.string().uuid(),
        applicantId: z.string().uuid(),
        startupId: z.string().uuid(),
        previousStatus: z.string(),
        newStatus: z.string(),
        changedBy: z.string().uuid(),
        changeReason: z.string().optional(),
    }),
});

export type JobPostedEvent = z.infer<typeof JobPostedEventSchema>;
export type JobUpdatedEvent = z.infer<typeof JobUpdatedEventSchema>;
export type JobClosedEvent = z.infer<typeof JobClosedEventSchema>;
export type ApplicationSubmittedEvent = z.infer<typeof ApplicationSubmittedEventSchema>;
export type ApplicationStatusChangedEvent = z.infer<typeof ApplicationStatusChangedEventSchema>;

// ============================================
// NOTIFICATION EVENTS
// ============================================

export const NotificationRequestedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('NotificationRequested'),
    data: z.object({
        notificationId: z.string().uuid(),
        recipientId: z.string().uuid(),
        type: z.enum(['EMAIL', 'SMS', 'PUSH']),
        template: z.string(),
        data: z.record(z.any()),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    }),
});

export const EmailSentEventSchema = BaseEventSchema.extend({
    eventType: z.literal('EmailSent'),
    data: z.object({
        notificationId: z.string().uuid(),
        recipientEmail: z.string().email(),
        subject: z.string(),
        sentAt: z.string().datetime(),
        status: z.enum(['SENT', 'FAILED', 'BOUNCED']),
    }),
});

export const SMSSentEventSchema = BaseEventSchema.extend({
    eventType: z.literal('SMSSent'),
    data: z.object({
        notificationId: z.string().uuid(),
        recipientPhone: z.string(),
        sentAt: z.string().datetime(),
        status: z.enum(['SENT', 'FAILED', 'DELIVERED']),
    }),
});

export const PushNotificationSentEventSchema = BaseEventSchema.extend({
    eventType: z.literal('PushNotificationSent'),
    data: z.object({
        notificationId: z.string().uuid(),
        recipientId: z.string().uuid(),
        sentAt: z.string().datetime(),
        status: z.enum(['SENT', 'FAILED', 'DELIVERED']),
    }),
});

export type NotificationRequestedEvent = z.infer<typeof NotificationRequestedEventSchema>;
export type EmailSentEvent = z.infer<typeof EmailSentEventSchema>;
export type SMSSentEvent = z.infer<typeof SMSSentEventSchema>;
export type PushNotificationSentEvent = z.infer<typeof PushNotificationSentEventSchema>;

// ============================================
// ANALYTICS EVENTS
// ============================================

export const PageViewEventSchema = BaseEventSchema.extend({
    eventType: z.literal('PageView'),
    data: z.object({
        userId: z.string().uuid().optional(),
        sessionId: z.string(),
        page: z.string(),
        referrer: z.string().optional(),
        userAgent: z.string().optional(),
    }),
});

export const UserActionEventSchema = BaseEventSchema.extend({
    eventType: z.literal('UserAction'),
    data: z.object({
        userId: z.string().uuid(),
        action: z.string(),
        resource: z.string(),
        resourceId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
    }),
});

export const MetricRecordedEventSchema = BaseEventSchema.extend({
    eventType: z.literal('MetricRecorded'),
    data: z.object({
        metricName: z.string(),
        metricValue: z.number(),
        unit: z.string().optional(),
        tags: z.record(z.string()).optional(),
    }),
});

export type PageViewEvent = z.infer<typeof PageViewEventSchema>;
export type UserActionEvent = z.infer<typeof UserActionEventSchema>;
export type MetricRecordedEvent = z.infer<typeof MetricRecordedEventSchema>;

// ============================================
// EVENT UNION TYPES
// ============================================

export type UserEvent = UserRegisteredEvent | UserProfileUpdatedEvent | UserDeletedEvent;
export type StartupEvent = StartupCreatedEvent | StartupUpdatedEvent | StartupDeletedEvent | FundingRoundCreatedEvent;
export type JobEvent = JobPostedEvent | JobUpdatedEvent | JobClosedEvent | ApplicationSubmittedEvent | ApplicationStatusChangedEvent;
export type NotificationEvent = NotificationRequestedEvent | EmailSentEvent | SMSSentEvent | PushNotificationSentEvent;
export type AnalyticsEvent = PageViewEvent | UserActionEvent | MetricRecordedEvent;

export type DomainEvent = UserEvent | StartupEvent | JobEvent | NotificationEvent | AnalyticsEvent;

// Event schema map for validation
export const EVENT_SCHEMAS = {
    UserRegistered: UserRegisteredEventSchema,
    UserProfileUpdated: UserProfileUpdatedEventSchema,
    UserDeleted: UserDeletedEventSchema,
    StartupCreated: StartupCreatedEventSchema,
    StartupUpdated: StartupUpdatedEventSchema,
    StartupDeleted: StartupDeletedEventSchema,
    FundingRoundCreated: FundingRoundCreatedEventSchema,
    JobPosted: JobPostedEventSchema,
    JobUpdated: JobUpdatedEventSchema,
    JobClosed: JobClosedEventSchema,
    ApplicationSubmitted: ApplicationSubmittedEventSchema,
    ApplicationStatusChanged: ApplicationStatusChangedEventSchema,
    NotificationRequested: NotificationRequestedEventSchema,
    EmailSent: EmailSentEventSchema,
    SMSSent: SMSSentEventSchema,
    PushNotificationSent: PushNotificationSentEventSchema,
    PageView: PageViewEventSchema,
    UserAction: UserActionEventSchema,
    MetricRecorded: MetricRecordedEventSchema,
} as const;

export type EventType = keyof typeof EVENT_SCHEMAS;
