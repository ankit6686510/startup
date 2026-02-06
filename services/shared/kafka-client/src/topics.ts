// Kafka Topics Configuration
export const KAFKA_TOPICS = {
    // User domain events
    USER_EVENTS: 'user.events',

    // Startup domain events
    STARTUP_EVENTS: 'startup.events',

    // Job domain events
    JOB_EVENTS: 'job.events',

    // Funding domain events
    FUNDING_EVENTS: 'funding.events',

    // Notification events
    NOTIFICATION_REQUESTS: 'notification.requests',
    NOTIFICATION_RESULTS: 'notification.results',

    // Analytics events
    ANALYTICS_EVENTS: 'analytics.events',

    // Dead letter queue for failed messages
    DLQ: 'dead-letter-queue',
} as const;

export type KafkaTopic = typeof KAFKA_TOPICS[keyof typeof KAFKA_TOPICS];

// Topic configuration with partitions and retention
export interface TopicConfig {
    name: string;
    numPartitions: number;
    replicationFactor: number;
    retentionMs: number; // milliseconds
}

export const TOPIC_CONFIGS: Record<string, TopicConfig> = {
    [KAFKA_TOPICS.USER_EVENTS]: {
        name: KAFKA_TOPICS.USER_EVENTS,
        numPartitions: 3,
        replicationFactor: 1, // 1 for dev, 3 for prod
        retentionMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    [KAFKA_TOPICS.STARTUP_EVENTS]: {
        name: KAFKA_TOPICS.STARTUP_EVENTS,
        numPartitions: 3,
        replicationFactor: 1,
        retentionMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    [KAFKA_TOPICS.JOB_EVENTS]: {
        name: KAFKA_TOPICS.JOB_EVENTS,
        numPartitions: 5,
        replicationFactor: 1,
        retentionMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    [KAFKA_TOPICS.FUNDING_EVENTS]: {
        name: KAFKA_TOPICS.FUNDING_EVENTS,
        numPartitions: 2,
        replicationFactor: 1,
        retentionMs: 90 * 24 * 60 * 60 * 1000, // 90 days
    },
    [KAFKA_TOPICS.NOTIFICATION_REQUESTS]: {
        name: KAFKA_TOPICS.NOTIFICATION_REQUESTS,
        numPartitions: 5,
        replicationFactor: 1,
        retentionMs: 3 * 24 * 60 * 60 * 1000, // 3 days
    },
    [KAFKA_TOPICS.NOTIFICATION_RESULTS]: {
        name: KAFKA_TOPICS.NOTIFICATION_RESULTS,
        numPartitions: 3,
        replicationFactor: 1,
        retentionMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    [KAFKA_TOPICS.ANALYTICS_EVENTS]: {
        name: KAFKA_TOPICS.ANALYTICS_EVENTS,
        numPartitions: 10,
        replicationFactor: 1,
        retentionMs: 90 * 24 * 60 * 60 * 1000, // 90 days
    },
    [KAFKA_TOPICS.DLQ]: {
        name: KAFKA_TOPICS.DLQ,
        numPartitions: 1,
        replicationFactor: 1,
        retentionMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
};
