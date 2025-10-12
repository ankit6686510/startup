import { Router, Request, Response } from 'express';
import { AppDataSource } from '@/config/database';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
}));

// Detailed health check with dependencies
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  const checks = {
    database: false,
    redis: false,
    email: false,
    sms: false,
  };
  
  // Check database connection
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SELECT 1');
      checks.database = true;
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
  }
  
  // Check Redis connection
  try {
    const Redis = require('redis');
    const redisClient = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });
    await redisClient.ping();
    checks.redis = true;
    redisClient.quit();
  } catch (error) {
    logger.error('Redis health check failed:', error);
  }
  
  // Check email service
  try {
    const { EmailProvider } = require('@/providers/EmailProvider');
    const emailProvider = new EmailProvider();
    checks.email = await emailProvider.testConnection();
  } catch (error) {
    logger.error('Email service health check failed:', error);
  }
  
  // Check SMS service
  try {
    const { SmsProvider } = require('@/providers/SmsProvider');
    const smsProvider = new SmsProvider();
    checks.sms = await smsProvider.testConnection();
  } catch (error) {
    logger.error('SMS service health check failed:', error);
  }
  
  const totalResponseTime = Date.now() - startTime;
  const healthyServices = Object.values(checks).filter(Boolean).length;
  const totalServices = Object.keys(checks).length;
  
  const overallStatus = healthyServices === totalServices ? 'healthy' : 
                       healthyServices > 0 ? 'degraded' : 'unhealthy';
  
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const response = {
    success: true,
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: `${totalResponseTime}ms`,
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    dependencies: {
      healthy: healthyServices,
      total: totalServices,
      checks,
    },
  };
  
  res.status(overallStatus === 'healthy' ? 200 : 503).json(response);
}));

// Readiness check (for Kubernetes)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    if (!AppDataSource.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    await AppDataSource.query('SELECT 1');
    
    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

// Liveness check (for Kubernetes)
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
}));

export default router;