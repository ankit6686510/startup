import { KafkaConsumer, KAFKA_TOPICS, UserRegisteredEvent, StartupCreatedEvent, ApplicationStatusChangedEvent, DomainEvent } from '@startup/kafka-client';
import { logger } from '@/utils/logger';
import { NotificationService } from '@/services/NotificationService';
import { NotificationQueue } from '@/queues/NotificationQueue';

export class KafkaEventConsumer {
    private consumer: KafkaConsumer;
    private notificationService: NotificationService;
    private notificationQueue: NotificationQueue;

    constructor() {
        this.notificationService = new NotificationService();
        this.notificationQueue = new NotificationQueue();

        // Initialize Kafka consumer
        this.consumer = new KafkaConsumer({
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
            groupId: 'notification-service-group',
            clientId: 'notification-service',
            logger: logger,
        });

        this.setupEventHandlers();
    }

    /**
     * Setup event handlers for different event types
     */
    private setupEventHandlers(): void {
        // Handle UserRegisteredEvent
        this.consumer.onEvent<UserRegisteredEvent>('UserRegistered', async (event) => {
            logger.info(`Processing UserRegisteredEvent for user: ${event.data.userId}`);

            try {
                // Send welcome email
                await this.notificationQueue.addNotification({
                    type: 'email',
                    recipientId: event.data.userId,
                    recipientEmail: event.data.email,
                    subject: 'Welcome to StartupCompass!',
                    template: 'welcome-email',
                    data: {
                        firstName: event.data.firstName,
                        lastName: event.data.lastName,
                        email: event.data.email,
                    },
                    priority: 'high',
                });

                logger.info(`Welcome email queued for user: ${event.data.email}`);
            } catch (error) {
                logger.error(`Failed to process UserRegisteredEvent for user ${event.data.userId}:`, error);
                throw error; // Will be sent to DLQ
            }
        });

        // Handle StartupCreatedEvent
        this.consumer.onEvent<StartupCreatedEvent>('StartupCreated', async (event) => {
            logger.info(`Processing StartupCreatedEvent for startup: ${event.data.startupId}`);

            try {
                // Send startup creation confirmation email to founder
                await this.notificationQueue.addNotification({
                    type: 'email',
                    recipientId: event.data.founderId,
                    subject: `Your startup "${event.data.name}" has been created!`,
                    template: 'startup-created',
                    data: {
                        startupName: event.data.name,
                        startupId: event.data.startupId,
                        industry: event.data.industry,
                        stage: event.data.stage,
                    },
                    priority: 'medium',
                });

                logger.info(`Startup creation email queued for startup: ${event.data.name}`);
            } catch (error) {
                logger.error(`Failed to process StartupCreatedEvent for startup ${event.data.startupId}:`, error);
                throw error;
            }
        });

        // Handle ApplicationStatusChangedEvent
        this.consumer.onEvent<ApplicationStatusChangedEvent>('ApplicationStatusChanged', async (event) => {
            logger.info(`Processing ApplicationStatusChangedEvent for application: ${event.data.applicationId}`);

            try {
                // Determine email template based on new status
                let template = 'application-status-update';
                let subject = 'Your job application status has been updated';
                let priority: 'high' | 'medium' | 'low' = 'medium';

                switch (event.data.newStatus) {
                    case 'UNDER_REVIEW':
                        subject = 'Your application is under review';
                        template = 'application-under-review';
                        break;
                    case 'INTERVIEW_SCHEDULED':
                        subject = 'Interview scheduled for your application';
                        template = 'interview-scheduled';
                        priority = 'high';
                        break;
                    case 'ACCEPTED':
                        subject = 'Congratulations! Your application has been accepted';
                        template = 'application-accepted';
                        priority = 'high';
                        break;
                    case 'REJECTED':
                        subject = 'Update on your job application';
                        template = 'application-rejected';
                        break;
                    default:
                        template = 'application-status-update';
                }

                // Queue notification for applicant
                await this.notificationQueue.addNotification({
                    type: 'email',
                    recipientId: event.data.applicantId,
                    subject,
                    template,
                    data: {
                        applicationId: event.data.applicationId,
                        jobId: event.data.jobId,
                        previousStatus: event.data.previousStatus,
                        newStatus: event.data.newStatus,
                        changeReason: event.data.changeReason,
                    },
                    priority,
                });

                // Also send push notification for important status changes
                if (['INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].includes(event.data.newStatus)) {
                    await this.notificationQueue.addNotification({
                        type: 'push',
                        recipientId: event.data.applicantId,
                        title: subject,
                        body: `Your application status has been updated to ${event.data.newStatus}`,
                        data: {
                            applicationId: event.data.applicationId,
                            jobId: event.data.jobId,
                            status: event.data.newStatus,
                        },
                        priority: 'high',
                    });
                }

                logger.info(`Application status notification queued for applicant: ${event.data.applicantId}`);
            } catch (error) {
                logger.error(`Failed to process ApplicationStatusChangedEvent for application ${event.data.applicationId}:`, error);
                throw error;
            }
        });

        logger.info('Kafka event handlers configured');
    }

    /**
     * Start consuming events from Kafka
     */
    async start(): Promise<void> {
        try {
            // Connect to Kafka
            await this.consumer.connect();
            logger.info('Kafka consumer connected');

            // Subscribe to topics
            await this.consumer.subscribe([
                KAFKA_TOPICS.USER_EVENTS,
                KAFKA_TOPICS.STARTUP_EVENTS,
                KAFKA_TOPICS.JOB_EVENTS,
            ]);
            logger.info('Subscribed to Kafka topics: user.events, startup.events, job.events');

            // Start consuming
            await this.consumer.start();
            logger.info('Kafka consumer started successfully');
        } catch (error) {
            logger.error('Failed to start Kafka consumer:', error);
            throw error;
        }
    }

    /**
     * Stop consuming events and disconnect
     */
    async stop(): Promise<void> {
        try {
            await this.consumer.stop();
            await this.consumer.disconnect();
            logger.info('Kafka consumer stopped and disconnected');
        } catch (error) {
            logger.error('Error stopping Kafka consumer:', error);
            throw error;
        }
    }
}
