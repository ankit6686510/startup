import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { AppDataSource } from '@/config/database';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { NotificationService } from '@/services/NotificationService';
import { NotificationQueue } from '@/queues/NotificationQueue';
import notificationRoutes from '@/routes/notification.routes';
import healthRoutes from '@/routes/health.routes';

const app = express();
const PORT = process.env.PORT || 3005;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Role', 'X-User-Email'],
  }),
);

// Compression
app.use(compression());

// Request logging
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Rate limiting
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health checks (no auth required)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/v1/notifications', notificationRoutes);

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Notification Service API',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      notifications: '/api/v1/notifications',
      health: '/health',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Setup services
const notificationService = new NotificationService();
const notificationQueue = new NotificationQueue();

// Setup scheduled tasks
const setupScheduledTasks = () => {
  // Process scheduled notifications every minute
  cron.schedule('* * * * *', async () => {
    try {
      logger.info('Running scheduled notification processing');
      // TODO: Implement scheduled notification processing
      logger.info('Scheduled notification processing completed');
    } catch (error) {
      logger.error('Error in scheduled notification processing:', error);
    }
  });

  // Clean up old notifications daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Running notification cleanup task');
      // TODO: Implement notification cleanup
      logger.info('Notification cleanup completed');
    } catch (error) {
      logger.error('Error in notification cleanup:', error);
    }
  });

  // Generate daily statistics at 1 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      logger.info('Generating daily notification statistics');
      // TODO: Implement statistics generation
      logger.info('Daily statistics generated');
    } catch (error) {
      logger.error('Error generating daily statistics:', error);
    }
  });

  logger.info('Scheduled tasks configured');
};

// Setup queue processors
const setupQueueProcessors = () => {
  const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '5');

  // Send notification processor
  notificationQueue.process('send-notification', concurrency, async (job) => {
    const { notificationId } = job.data;

    try {
      await notificationService.sendNotification(notificationId);
      await job.progress(100);
    } catch (error) {
      logger.error(`Failed to send notification ${notificationId}:`, error);
      throw error;
    }
  });

  logger.info(`Queue processors configured with concurrency: ${concurrency}`);
};

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established');

    // Run migrations
    await AppDataSource.runMigrations();
    logger.info('Database migrations completed');

    // Setup scheduled tasks
    setupScheduledTasks();

    // Setup queue processors
    setupQueueProcessors();

    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('Available endpoints:');
      logger.info('  - Notifications: /api/v1/notifications');
      logger.info('  - Health: /health');
    });
  } catch (error) {
    logger.error('Failed to start Notification Service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  try {
    await AppDataSource.destroy();
    await notificationQueue.close();
    logger.info('Database and queue connections closed');
  } catch (error) {
    logger.error('Error during shutdown:', error);
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export default app;
