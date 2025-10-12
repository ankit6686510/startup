import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { logger } from '@/utils/logger';

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = uuidv4();
  (req as any).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};

// Rate limiting middleware
export const createRateLimiter = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || config.rateLimit.windowMs,
    max: max || config.rateLimit.maxRequests,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
      });
    },
  });
};

// Default rate limiter
export const rateLimiter = createRateLimiter();

// Strict rate limiter for auth endpoints
export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes

// Query sanitization middleware
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Remove potential NoSQL injection patterns
        req.query[key] = (req.query[key] as string).replace(/[{}$]/g, '');
      }
    });
  }
  next();
};

// Content type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json',
        timestamp: new Date().toISOString(),
      });
    }
  }
  next();
};

// Body size validation
export const validateBodySize = (maxSize: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('Content-Length');
    if (contentLength && parseInt(contentLength) > maxSize * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: `Request body too large. Maximum size is ${maxSize}MB`,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};

// API version validation
export const validateApiVersion = (req: Request, res: Response, next: NextFunction) => {
  const version = req.path.split('/')[2]; // /api/v1/...
  const supportedVersions = ['v1'];
  
  if (!supportedVersions.includes(version)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported API version: ${version}. Supported versions: ${supportedVersions.join(', ')}`,
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: (req as any).requestId,
    });
  });
  
  next();
};