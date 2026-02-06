import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { createResilientProxy } from '@/utils/resiliency';

export const createServiceProxy = (
  target: string,
  pathRewrite?: Record<string, string>,
): Options => {
  return {
    target,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${req.url}:`, err);
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${target}`);

      // Forward user information if available
      if ((req as any).user) {
        proxyReq.setHeader('X-User-Id', (req as any).user.id);
        proxyReq.setHeader('X-User-Role', (req as any).user.role);
        proxyReq.setHeader('X-User-Email', (req as any).user.email);
      }

      // Add request ID for tracing
      if ((req as any).requestId) {
        proxyReq.setHeader('X-Request-Id', (req as any).requestId);
      }

      // Restream parsed body
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] =
        'Content-Type, Authorization, Content-Length, X-Requested-With';

      logger.info(`Received response ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    timeout: 30000, // 30 seconds
    proxyTimeout: 30000,
  };
};

// Service-specific proxy configurations with Circuit Breakers
export const startupServiceProxy = createResilientProxy(
  'startup-service',
  createProxyMiddleware(
    createServiceProxy(config.services.startup, {
      '^/api/v1/startups': '/api/v1/startups',
      '^/api/v1/founders': '/api/v1/founders',
    }),
  ),
);

export const userServiceProxy = createResilientProxy(
  'user-service',
  createProxyMiddleware(
    createServiceProxy(config.services.user, {
      '^/api/v1/users': '/api/v1/users',
      '^/api/v1/auth': '/api/v1/auth',
    }),
  ),
);

export const jobServiceProxy = createResilientProxy(
  'job-service',
  createProxyMiddleware(
    createServiceProxy(config.services.job, {
      '^/api/v1/jobs': '/api/v1/jobs',
      '^/api/v1/applications': '/api/v1/applications',
    }),
  ),
);

export const fundingServiceProxy = createResilientProxy(
  'funding-service',
  createProxyMiddleware(
    createServiceProxy(config.services.funding, {
      '^/api/v1/funding': '/api/v1/funding',
      '^/api/v1/investors': '/api/v1/investors',
    }),
  ),
);

export const notificationServiceProxy = createResilientProxy(
  'notification-service',
  createProxyMiddleware(
    createServiceProxy(config.services.notification, {
      '^/api/v1/notifications': '/api/v1/notifications',
    }),
  ),
);

export const newsAggregatorProxy = createResilientProxy(
  'news-aggregator',
  createProxyMiddleware(
    createServiceProxy(config.services.newsAggregator, {
      '^/api/v1/news': '/api/news',
    }),
  ),
);
