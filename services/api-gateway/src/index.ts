import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { 
  requestId, 
  rateLimiter, 
  authRateLimiter,
  sanitizeQuery, 
  validateContentType, 
  validateBodySize,
  validateApiVersion,
  requestLogger
} from '@/middleware/validation';
import { optionalAuth, authenticateToken } from '@/middleware/auth';
import {
  startupServiceProxy,
  userServiceProxy,
  jobServiceProxy,
  fundingServiceProxy,
  notificationServiceProxy,
  newsAggregatorProxy
} from '@/middleware/proxy';
import healthRoutes from '@/routes/health';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

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
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (config.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (config.server.env === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// Custom middleware
app.use(requestId);
app.use(requestLogger);
app.use(sanitizeQuery);
app.use(validateContentType);
app.use(validateBodySize(10)); // 10MB limit

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health checks (no auth required)
app.use('/health', healthRoutes);

// API version validation for all API routes
app.use('/api', validateApiVersion);

// Authentication middleware for protected routes
app.use('/api/v1/auth', authRateLimiter); // Stricter rate limiting for auth
app.use('/api/v1', optionalAuth); // Optional auth for most routes

// Service routing with proxies
// Public routes (no auth required)
app.use('/api/v1/startups', startupServiceProxy);
app.use('/api/v1/news', newsAggregatorProxy);

// Auth routes (handled by user service)
app.use('/api/v1/auth', userServiceProxy);
app.use('/api/v1/users', userServiceProxy);

// Protected routes (auth required)
app.use('/api/v1/jobs', authenticateToken, jobServiceProxy);
app.use('/api/v1/applications', authenticateToken, jobServiceProxy);
app.use('/api/v1/funding', authenticateToken, fundingServiceProxy);
app.use('/api/v1/investors', authenticateToken, fundingServiceProxy);
app.use('/api/v1/notifications', authenticateToken, notificationServiceProxy);
app.use('/api/v1/founders', authenticateToken, startupServiceProxy);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'StartupCompass API Gateway',
    version: config.api.version,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      startups: '/api/v1/startups',
      founders: '/api/v1/founders',
      jobs: '/api/v1/jobs',
      applications: '/api/v1/applications',
      funding: '/api/v1/funding',
      investors: '/api/v1/investors',
      notifications: '/api/v1/notifications',
      news: '/api/v1/news',
    },
    documentation: 'https://docs.startupcompass.com',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    app.listen(config.server.port, () => {
      logger.info(`API Gateway running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`API Version: ${config.api.version}`);
      logger.info('Service endpoints:');
      logger.info(`  - Startup Service: ${config.services.startup}`);
      logger.info(`  - User Service: ${config.services.user}`);
      logger.info(`  - Job Service: ${config.services.job}`);
      logger.info(`  - Funding Service: ${config.services.funding}`);
      logger.info(`  - Notification Service: ${config.services.notification}`);
      logger.info(`  - News Aggregator: ${config.services.newsAggregator}`);
    });
  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
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