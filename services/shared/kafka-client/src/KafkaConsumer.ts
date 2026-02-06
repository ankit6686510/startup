import {
    Kafka,
    Consumer,
    EachMessagePayload,
    ConsumerSubscribeTopics,
    ConsumerRunConfig,
    KafkaMessage,
} from 'kafkajs';
import { DomainEvent, EVENT_SCHEMAS, EventType } from './events/schemas';

export interface KafkaConsumerConfig {
    brokers: string[];
    clientId: string;
    groupId: string;
    ssl?: boolean;
    sasl?: {
        mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
        username: string;
        password: string;
    };
    retry?: {
        initialRetryTime?: number;
        retries?: number;
    };
    logger?: {
        info: (message: string, extra?: any) => void;
        error: (message: string, extra?: any) => void;
        warn: (message: string, extra?: any) => void;
        debug: (message: string, extra?: any) => void;
    };
    fromBeginning?: boolean;
    autoCommit?: boolean;
    autoCommitInterval?: number;
}

export interface MessageContext {
    topic: string;
    partition: number;
    offset: string;
    timestamp: string;
    headers: Record<string, string>;
}

export type MessageHandler<T extends DomainEvent = DomainEvent> = (
    event: T,
    context: MessageContext,
) => Promise<void>;

export interface DeadLetterQueueConfig {
    topic: string;
    enabled: boolean;
}

export class KafkaConsumer {
    private kafka: Kafka;
    private consumer: Consumer;
    private logger: KafkaConsumerConfig['logger'];
    private isConnected: boolean = false;
    private isPaused: boolean = false;
    private handlers: Map<string, MessageHandler> = new Map();
    private dlqConfig?: DeadLetterQueueConfig;

    constructor(config: KafkaConsumerConfig, dlqConfig?: DeadLetterQueueConfig) {
        this.logger = config.logger || console;
        this.dlqConfig = dlqConfig;

        this.kafka = new Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
            ssl: config.ssl,
            sasl: config.sasl as any,
            retry: {
                initialRetryTime: config.retry?.initialRetryTime || 100,
                retries: config.retry?.retries || 8,
            },
        });

        this.consumer = this.kafka.consumer({
            groupId: config.groupId,
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            maxWaitTimeInMs: 5000,
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
        });
    }

    /**
     * Connect to Kafka broker
     */
    async connect(): Promise<void> {
        try {
            await this.consumer.connect();
            this.isConnected = true;
            this.logger?.info('Kafka consumer connected successfully');
        } catch (error) {
            this.logger?.error('Failed to connect Kafka consumer', error);
            throw error;
        }
    }

    /**
     * Subscribe to topics
     */
    async subscribe(topics: string[] | ConsumerSubscribeTopics, fromBeginning: boolean = false): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            if (Array.isArray(topics)) {
                await this.consumer.subscribe({ topics, fromBeginning });
            } else {
                await this.consumer.subscribe({ ...topics, fromBeginning });
            }
            this.logger?.info('Subscribed to topics', { topics });
        } catch (error) {
            this.logger?.error('Failed to subscribe to topics', error);
            throw error;
        }
    }

    /**
     * Register a message handler for a specific event type
     */
    onEvent<T extends DomainEvent>(eventType: EventType, handler: MessageHandler<T>): void {
        this.handlers.set(eventType, handler as MessageHandler);
        this.logger?.debug(`Registered handler for event type: ${eventType}`);
    }

    /**
     * Start consuming messages
     */
    async start(): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }

        await this.consumer.run({
            autoCommit: true,
            autoCommitInterval: 5000,
            eachMessage: async (payload: EachMessagePayload) => {
                await this.processMessage(payload);
            },
        });

        this.logger?.info('Kafka consumer started');
    }

    /**
     * Process individual message
     */
    private async processMessage(payload: EachMessagePayload): Promise<void> {
        const { topic, partition, message } = payload;

        try {
            // Parse message
            const event = this.parseMessage(message);

            // Build context
            const context: MessageContext = {
                topic,
                partition,
                offset: message.offset,
                timestamp: message.timestamp,
                headers: this.parseHeaders(message.headers),
            };

            // Validate event
            this.validateEvent(event);

            // Find and execute handler
            const handler = this.handlers.get(event.eventType);
            if (handler) {
                await handler(event, context);
                this.logger?.debug(`Successfully processed event`, {
                    eventType: event.eventType,
                    eventId: event.eventId,
                    topic,
                    partition,
                    offset: message.offset,
                });
            } else {
                this.logger?.warn(`No handler registered for event type: ${event.eventType}`, {
                    eventId: event.eventId,
                    topic,
                });
            }
        } catch (error) {
            this.logger?.error('Error processing message', {
                topic,
                partition,
                offset: message.offset,
                error,
            });

            // Send to dead letter queue if configured
            if (this.dlqConfig?.enabled) {
                await this.sendToDeadLetterQueue(message, topic, error as Error);
            }

            // Don't throw - let Kafka handle retries via consumer group
        }
    }

    /**
     * Parse Kafka message to domain event
     */
    private parseMessage(message: KafkaMessage): DomainEvent {
        if (!message.value) {
            throw new Error('Message value is null');
        }

        const value = message.value.toString();
        return JSON.parse(value) as DomainEvent;
    }

    /**
     * Parse message headers
     */
    private parseHeaders(headers?: KafkaMessage['headers']): Record<string, string> {
        if (!headers) return {};

        const parsed: Record<string, string> = {};
        for (const [key, value] of Object.entries(headers)) {
            if (value) {
                parsed[key] = value.toString();
            }
        }
        return parsed;
    }

    /**
     * Validate event against schema
     */
    private validateEvent(event: DomainEvent): void {
        const schema = EVENT_SCHEMAS[event.eventType as EventType];
        if (!schema) {
            throw new Error(`Unknown event type: ${event.eventType}`);
        }

        const result = schema.safeParse(event);
        if (!result.success) {
            throw new Error(`Event validation failed: ${JSON.stringify(result.error.errors)}`);
        }
    }

    /**
     * Send failed message to dead letter queue
     */
    private async sendToDeadLetterQueue(message: KafkaMessage, originalTopic: string, error: Error): Promise<void> {
        if (!this.dlqConfig?.topic) return;

        try {
            const producer = this.kafka.producer();
            await producer.connect();

            await producer.send({
                topic: this.dlqConfig.topic,
                messages: [
                    {
                        key: message.key,
                        value: message.value,
                        headers: {
                            ...message.headers,
                            'original-topic': originalTopic,
                            'error-message': error.message,
                            'error-timestamp': new Date().toISOString(),
                        },
                    },
                ],
            });

            await producer.disconnect();

            this.logger?.info('Message sent to dead letter queue', {
                originalTopic,
                dlqTopic: this.dlqConfig.topic,
            });
        } catch (dlqError) {
            this.logger?.error('Failed to send message to dead letter queue', dlqError);
        }
    }

    /**
     * Stop consuming messages
     */
    async stop(): Promise<void> {
        try {
            await this.consumer.stop();
            this.logger?.info('Kafka consumer stopped');
        } catch (error) {
            this.logger?.error('Error stopping Kafka consumer', error);
            throw error;
        }
    }

    /**
     * Disconnect from Kafka broker
     */
    async disconnect(): Promise<void> {
        try {
            if (this.isPaused) {
                this.consumer.resume([{ topic: '' }]); // Resume all
                this.isPaused = false;
                this.logger?.info('Kafka consumer resumed');
            }
            await this.consumer.disconnect();
            this.isConnected = false;
            this.logger?.info('Kafka consumer disconnected');
        } catch (error) {
            this.logger?.error('Error disconnecting Kafka consumer', error);
            throw error;
        }
    }

    /**
     * Pause consumption
     */
    async pause(topics: Array<{ topic: string; partitions?: number[] }>): Promise<void> {
        this.consumer.pause(topics);
        this.logger?.info('Consumer paused', { topics });
    }

    /**
     * Resume consumption
     */
    async resume(topics: Array<{ topic: string; partitions?: number[] }>): Promise<void> {
        this.consumer.resume(topics);
        this.logger?.info('Consumer resumed', { topics });
    }

    /**
     * Seek to a specific offset
     */
    async seek(topic: string, partition: number, offset: string): Promise<void> {
        this.consumer.seek({ topic, partition, offset });
        this.logger?.info('Consumer seeked', { topic, partition, offset });
    }
}
