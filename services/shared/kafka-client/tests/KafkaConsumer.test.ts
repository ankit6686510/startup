import { KafkaConsumer } from '../src/KafkaConsumer';
import { Kafka } from 'kafkajs';
import { KAFKA_TOPICS } from '../src/topics';
import { UserRegisteredEvent } from '../src/events/schemas';

// Mock KafkaJS
jest.mock('kafkajs', () => {
    const mockConsumer = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        run: jest.fn(),
        stop: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        seek: jest.fn(),
        on: jest.fn(),
    };

    const mockProducer = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
    };

    return {
        Kafka: jest.fn(() => ({
            consumer: jest.fn(() => mockConsumer),
            producer: jest.fn(() => mockProducer),
        })),
    };
});

describe('KafkaConsumer', () => {
    let kafkaConsumer: KafkaConsumer;
    let mockLogger: any;
    let mockKafkaInstance: any;
    let mockConsumerInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };

        kafkaConsumer = new KafkaConsumer({
            brokers: ['localhost:9092'],
            clientId: 'test-consumer',
            groupId: 'test-group',
            logger: mockLogger,
        });

        // Get the mock instances
        mockKafkaInstance = (Kafka as unknown as jest.Mock).mock.results[0].value;
        mockConsumerInstance = mockKafkaInstance.consumer();
    });

    describe('connect', () => {
        it('should connect to kafka broker successfully', async () => {
            mockConsumerInstance.connect.mockResolvedValue(undefined);

            await kafkaConsumer.connect();

            expect(mockConsumerInstance.connect).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith('Kafka consumer connected successfully');
        });

        it('should log error if connection fails', async () => {
            const error = new Error('Connection failed');
            mockConsumerInstance.connect.mockRejectedValue(error);

            await expect(kafkaConsumer.connect()).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalledWith('Failed to connect Kafka consumer', error);
        });
    });

    describe('subscribe', () => {
        it('should subscribe to topics successfully', async () => {
            mockConsumerInstance.connect.mockResolvedValue(undefined);
            mockConsumerInstance.subscribe.mockResolvedValue(undefined);

            await kafkaConsumer.connect(); // Ensure connected
            await kafkaConsumer.subscribe([KAFKA_TOPICS.USER_EVENTS]);

            expect(mockConsumerInstance.subscribe).toHaveBeenCalledWith({
                topics: [KAFKA_TOPICS.USER_EVENTS],
                fromBeginning: false,
            });
            expect(mockLogger.info).toHaveBeenCalledWith('Subscribed to topics', { topics: [KAFKA_TOPICS.USER_EVENTS] });
        });
    });

    describe('message processing', () => {
        it('should process a valid message and call the registered handler', async () => {
            // Setup handler
            const mockHandler = jest.fn().mockResolvedValue(undefined);
            kafkaConsumer.onEvent('UserRegistered', mockHandler);

            // Mock run to capture the eachMessage callback
            let eachMessageCallback: any;
            mockConsumerInstance.run.mockImplementation(async (config: any) => {
                eachMessageCallback = config.eachMessage;
            });

            await kafkaConsumer.start();

            // Simulate incoming message
            const validEventData: UserRegisteredEvent = {
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

            const payload = {
                topic: KAFKA_TOPICS.USER_EVENTS,
                partition: 0,
                message: {
                    key: Buffer.from('test-key'),
                    value: Buffer.from(JSON.stringify(validEventData)),
                    offset: '1',
                    timestamp: '1234567890',
                    headers: {},
                },
            };

            // manually trigger the callback
            await eachMessageCallback(payload);

            expect(mockHandler).toHaveBeenCalled();
            expect(mockHandler).toHaveBeenCalledWith(
                expect.objectContaining({ eventId: validEventData.eventId }),
                expect.objectContaining({ topic: KAFKA_TOPICS.USER_EVENTS })
            );
        });

        it('should log warning if no handler for event type', async () => {
            // Mock run to capture the eachMessage callback
            let eachMessageCallback: any;
            mockConsumerInstance.run.mockImplementation(async (config: any) => {
                eachMessageCallback = config.eachMessage;
            });

            await kafkaConsumer.start();

            const eventData = {
                eventId: '123e4567-e89b-12d3-a456-426614174000',
                timestamp: new Date().toISOString(),
                version: '1.0',
                // we bypass validation for a moment or assumes schema validator throws first? 
                // Actually schema validator checks "Unknown event type" if it's not in schema. 
                // If it IS in schema but no handler, then it logs warning. 
                // Let's use a valid schema type but no handler.
                eventType: 'UserDeleted' // Valid schema, but we didn't register handler
            };
            // Wait, we need real data for UserDeleted to pass schema validation
            const validUserDeleted: any = {
                eventId: '123e4567-e89b-12d3-a456-426614174000',
                eventType: 'UserDeleted',
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    userId: '123e4567-e89b-12d3-a456-426614174001',
                    deletedAt: new Date().toISOString()
                }
            };


            const payload = {
                topic: KAFKA_TOPICS.USER_EVENTS,
                partition: 0,
                message: {
                    key: Buffer.from('test-key'),
                    value: Buffer.from(JSON.stringify(validUserDeleted)),
                    offset: '1',
                    timestamp: '1234567890',
                    headers: {},
                },
            };

            await eachMessageCallback(payload);

            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining('No handler registered for event type'),
                expect.any(Object)
            );
        });
    });
});
