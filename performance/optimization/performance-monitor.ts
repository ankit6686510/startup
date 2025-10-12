import { performance, PerformanceObserver } from 'perf_hooks';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface PerformanceThreshold {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  action: 'warn' | 'alert' | 'scale';
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: PerformanceThreshold[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring: boolean = false;
  private logFile: string;
  private metricsBuffer: PerformanceMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(logDir: string = './performance/logs') {
    super();
    
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.logFile = path.join(logDir, `performance-${Date.now()}.log`);
    this.setupObservers();
  }

  private setupObservers(): void {
    // HTTP request timing observer
    const httpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'http_request_duration',
          value: entry.duration,
          timestamp: Date.now(),
          type: 'timing',
          tags: {
            name: entry.name,
            type: 'http'
          }
        });
      }
    });
    
    // Database query timing observer
    const dbObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'database_query_duration',
          value: entry.duration,
          timestamp: Date.now(),
          type: 'timing',
          tags: {
            name: entry.name,
            type: 'database'
          }
        });
      }
    });

    // Function timing observer
    const functionObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'function_execution_duration',
          value: entry.duration,
          timestamp: Date.now(),
          type: 'timing',
          tags: {
            name: entry.name,
            type: 'function'
          }
        });
      }
    });

    this.observers = [httpObserver, dbObserver, functionObserver];
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    
    // Start performance observers
    this.observers.forEach(observer => {
      try {
        observer.observe({ entryTypes: ['measure', 'mark'] });
      } catch (error) {
        console.warn('Failed to start performance observer:', error);
      }
    });

    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Start CPU monitoring
    this.startCPUMonitoring();
    
    // Start event loop monitoring
    this.startEventLoopMonitoring();
    
    // Start metrics flushing
    this.startMetricsFlushing();

    console.log('Performance monitoring started');
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    // Stop observers
    this.observers.forEach(observer => observer.disconnect());
    
    // Stop flushing
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Flush remaining metrics
    this.flushMetrics();

    console.log('Performance monitoring stopped');
  }

  private startMemoryMonitoring(): void {
    const memoryInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(memoryInterval);
        return;
      }

      const memUsage = process.memoryUsage();
      const timestamp = Date.now();

      this.recordMetric({
        name: 'memory_heap_used',
        value: memUsage.heapUsed,
        timestamp,
        type: 'gauge'
      });

      this.recordMetric({
        name: 'memory_heap_total',
        value: memUsage.heapTotal,
        timestamp,
        type: 'gauge'
      });

      this.recordMetric({
        name: 'memory_external',
        value: memUsage.external,
        timestamp,
        type: 'gauge'
      });

      this.recordMetric({
        name: 'memory_rss',
        value: memUsage.rss,
        timestamp,
        type: 'gauge'
      });

      // Check memory thresholds
      this.checkThresholds('memory_heap_used', memUsage.heapUsed);
      this.checkThresholds('memory_rss', memUsage.rss);

    }, 5000); // Every 5 seconds
  }

  private startCPUMonitoring(): void {
    let lastCpuUsage = process.cpuUsage();
    
    const cpuInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(cpuInterval);
        return;
      }

      const currentCpuUsage = process.cpuUsage(lastCpuUsage);
      const timestamp = Date.now();

      // Convert to percentages
      const userCpuPercent = (currentCpuUsage.user / 1000000) * 100; // Convert microseconds to seconds, then to percentage
      const systemCpuPercent = (currentCpuUsage.system / 1000000) * 100;

      this.recordMetric({
        name: 'cpu_user_percent',
        value: userCpuPercent,
        timestamp,
        type: 'gauge'
      });

      this.recordMetric({
        name: 'cpu_system_percent',
        value: systemCpuPercent,
        timestamp,
        type: 'gauge'
      });

      lastCpuUsage = process.cpuUsage();

      // Check CPU thresholds
      this.checkThresholds('cpu_user_percent', userCpuPercent);
      this.checkThresholds('cpu_system_percent', systemCpuPercent);

    }, 5000); // Every 5 seconds
  }

  private startEventLoopMonitoring(): void {
    const eventLoopInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(eventLoopInterval);
        return;
      }

      const start = performance.now();
      setImmediate(() => {
        const lag = performance.now() - start;
        
        this.recordMetric({
          name: 'event_loop_lag',
          value: lag,
          timestamp: Date.now(),
          type: 'gauge'
        });

        // Check event loop lag thresholds
        this.checkThresholds('event_loop_lag', lag);
      });

    }, 1000); // Every second
  }

  private startMetricsFlushing(): void {
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 10000); // Flush every 10 seconds
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Write to log file
    const logData = metricsToFlush.map(metric => JSON.stringify(metric)).join('\n') + '\n';
    fs.appendFileSync(this.logFile, logData);

    // Emit metrics event for external consumers
    this.emit('metrics', metricsToFlush);
  }

  public recordMetric(metric: PerformanceMetric): void {
    // Store in memory for quick access
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    
    const metricHistory = this.metrics.get(metric.name)!;
    metricHistory.push(metric);
    
    // Keep only last 1000 entries per metric
    if (metricHistory.length > 1000) {
      metricHistory.shift();
    }

    // Add to buffer for flushing
    this.metricsBuffer.push(metric);

    // Check thresholds
    this.checkThresholds(metric.name, metric.value);
  }

  public addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.push(threshold);
  }

  private checkThresholds(metricName: string, value: number): void {
    const relevantThresholds = this.thresholds.filter(t => t.metric === metricName);
    
    for (const threshold of relevantThresholds) {
      let violated = false;
      
      switch (threshold.operator) {
        case 'gt':
          violated = value > threshold.threshold;
          break;
        case 'lt':
          violated = value < threshold.threshold;
          break;
        case 'gte':
          violated = value >= threshold.threshold;
          break;
        case 'lte':
          violated = value <= threshold.threshold;
          break;
        case 'eq':
          violated = value === threshold.threshold;
          break;
      }

      if (violated) {
        this.emit('threshold_violated', {
          metric: metricName,
          value,
          threshold,
          timestamp: Date.now()
        });

        if (threshold.action === 'alert') {
          this.emit('alert', {
            message: `Performance threshold violated: ${metricName} ${threshold.operator} ${threshold.threshold} (actual: ${value})`,
            severity: 'high',
            metric: metricName,
            value,
            threshold
          });
        } else if (threshold.action === 'warn') {
          this.emit('warning', {
            message: `Performance threshold warning: ${metricName} ${threshold.operator} ${threshold.threshold} (actual: ${value})`,
            severity: 'medium',
            metric: metricName,
            value,
            threshold
          });
        }
      }
    }
  }

  public getMetrics(metricName?: string): PerformanceMetric[] {
    if (metricName) {
      return this.metrics.get(metricName) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    
    return allMetrics.sort((a, b) => a.timestamp - b.timestamp);
  }

  public getMetricSummary(metricName: string, timeWindow?: number): any {
    const metrics = this.getMetrics(metricName);
    
    if (metrics.length === 0) {
      return null;
    }

    const now = Date.now();
    const filteredMetrics = timeWindow 
      ? metrics.filter(m => now - m.timestamp <= timeWindow)
      : metrics;

    if (filteredMetrics.length === 0) {
      return null;
    }

    const values = filteredMetrics.map(m => m.value);
    values.sort((a, b) => a - b);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
      latest: filteredMetrics[filteredMetrics.length - 1].value,
      timeWindow: timeWindow || 'all'
    };
  }

  // Timing utilities
  public startTiming(name: string): void {
    performance.mark(`${name}-start`);
  }

  public endTiming(name: string, tags?: Record<string, string>): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration || 0;
    
    this.recordMetric({
      name: `timing_${name}`,
      value: duration,
      timestamp: Date.now(),
      type: 'timing',
      tags
    });

    // Clean up marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return duration;
  }

  // Async timing wrapper
  public async timeAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    this.startTiming(name);
    try {
      const result = await fn();
      this.endTiming(name, tags);
      return result;
    } catch (error) {
      this.endTiming(name, { ...tags, error: 'true' });
      throw error;
    }
  }

  // Sync timing wrapper
  public timeSync<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    this.startTiming(name);
    try {
      const result = fn();
      this.endTiming(name, tags);
      return result;
    } catch (error) {
      this.endTiming(name, { ...tags, error: 'true' });
      throw error;
    }
  }

  // Counter utilities
  public incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `counter_${name}`,
      value,
      timestamp: Date.now(),
      type: 'counter',
      tags
    });
  }

  // Gauge utilities
  public setGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `gauge_${name}`,
      value,
      timestamp: Date.now(),
      type: 'gauge',
      tags
    });
  }

  // Express middleware
  public expressMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = performance.now();
      const route = req.route?.path || req.path || 'unknown';
      
      // Override res.end to capture timing
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        const duration = performance.now() - startTime;
        
        this.recordMetric({
          name: 'http_request_duration',
          value: duration,
          timestamp: Date.now(),
          type: 'timing',
          tags: {
            method: req.method,
            route,
            status_code: res.statusCode.toString(),
            user_agent: req.get('User-Agent') || 'unknown'
          }
        });

        this.incrementCounter('http_requests_total', 1, {
          method: req.method,
          route,
          status_code: res.statusCode.toString()
        });

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  // Database query timing
  public wrapDatabaseQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    return this.timeAsync(`db_query_${queryName}`, queryFn, {
      type: 'database',
      query: queryName
    });
  }

  // Generate performance report
  public generateReport(timeWindow?: number): any {
    const report = {
      timestamp: new Date().toISOString(),
      timeWindow: timeWindow || 'all',
      summary: {} as any,
      alerts: [] as any[],
      recommendations: [] as string[]
    };

    // Get summaries for key metrics
    const keyMetrics = [
      'http_request_duration',
      'memory_heap_used',
      'memory_rss',
      'cpu_user_percent',
      'event_loop_lag'
    ];

    for (const metric of keyMetrics) {
      const summary = this.getMetricSummary(metric, timeWindow);
      if (summary) {
        report.summary[metric] = summary;
      }
    }

    // Generate recommendations
    if (report.summary.memory_heap_used?.p95 > 500 * 1024 * 1024) { // 500MB
      report.recommendations.push('High memory usage detected. Consider optimizing memory allocation or increasing heap size.');
    }

    if (report.summary.http_request_duration?.p95 > 2000) { // 2 seconds
      report.recommendations.push('High response times detected. Consider optimizing database queries or adding caching.');
    }

    if (report.summary.event_loop_lag?.p95 > 100) { // 100ms
      report.recommendations.push('High event loop lag detected. Consider optimizing synchronous operations.');
    }

    if (report.summary.cpu_user_percent?.mean > 80) { // 80%
      report.recommendations.push('High CPU usage detected. Consider optimizing CPU-intensive operations or scaling horizontally.');
    }

    return report;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Express middleware export
export const performanceMiddleware = performanceMonitor.expressMiddleware();

// Utility decorators
export function timed(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timingName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.timeSync(timingName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

export function timedAsync(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timingName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.timeAsync(timingName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

export default PerformanceMonitor;