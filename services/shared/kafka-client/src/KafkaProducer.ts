import { Kafka, Producer, ProducerRecord, RecordMetadata, CompressionTypes } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { DomainEvent, EVENT_SCHEMAS, EventType } from './events/schemas';

export interface KafkaProducerConfig {
    brokers: string[];
    clientId: string;
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
}

export interface PublishOptions {
    key?: string; // Partition key for ordering
    headers?: Record<string, string>;
    partition?: number;
    compression?: CompressionTypes;
}

export class KafkaProducer {
    private kafka: Kafka;
    private producer: Producer;
    private logger: KafkaProducerConfig['logger'];
    private isConnected: boolean = false;

    constructor(config: KafkaProducerConfig) {
        this.logger = config.logger || console;

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

        this.producer = this.kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
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
            await this.producer.connect();
            this.isConnected = true;
            this.logger?.info('Kafka producer connected successfully');
        } catch (error) {
            this.logger?.error('Failed to connect Kafka producer', error);
            throw error;
        }
    }

    /**
     * Publish a single event to Kafka topic
     */
    async publish<T extends DomainEvent>(
        topic: string,
        event: Omit<T, 'eventId' | 'timestamp' | 'version'> & Partial<Pick<T, 'eventId' | 'timestamp' | 'version'>>,
        options?: PublishOptions,
    ): Promise<RecordMetadata[]> {
        if (!this.isConnected) {
            await this.connect();
        }

        // Enrich event with metadata
        const enrichedEvent: DomainEvent = {
            eventId: event.eventId || uuidv4(),
            timestamp: event.timestamp || new Date().toISOString(),
            version: event.version || '1.0',
            ...event,
        } as DomainEvent;

        // Validate event schema
        this.validateEvent(enrichedEvent);

        const message = {
            key: options?.key || enrichedEvent.eventId,
            value: JSON.stringify(enrichedEvent),
            headers: {
                'event-type': enrichedEvent.eventType,
                'event-id': enrichedEvent.eventId,
                'timestamp': enrichedEvent.timestamp,
                ...options?.headers,
            },
            partition: options?.partition,
        };

        try {
            const result = await this.producer.send({
                topic,
                messages: [message],
                compression: options?.compression || CompressionTypes.GZIP,
            });

            this.logger?.info(`Event published to topic ${topic}`, {
                eventType: enrichedEvent.eventType,
                eventId: enrichedEvent.eventId,
                partition: result[0].partition,
                offset: result[0].offset,
            });

            return result;
        } catch (error) {
            this.logger?.error(`Failed to publish event to topic ${topic}`, {
                eventType: enrichedEvent.eventType,
                eventId: enrichedEvent.eventId,
                error,
            });
            throw error;
        }
    }

    /**
     * Publish multiple events in a batch
     */
    async publishBatch<T extends DomainEvent>(
        topic: string,
        events: Array<Omit<T, 'eventId' | 'timestamp' | 'version'> & Partial<Pick<T, 'eventId' | 'timestamp' | 'version'>>>,
        options?: PublishOptions,
    ): Promise<RecordMetadata[]> {
        if (!this.isConnected) {
            await this.connect();
        }

        const messages = events.map((event) => {
            const enrichedEvent: DomainEvent = {
                eventId: event.eventId || uuidv4(),
                timestamp: event.timestamp || new Date().toISOString(),
                version: event.version || '1.0',
                ...event,
            } as DomainEvent;

            this.validateEvent(enrichedEvent);

            return {
                key: options?.key || enrichedEvent.eventId,
                value: JSON.stringify(enrichedEvent),
                headers: {
                    'event-type': enrichedEvent.eventType,
                    'event-id': enrichedEvent.eventId,
                    'timestamp': enrichedEvent.timestamp,
                    ...options?.headers,
                },
            };
        });

        try {
            const result = await this.producer.send({
                topic,
                messages,
                compression: options?.compression || CompressionTypes.GZIP,
            });

            this.logger?.info(`Batch of ${events.length} events published to topic ${topic}`);

            return result;
        } catch (error) {
            this.logger?.error(`Failed to publish batch to topic ${topic}`, error);
            throw error;
        }
    }

    /**
     * Validate event against its schema
     */
    private validateEvent(event: DomainEvent): void {
        const schema = EVENT_SCHEMAS[event.eventType as EventType];
        if (!schema) {
            throw new Error(`Unknown event type: ${event.eventType}`);
        }

        const result = schema.safeParse(event);
        if (!result.success) {
            this.logger?.error('Event validation failed', {
                eventType: event.eventType,
                errors: result.error.errors,
            });
            throw new Error(`Event validation failed: ${JSON.stringify(result.error.errors)}`);
        }
    }

    /**
     * Disconnect from Kafka broker
     */
    async disconnect(): Promise<void> {
        try {
            await this.producer.disconnect();
            this.isConnected = false;
            this.logger?.info('Kafka producer disconnected');
        } catch (error) {
            this.logger?.error('Error disconnecting Kafka producer', error);
            throw error;
        }
    }

    /**
     * Send events in a transaction (all or nothing)
     */
    async sendTransaction<T extends DomainEvent>(
        records: Array<{ topic: string; event: T; options?: PublishOptions }>,
    ): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }

        const transaction = await this.producer.transaction();

        try {
            for (const record of records) {
                const enrichedEvent: DomainEvent = {
                    ...record.event,
                    eventId: record.event.eventId || uuidv4(),
                    timestamp: record.event.timestamp || new Date().toISOString(),
                    version: record.event.version || '1.0',
                } as DomainEvent;

                this.validateEvent(enrichedEvent);

                await transaction.send({
                    topic: record.topic,
                    messages: [
                        {
                            key: record.options?.key || enrichedEvent.eventId,
                            value: JSON.stringify(enrichedEvent),
                            headers: {
                                'event-type': enrichedEvent.eventType,
                                'event-id': enrichedEvent.eventId,
                                'timestamp': enrichedEvent.timestamp,
                                ...record.options?.headers,
                            },
                        },
                    ],
                });
            }

            await transaction.commit();
            this.logger?.info(`Transaction committed with ${records.length} events`);
        } catch (error) {
            await transaction.abort();
            this.logger?.error('Transaction aborted', error);
            throw error;
        }
    }
}
