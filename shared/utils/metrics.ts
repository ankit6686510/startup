import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics({
  prefix: 'startup_compass_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// HTTP Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Database Metrics
export const databaseConnectionsActive = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  labelNames: ['database', 'service'],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'service'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const databaseQueriesTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status', 'service'],
});

// Cache Metrics
export const cacheOperationsTotal = new Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'status', 'service'],
});

export const cacheHitRatio = new Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio',
  labelNames: ['service'],
});

// Business Metrics
export const userRegistrationsTotal = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['status', 'source', 'service'],
});

export const userLoginsTotal = new Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['status', 'method', 'service'],
});

export const activeUsersGauge = new Gauge({
  name: 'active_users_current',
  help: 'Current number of active users',
  labelNames: ['type', 'service'],
});

export const jobApplicationsTotal = new Counter({
  name: 'job_applications_total',
  help: 'Total number of job applications',
  labelNames: ['status', 'service'],
});

export const jobsPostedTotal = new Counter({
  name: 'jobs_posted_total',
  help: 'Total number of jobs posted',
  labelNames: ['industry', 'type', 'service'],
});

export const fundingAnnouncementsTotal = new Counter({
  name: 'funding_announcements_total',
  help: 'Total number of funding announcements',
  labelNames: ['round', 'currency', 'service'],
});

export const fundingAmountTotal = new Counter({
  name: 'funding_amount_total',
  help: 'Total funding amount announced',
  labelNames: ['round', 'currency', 'service'],
});

export const notificationsTotal = new Counter({
  name: 'notifications_total',
  help: 'Total number of notifications sent',
  labelNames: ['channel', 'status', 'service'],
});

// Error Metrics
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'service'],
});

export const userRegistrationFailures = new Counter({
  name: 'user_registration_failures_total',
  help: 'Total number of user registration failures',
  labelNames: ['reason', 'service'],
});

export const jobApplicationProcessingDuration = new Histogram({
  name: 'job_application_processing_duration_seconds',
  help: 'Duration of job application processing in seconds',
  labelNames: ['status', 'service'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
});

export const fundingDataSyncFailures = new Counter({
  name: 'funding_data_sync_failures_total',
  help: 'Total number of funding data sync failures',
  labelNames: ['source', 'reason', 'service'],
});

export const notificationDeliveryFailures = new Counter({
  name: 'notification_delivery_failures_total',
  help: 'Total number of notification delivery failures',
  labelNames: ['channel', 'reason', 'service'],
});

// Rate Limiting Metrics
export const rateLimitExceeded = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total number of rate limit exceeded events',
  labelNames: ['endpoint', 'ip', 'service'],
});

// External API Metrics
export const externalApiCallsTotal = new Counter({
  name: 'external_api_calls_total',
  help: 'Total number of external API calls',
  labelNames: ['service_name', 'endpoint', 'status', 'service'],
});

export const externalApiDuration = new Histogram({
  name: 'external_api_duration_seconds',
  help: 'Duration of external API calls in seconds',
  labelNames: ['service_name', 'endpoint', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

// Queue Metrics
export const queueJobsTotal = new Counter({
  name: 'queue_jobs_total',
  help: 'Total number of queue jobs',
  labelNames: ['queue', 'status', 'service'],
});

export const queueJobDuration = new Histogram({
  name: 'queue_job_duration_seconds',
  help: 'Duration of queue job processing in seconds',
  labelNames: ['queue', 'job_type', 'service'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
});

export const queueSize = new Gauge({
  name: 'queue_size_current',
  help: 'Current size of the queue',
  labelNames: ['queue', 'service'],
});

// WebSocket Metrics
export const websocketConnectionsActive = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  labelNames: ['service'],
});

export const websocketMessagesTotal = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['type', 'direction', 'service'],
});

// File Upload Metrics
export const fileUploadsTotal = new Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['type', 'status', 'service'],
});

export const fileUploadSize = new Histogram({
  name: 'file_upload_size_bytes',
  help: 'Size of uploaded files in bytes',
  labelNames: ['type', 'service'],
  buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600],
});

// Security Metrics
export const authenticationAttemptsTotal = new Counter({
  name: 'authentication_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'status', 'service'],
});

export const suspiciousActivitiesTotal = new Counter({
  name: 'suspicious_activities_total',
  help: 'Total number of suspicious activities detected',
  labelNames: ['type', 'severity', 'service'],
});

// Metrics Helper Class
export class MetricsCollector {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // HTTP request metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      service: this.serviceName,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration / 1000);
  }

  // Database metrics
  recordDatabaseQuery(operation: string, table: string, duration: number, success: boolean): void {
    const labels = {
      operation,
      table,
      status: success ? 'success' : 'error',
      service: this.serviceName,
    };

    databaseQueriesTotal.inc(labels);
    databaseQueryDuration.observe({ operation, table, service: this.serviceName }, duration / 1000);
  }

  setDatabaseConnections(count: number, database: string = 'default'): void {
    databaseConnectionsActive.set({ database, service: this.serviceName }, count);
  }

  // Cache metrics
  recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', success: boolean = true): void {
    cacheOperationsTotal.inc({
      operation,
      status: success ? 'success' : 'error',
      service: this.serviceName,
    });
  }

  setCacheHitRatio(ratio: number): void {
    cacheHitRatio.set({ service: this.serviceName }, ratio);
  }

  // Business metrics
  recordUserRegistration(success: boolean, source: string = 'web'): void {
    userRegistrationsTotal.inc({
      status: success ? 'success' : 'failure',
      source,
      service: this.serviceName,
    });

    if (!success) {
      userRegistrationFailures.inc({ reason: 'unknown', service: this.serviceName });
    }
  }

  recordUserLogin(success: boolean, method: string = 'password'): void {
    userLoginsTotal.inc({
      status: success ? 'success' : 'failure',
      method,
      service: this.serviceName,
    });
  }

  setActiveUsers(count: number, type: string = 'total'): void {
    activeUsersGauge.set({ type, service: this.serviceName }, count);
  }

  recordJobApplication(success: boolean): void {
    jobApplicationsTotal.inc({
      status: success ? 'success' : 'failure',
      service: this.serviceName,
    });
  }

  recordJobPosted(industry: string, type: string): void {
    jobsPostedTotal.inc({
      industry,
      type,
      service: this.serviceName,
    });
  }

  recordFundingAnnouncement(round: string, amount: number, currency: string = 'USD'): void {
    fundingAnnouncementsTotal.inc({
      round,
      currency,
      service: this.serviceName,
    });

    fundingAmountTotal.inc({
      round,
      currency,
      service: this.serviceName,
    }, amount);
  }

  recordNotification(channel: string, success: boolean): void {
    notificationsTotal.inc({
      channel,
      status: success ? 'success' : 'failure',
      service: this.serviceName,
    });

    if (!success) {
      notificationDeliveryFailures.inc({
        channel,
        reason: 'unknown',
        service: this.serviceName,
      });
    }
  }

  // Error metrics
  recordError(type: string): void {
    errorsTotal.inc({ type, service: this.serviceName });
  }

  // Rate limiting
  recordRateLimitExceeded(endpoint: string, ip: string): void {
    rateLimitExceeded.inc({
      endpoint,
      ip,
      service: this.serviceName,
    });
  }

  // External API calls
  recordExternalApiCall(serviceName: string, endpoint: string, statusCode: number, duration: number): void {
    const labels = {
      service_name: serviceName,
      endpoint,
      status: statusCode.toString(),
      service: this.serviceName,
    };

    externalApiCallsTotal.inc(labels);
    externalApiDuration.observe({
      service_name: serviceName,
      endpoint,
      service: this.serviceName,
    }, duration / 1000);
  }

  // Queue metrics
  recordQueueJob(queue: string, jobType: string, duration: number, success: boolean): void {
    queueJobsTotal.inc({
      queue,
      status: success ? 'success' : 'failure',
      service: this.serviceName,
    });

    queueJobDuration.observe({
      queue,
      job_type: jobType,
      service: this.serviceName,
    }, duration / 1000);
  }

  setQueueSize(queue: string, size: number): void {
    queueSize.set({ queue, service: this.serviceName }, size);
  }

  // WebSocket metrics
  setWebSocketConnections(count: number): void {
    websocketConnectionsActive.set({ service: this.serviceName }, count);
  }

  recordWebSocketMessage(type: string, direction: 'inbound' | 'outbound'): void {
    websocketMessagesTotal.inc({
      type,
      direction,
      service: this.serviceName,
    });
  }

  // File upload metrics
  recordFileUpload(type: string, size: number, success: boolean): void {
    fileUploadsTotal.inc({
      type,
      status: success ? 'success' : 'failure',
      service: this.serviceName,
    });

    if (success) {
      fileUploadSize.observe({ type, service: this.serviceName }, size);
    }
  }

  // Security metrics
  recordAuthenticationAttempt(method: string, success: boolean): void {
    authenticationAttemptsTotal.inc({
      method,
      status: success ? 'success' : 'failure',
      service: this.serviceName,
    });
  }

  recordSuspiciousActivity(type: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    suspiciousActivitiesTotal.inc({
      type,
      severity,
      service: this.serviceName,
    });
  }
}

// Export the Prometheus register for metrics endpoint
export { register };

// Create service-specific metrics collector
export const createMetricsCollector = (serviceName: string): MetricsCollector => {
  return new MetricsCollector(serviceName);
};

// Middleware for automatic HTTP metrics collection
export const metricsMiddleware = (serviceName: string) => {
  const collector = new MetricsCollector(serviceName);

  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Override res.end to capture metrics
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding: any) {
      const duration = Date.now() - startTime;
      const route = req.route?.path || req.path || 'unknown';
      
      collector.recordHttpRequest(req.method, route, res.statusCode, duration);
      originalEnd.call(res, chunk, encoding);
    };

    next();
  };
};

export default MetricsCollector;