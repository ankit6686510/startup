import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface SecurityConfig {
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
    message?: string;
  };
  helmet?: any;
  csrf?: {
    enabled: boolean;
    secret?: string;
  };
  contentSecurityPolicy?: {
    enabled: boolean;
    directives?: any;
  };
}

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Configure CORS middleware
   */
  cors() {
    const corsOptions = {
      origin: this.config.cors?.origin || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: this.config.cors?.credentials || true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400, // 24 hours
    };

    return cors(corsOptions);
  }

  /**
   * Configure rate limiting
   */
  rateLimit() {
    return rateLimit({
      windowMs: this.config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes
      max: this.config.rateLimit?.max || 100, // limit each IP to 100 requests per windowMs
      message: this.config.rateLimit?.message || {
        success: false,
        error: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.round(req.rateLimit.resetTime / 1000),
        });
      },
    });
  }

  /**
   * Configure strict rate limiting for authentication endpoints
   */
  authRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      },
      skipSuccessfulRequests: true,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: 'Too many authentication attempts',
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          retryAfter: Math.round(req.rateLimit.resetTime / 1000),
        });
      },
    });
  }

  /**
   * Configure Helmet for security headers
   */
  helmet() {
    return helmet({
      contentSecurityPolicy: this.config.contentSecurityPolicy?.enabled
        ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
              connectSrc: ["'self'"],
              frameSrc: ["'none'"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              ...this.config.contentSecurityPolicy?.directives,
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });
  }

  /**
   * CSRF protection middleware
   */
  csrfProtection() {
    if (!this.config.csrf?.enabled) {
      return (req: any, res: any, next: any) => next();
    }

    return (req: any, res: any, next: any) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Skip CSRF for API key authentication
      if (req.headers['x-api-key']) {
        return next();
      }

      const token = req.headers['x-csrf-token'] || req.body._csrf;
      const sessionToken = req.session?.csrfToken;

      if (!token || !sessionToken || token !== sessionToken) {
        return res.status(403).json({
          success: false,
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID',
        });
      }

      next();
    };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(req: any): string {
    const token = crypto.randomBytes(32).toString('hex');
    req.session.csrfToken = token;
    return token;
  }

  /**
   * Input sanitization middleware
   */
  sanitizeInput() {
    return (req: any, res: any, next: any) => {
      // Sanitize common XSS patterns
      const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
          return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        }

        if (Array.isArray(obj)) {
          return obj.map(sanitize);
        }

        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitize(value);
          }
          return sanitized;
        }

        return obj;
      };

      req.body = sanitize(req.body);
      req.query = sanitize(req.query);
      req.params = sanitize(req.params);

      next();
    };
  }

  /**
   * Request size limiting
   */
  requestSizeLimit() {
    return (req: any, res: any, next: any) => {
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
        return res.status(413).json({
          success: false,
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
        });
      }

      next();
    };
  }

  /**
   * IP whitelist/blacklist middleware
   */
  ipFilter(whitelist: string[] = [], blacklist: string[] = []) {
    return (req: any, res: any, next: any) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      // Check blacklist first
      if (blacklist.length > 0 && blacklist.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          code: 'IP_BLOCKED',
        });
      }

      // Check whitelist if configured
      if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          code: 'IP_NOT_WHITELISTED',
        });
      }

      next();
    };
  }

  /**
   * API key authentication middleware
   */
  apiKeyAuth(validApiKeys: string[] = []) {
    return (req: any, res: any, next: any) => {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required',
          code: 'API_KEY_REQUIRED',
        });
      }

      if (!validApiKeys.includes(apiKey)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
        });
      }

      req.apiKey = apiKey;
      next();
    };
  }

  /**
   * JWT token validation middleware
   */
  jwtAuth(secret: string, options: any = {}) {
    return (req: any, res: any, next: any) => {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token required',
          code: 'TOKEN_REQUIRED',
        });
      }

      try {
        const decoded = jwt.verify(token, secret, options);
        req.user = decoded;
        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).json({
            success: false,
            error: 'Token expired',
            code: 'TOKEN_EXPIRED',
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      }
    };
  }

  /**
   * Request logging middleware
   */
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?.id,
          timestamp: new Date().toISOString(),
        };

        // Log suspicious activity
        if (res.statusCode >= 400) {
          console.warn('Suspicious request:', logData);
        }
      });

      next();
    };
  }

  /**
   * Content type validation
   */
  validateContentType(allowedTypes: string[] = ['application/json']) {
    return (req: any, res: any, next: any) => {
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');

        if (!contentType || !allowedTypes.some((type) => contentType.includes(type))) {
          return res.status(415).json({
            success: false,
            error: 'Unsupported content type',
            code: 'UNSUPPORTED_CONTENT_TYPE',
            allowedTypes,
          });
        }
      }

      next();
    };
  }

  /**
   * Request ID middleware for tracing
   */
  requestId() {
    return (req: any, res: any, next: any) => {
      req.id = req.get('X-Request-ID') || crypto.randomUUID();
      res.set('X-Request-ID', req.id);
      next();
    };
  }
}

// Validation schemas
export const validationSchemas = {
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),

  name: body(['firstName', 'lastName'])
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),

  uuid: body('id').isUUID().withMessage('Valid UUID is required'),

  url: body('website').optional().isURL().withMessage('Valid URL is required'),

  phone: body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
};

// Validation error handler
export const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: any, res: any, next: any) => {
  // Remove server information
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  });

  next();
};

// Brute force protection
export class BruteForceProtection {
  private attempts: Map<string, { count: number; resetTime: number; blocked: boolean }> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private blockDurationMs: number;

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000,
    blockDurationMs: number = 60 * 60 * 1000,
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  middleware() {
    return (req: any, res: any, next: any) => {
      const identifier = req.ip + ':' + (req.user?.id || 'anonymous');
      const now = Date.now();
      const attempts = this.attempts.get(identifier);

      // Clean up expired entries
      if (attempts && now > attempts.resetTime) {
        this.attempts.delete(identifier);
      }

      // Check if currently blocked
      const currentAttempts = this.attempts.get(identifier);
      if (currentAttempts?.blocked && now < currentAttempts.resetTime) {
        return res.status(429).json({
          success: false,
          error: 'Account temporarily blocked due to too many failed attempts',
          code: 'ACCOUNT_BLOCKED',
          retryAfter: Math.round((currentAttempts.resetTime - now) / 1000),
        });
      }

      // Add attempt tracking to request
      req.bruteForce = {
        recordFailure: () => this.recordFailure(identifier),
        recordSuccess: () => this.recordSuccess(identifier),
      };

      next();
    };
  }

  private recordFailure(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier);

    if (!attempts || now > attempts.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
        blocked: false,
      });
    } else {
      attempts.count++;

      if (attempts.count >= this.maxAttempts) {
        attempts.blocked = true;
        attempts.resetTime = now + this.blockDurationMs;
      }
    }
  }

  private recordSuccess(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export default SecurityMiddleware;
