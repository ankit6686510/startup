import { KafkaProducer } from '../src/KafkaProducer';
import { Kafka } from 'kafkajs';
import { KAFKA_TOPICS } from '../src/topics';
import { UserRegisteredEvent } from '../src/events/schemas';

// Mock KafkaJS
jest.mock('kafkajs', () => {
    const mockProducer = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
        sendBatch: jest.fn(),
        on: jest.fn(),
    };

    const mockAdmin = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        createTopics: jest.fn(),
        fetchTopicMetadata: jest.fn(),
    };

    return {
        Kafka: jest.fn(() => ({
            producer: jest.fn(() => mockProducer),
            admin: jest.fn(() => mockAdmin),
        })),
        Partitioners: {
            DefaultPartitioner: jest.fn(),
        },
        CompressionTypes: {
            GZIP: 1,
        },
    };
});

describe('KafkaProducer', () => {
    let kafkaProducer: KafkaProducer;
    let mockLogger: any;
    let mockKafkaInstance: any;
    let mockProducerInstance: any;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };

        kafkaProducer = new KafkaProducer({
            brokers: ['localhost:9092'],
            clientId: 'test-client',
            logger: mockLogger,
        });

        // Get the mock instances from the mock factory
        mockKafkaInstance = (Kafka as unknown as jest.Mock).mock.results[0].value;
        mockProducerInstance = mockKafkaInstance.producer();
    });

    describe('connect', () => {
        it('should connect to kafka broker successfully', async () => {
            mockProducerInstance.connect.mockResolvedValue(undefined);

            await kafkaProducer.connect();

            expect(mockProducerInstance.connect).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Kafka producer connected successfully'));
        });

        it('should log error if connection fails', async () => {
            const error = new Error('Connection failed');
            mockProducerInstance.connect.mockRejectedValue(error);

            await expect(kafkaProducer.connect()).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to connect Kafka producer'), error);
        });
    });

    describe('publish', () => {
        const validEvent: UserRegisteredEvent = {
            eventId: '123e4567-e89b-12d3-a456-426614174000',
            eventType: 'UserRegistered',
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'John',
                lastName: 'Doe',
            },
        };

        it('should publish a valid event successfully', async () => {
            mockProducerInstance.connect.mockResolvedValue(undefined);
            mockProducerInstance.send.mockResolvedValue([{ topicName: KAFKA_TOPICS.USER_EVENTS, partition: 0, errorCode: 0 }]);

            await kafkaProducer.connect();

            // We need to bypass the generated event properties for the test input
            // because the publish method generates them if missing
            const inputEvent = {
                eventType: validEvent.eventType,
                data: validEvent.data,
            };

            await kafkaProducer.publish(KAFKA_TOPICS.USER_EVENTS, inputEvent, { key: '123e4567-e89b-12d3-a456-426614174001' });

            expect(mockProducerInstance.send).toHaveBeenCalledWith(expect.objectContaining({
                topic: KAFKA_TOPICS.USER_EVENTS,
                messages: expect.arrayContaining([
                    expect.objectContaining({
                        key: '123e4567-e89b-12d3-a456-426614174001',
                        value: expect.any(String), // The serialized JSON
                    }),
                ]),
            }));
        });

        it('should throw error/log if schema validation fails', async () => {
            await kafkaProducer.connect();

            const invalidEvent = {
                eventType: 'UserRegistered',
                data: {
                    // Missing required fields
                    userId: 'user-123',
                },
            };

            // Depending on implementation, it might throw or just log. 
            // Based on our implementation, it throws ZodError.
            await expect(kafkaProducer.publish(KAFKA_TOPICS.USER_EVENTS, invalidEvent as any)).rejects.toThrow();
        });
    });
});
