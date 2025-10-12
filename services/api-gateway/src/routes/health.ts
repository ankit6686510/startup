import { Router, Request, Response } from 'express';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

interface ServiceHealth {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

const checkServiceHealth = async (name: string, url: string): Promise<ServiceHealth> => {
  const start = Date.now();
  
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        name,
        url,
        status: 'healthy',
        responseTime,
      };
    } else {
      return {
        name,
        url,
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      name,
      url,
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

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
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0',
  });
}));

// Detailed health check with service dependencies
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Check all downstream services
  const serviceChecks = await Promise.all([
    checkServiceHealth('startup-service', config.services.startup),
    checkServiceHealth('user-service', config.services.user),
    checkServiceHealth('job-service', config.services.job),
    checkServiceHealth('funding-service', config.services.funding),
    checkServiceHealth('notification-service', config.services.notification),
    checkServiceHealth('news-aggregator', config.services.newsAggregator),
  ]);
  
  const totalResponseTime = Date.now() - startTime;
  const healthyServices = serviceChecks.filter(service => service.status === 'healthy').length;
  const totalServices = serviceChecks.length;
  
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
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      healthy: healthyServices,
      total: totalServices,
      details: serviceChecks,
    },
  };
  
  // Log unhealthy services
  const unhealthyServices = serviceChecks.filter(service => service.status !== 'healthy');
  if (unhealthyServices.length > 0) {
    logger.warn('Unhealthy services detected:', unhealthyServices);
  }
  
  res.status(overallStatus === 'healthy' ? 200 : 503).json(response);
}));

// Readiness check (for Kubernetes)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  // Check if the gateway is ready to serve traffic
  // This could include checking database connections, required services, etc.
  
  const criticalServices = [
    config.services.startup,
    config.services.user,
  ];
  
  const checks = await Promise.all(
    criticalServices.map(async (url, index) => {
      const serviceName = ['startup-service', 'user-service'][index];
      return checkServiceHealth(serviceName, url);
    })
  );
  
  const allCriticalHealthy = checks.every(check => check.status === 'healthy');
  
  if (allCriticalHealthy) {
    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'not ready',
      timestamp: new Date().toISOString(),
      criticalServices: checks,
    });
  }
}));

// Liveness check (for Kubernetes)
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  // Simple liveness check - just verify the process is running
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
}));

export default router;