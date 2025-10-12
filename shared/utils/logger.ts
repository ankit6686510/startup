import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure log directory exists
const logDir = process.env.LOG_DIR || '/var/log/startup-compass';
const serviceName = process.env.SERVICE_NAME || 'unknown-service';
const serviceLogDir = path.join(logDir, serviceName);

if (!fs.existsSync(serviceLogDir)) {
  fs.mkdirSync(serviceLogDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service: service || serviceName,
      message,
      ...meta
    });
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: serviceName,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: process.env.NODE_ENV === 'test'
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(serviceLogDir, 'app.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Separate file for errors
    new winston.transports.File({
      filename: path.join(serviceLogDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Audit log for security events
    new winston.transports.File({
      filename: path.join(serviceLogDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Only log audit events
          if (meta.type === 'audit') {
            return JSON.stringify({
              timestamp,
              level,
              service: serviceName,
              message,
              ...meta
            });
          }
          return false;
        })
      )
    }),

    // Performance log
    new winston.transports.File({
      filename: path.join(serviceLogDir, 'performance.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Only log performance events
          if (meta.type === 'performance') {
            return JSON.stringify({
              timestamp,
              level,
              service: serviceName,
              message,
              ...meta
            });
          }
          return false;
        })
      )
    })
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(serviceLogDir, 'exceptions.log')
    })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(serviceLogDir, 'rejections.log')
    })
  ]
});

// Enhanced logging methods
export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  constructor() {
    this.logger = logger;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Standard logging methods
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // HTTP request logging
  logRequest(req: any, res: any, responseTime: number): void {
    const logData = {
      type: 'http',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      requestId: req.id,
      contentLength: res.get('Content-Length')
    };

    if (res.statusCode >= 400) {
      this.logger.warn('HTTP request completed with error', logData);
    } else {
      this.logger.info('HTTP request completed', logData);
    }
  }

  // Database operation logging
  logDatabase(operation: string, table: string, duration: number, meta?: any): void {
    this.logger.info('Database operation', {
      type: 'database',
      operation,
      table,
      duration,
      ...meta
    });
  }

  // Authentication logging
  logAuth(action: string, userId?: string, success: boolean = true, meta?: any): void {
    this.logger.info('Authentication event', {
      type: 'audit',
      category: 'authentication',
      action,
      userId,
      success,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Business event logging
  logBusinessEvent(event: string, data: any): void {
    this.logger.info('Business event', {
      type: 'business',
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, meta?: any): void {
    this.logger.info('Performance metric', {
      type: 'performance',
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Security event logging
  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any): void {
    this.logger.warn('Security event', {
      type: 'audit',
      category: 'security',
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Error with context
  logError(error: Error, context?: any): void {
    this.logger.error('Application error', {
      type: 'error',
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Structured logging for specific events
  logUserRegistration(userId: string, email: string, source: string): void {
    this.logBusinessEvent('user_registration', {
      userId,
      email,
      source
    });
    
    this.logAuth('register', userId, true, {
      email,
      source
    });
  }

  logJobApplication(jobId: string, userId: string, applicationId: string): void {
    this.logBusinessEvent('job_application', {
      jobId,
      userId,
      applicationId
    });
  }

  logFundingAnnouncement(startupId: string, amount: number, round: string): void {
    this.logBusinessEvent('funding_announcement', {
      startupId,
      amount,
      round
    });
  }

  logNotificationSent(notificationId: string, userId: string, channel: string, success: boolean): void {
    this.logBusinessEvent('notification_sent', {
      notificationId,
      userId,
      channel,
      success
    });
  }

  // Rate limiting events
  logRateLimit(ip: string, endpoint: string, limit: number): void {
    this.logSecurity('rate_limit_exceeded', 'medium', {
      ip,
      endpoint,
      limit
    });
  }

  // API key usage
  logApiKeyUsage(apiKey: string, endpoint: string, success: boolean): void {
    this.logAuth('api_key_usage', undefined, success, {
      apiKey: apiKey.substring(0, 8) + '...',
      endpoint
    });
  }

  // Data export events
  logDataExport(userId: string, dataType: string, recordCount: number): void {
    this.logSecurity('data_export', 'low', {
      userId,
      dataType,
      recordCount
    });
  }

  // System health
  logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: any): void {
    this.logger.info('Health check', {
      type: 'health',
      service,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Cache operations
  logCache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, ttl?: number): void {
    this.logger.debug('Cache operation', {
      type: 'cache',
      operation,
      key,
      ttl
    });
  }

  // External API calls
  logExternalApi(service: string, endpoint: string, method: string, statusCode: number, duration: number): void {
    this.logger.info('External API call', {
      type: 'external_api',
      service,
      endpoint,
      method,
      statusCode,
      duration
    });
  }
}

// Create and export singleton instance
export const appLogger = Logger.getInstance();

// Export the winston logger for direct access if needed
export { logger };

// Express middleware for request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Generate request ID
  req.id = req.get('X-Request-ID') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log request start
  appLogger.debug('HTTP request started', {
    type: 'http',
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    requestId: req.id
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const responseTime = Date.now() - startTime;
    appLogger.logRequest(req, res, responseTime);
    originalEnd.call(res, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: any, res: any, next: any) => {
  appLogger.logError(error, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    requestId: req.id
  });
  
  next(error);
};

export default appLogger;