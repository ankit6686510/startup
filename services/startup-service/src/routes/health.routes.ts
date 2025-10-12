import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { HealthCheckResponse } from '@startup-platform/types';

const router = Router();

// GET /health - Basic health check
router.get('/', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    try {
      await AppDataSource.query('SELECT 1');
    } catch (error) {
      dbStatus = 'unhealthy';
    }

    // TODO: Add Redis health check when implemented
    const redisStatus: 'healthy' | 'unhealthy' = 'healthy';
    
    // TODO: Add Elasticsearch health check when implemented
    const elasticsearchStatus: 'healthy' | 'unhealthy' = 'healthy';
    
    // TODO: Add external APIs health check when implemented
    const externalApisStatus: 'healthy' | 'unhealthy' = 'healthy';

    const overall = dbStatus === 'healthy' && redisStatus === 'healthy' && 
                   elasticsearchStatus === 'healthy' && externalApisStatus === 'healthy' 
                   ? 'healthy' : 'unhealthy';

    const response: HealthCheckResponse = {
      status: overall,
      services: {
        database: dbStatus,
        redis: redisStatus,
        elasticsearch: elasticsearchStatus,
        externalApis: externalApisStatus
      },
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };

    const statusCode = overall === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      services: {
        database: 'unhealthy',
        redis: 'unhealthy',
        elasticsearch: 'unhealthy',
        externalApis: 'unhealthy'
      },
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      error: 'Health check failed'
    });
  }
});

// GET /health/ready - Readiness probe
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    await AppDataSource.query('SELECT 1');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date(),
      message: 'Service is ready to accept requests'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date(),
      message: 'Service is not ready',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /health/live - Liveness probe
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date(),
    uptime: process.uptime(),
    message: 'Service is alive'
  });
});

export default router;
