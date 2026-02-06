import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { logger } from '@/utils/logger';

const breakerOptions: CircuitBreaker.Options = {
    timeout: 30000, // If our function takes longer than 30 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
    resetTimeout: 30000, // After 30 seconds, try again.
};

export const createResilientProxy = (name: string, proxyMiddleware: RequestHandler) => {
    // Use a dummy function because the actual proxying happens inside the middleware
    // We will manually record success/failure
    const breaker = new CircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
        const maxRetries = 2;
        let attempt = 0;

        const executeProxy = () => new Promise<void>((resolve, reject) => {
            const originalEnd = res.end;
            const originalStatus = res.status;
            let statusCode = 200;

            res.status = function (code: number) {
                statusCode = code;
                return originalStatus.apply(this, arguments as any);
            };

            res.end = function () {
                if (statusCode >= 500) {
                    reject(new Error(`Service returned ${statusCode}`));
                } else {
                    resolve();
                }
                return originalEnd.apply(this, arguments as any);
            };

            proxyMiddleware(req, res, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        while (attempt <= maxRetries) {
            try {
                await executeProxy();
                return;
            } catch (error) {
                attempt++;
                if (attempt > maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, attempt * 100));
                logger.info(`Retrying ${name} attempt ${attempt} current status: ${breaker.status}...`);
            }
        }
    }, { ...breakerOptions, name });

    breaker.on('open', () => logger.warn(`Circuit Breaker [${name}] is OPEN`));
    breaker.on('halfOpen', () => logger.info(`Circuit Breaker [${name}] is HALF_OPEN`));
    breaker.on('close', () => logger.info(`Circuit Breaker [${name}] is CLOSED`));
    breaker.on('fallback', () => logger.warn(`Circuit Breaker [${name}] is using FALLBACK`));

    return (req: Request, res: Response, next: NextFunction) => {
        breaker.fire(req, res, next).catch(err => {
            if (breaker.opened) {
                res.status(503).json({
                    success: false,
                    message: `Service [${name}] is temporarily unavailable (Circuit Open)`,
                    timestamp: new Date().toISOString(),
                });
            } else {
                // Error was caught and handled or it's a real failure
                // The error handler in proxy.ts usually handles this, but if we're here, we might need a backup
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Internal Gateway Error',
                        error: err.message,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        });
    };
};
