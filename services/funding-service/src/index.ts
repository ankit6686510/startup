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
import fundingRoutes from '@/routes/funding.routes';
import investorRoutes from '@/routes/investor.routes';
import investmentRoutes from '@/routes/investment.routes';
import healthRoutes from '@/routes/health.routes';

const app = express();
const PORT = process.env.PORT || 3004;

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
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Role', 'X-User-Email'],
}));

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// Rate limiting
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health checks (no auth required)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/v1/funding', fundingRoutes);
app.use('/api/v1/investors', investorRoutes);
app.use('/api/v1/investments', investmentRoutes);

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Funding Service API',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      funding: '/api/v1/funding',
      investors: '/api/v1/investors',
      investments: '/api/v1/investments',
      health: '/health',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Setup scheduled tasks
const setupScheduledTasks = () => {
  // Update market data daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Running scheduled market data update task');
      // TODO: Implement market data sync
      logger.info('Market data update completed');
    } catch (error) {
      logger.error('Error running scheduled market data update:', error);
    }
  });

  // Update investor credibility scores weekly
  cron.schedule('0 4 * * 0', async () => {
    try {
      logger.info('Running scheduled investor credibility score update');
      // TODO: Implement credibility score update
      logger.info('Investor credibility score update completed');
    } catch (error) {
      logger.error('Error running scheduled credibility score update:', error);
    }
  });

  logger.info('Scheduled tasks configured');
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

    app.listen(PORT, () => {
      logger.info(`Funding Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('Available endpoints:');
      logger.info('  - Funding: /api/v1/funding');
      logger.info('  - Investors: /api/v1/investors');
      logger.info('  - Investments: /api/v1/investments');
      logger.info('  - Health: /health');
    });
  } catch (error) {
    logger.error('Failed to start Funding Service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
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