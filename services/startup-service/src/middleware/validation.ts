import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler';

// Generic validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    for (const validation of validations) {
      await validation.run(req);
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new ValidationError(
        firstError.msg,
        'param' in firstError ? String(firstError.param) : 'unknown',
      );
    }

    next();
  };
};

// Request logging middleware
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId =
    req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);

  next();
};

// CORS middleware for development
export const corsHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID',
  );
  res.header('Access-Control-Expose-Headers', 'X-Request-ID');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

// Content type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      throw new ValidationError('Content-Type must be application/json');
    }
  }
  next();
};

// Body size validation
export const validateBodySize = (maxSize: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = maxSize * 1024 * 1024; // Convert MB to bytes

    if (contentLength > maxBytes) {
      throw new ValidationError(`Request body too large. Maximum size is ${maxSize}MB`);
    }

    next();
  };
};

// Query parameter sanitization
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  // Convert string booleans to actual booleans
  for (const key in req.query) {
    const value = req.query[key];
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        req.query[key] = 'true';
      } else if (value.toLowerCase() === 'false') {
        req.query[key] = 'false';
      }
    }
  }

  next();
};

// Rate limiting helpers
export const createRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip)!;
    // Remove requests outside the time window
    const validRequests = userRequests.filter((time) => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000),
      });
      return;
    }

    validRequests.push(now);
    requests.set(ip, validRequests);

    next();
  };
};
