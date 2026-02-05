import Bull from 'bull';
import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

export class NotificationQueue {
  private queue: Bull.Queue;
  private redisClient: RedisClientType;

  constructor() {
    // Create Redis connection
    this.redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Create Bull queue
    this.queue = new Bull('notification-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
      },
    });

    this.setupEventHandlers();
  }

  async add(jobName: string, data: any, options?: Bull.JobOptions): Promise<Bull.Job> {
    try {
      const job = await this.queue.add(jobName, data, {
        attempts: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000'),
        },
        ...options,
      });

      logger.info(`Job added to queue: ${jobName}`, {
        jobId: job.id,
        data: data,
      });

      return job;
    } catch (error) {
      logger.error(`Failed to add job to queue: ${jobName}`, error);
      throw error;
    }
  }

  async process(
    jobName: string,
    concurrency: number,
    processor: Bull.ProcessCallbackFunction<any>,
  ): Promise<void> {
    this.queue.process(jobName, concurrency, processor);
    logger.info(`Queue processor registered for: ${jobName} with concurrency: ${concurrency}`);
  }

  async getJob(jobId: string): Promise<Bull.Job | null> {
    return await this.queue.getJob(jobId);
  }

  async getJobs(types: Bull.JobStatus[], start?: number, end?: number): Promise<Bull.Job[]> {
    return await this.queue.getJobs(types, start, end);
  }

  async getJobCounts(): Promise<Bull.JobCounts> {
    return await this.queue.getJobCounts();
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info(`Job removed from queue: ${jobId}`);
    }
  }

  async retryJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.retry();
      logger.info(`Job retried: ${jobId}`);
    }
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    logger.info('Queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Queue resumed');
  }

  async cleanQueue(grace: number, status: Bull.JobStatus): Promise<Bull.Job[]> {
    const jobs = await this.queue.clean(grace, status as any);
    logger.info(`Cleaned ${jobs.length} ${status} jobs older than ${grace}ms`);
    return jobs;
  }

  async getQueueHealth(): Promise<{
    isHealthy: boolean;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    try {
      const counts = await this.getJobCounts();
      const isHealthy = counts.failed < 100 && counts.active < 1000; // Arbitrary thresholds

      return {
        isHealthy,
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
        paused: (counts as any).paused || 0,
      };
    } catch (error) {
      logger.error('Failed to get queue health:', error);
      return {
        isHealthy: false,
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: 0,
      };
    }
  }

  private setupEventHandlers(): void {
    this.queue.on('completed', (job: Bull.Job, result: any) => {
      logger.info(`Job completed: ${job.id}`, {
        jobName: job.name,
        processingTime: job.processedOn ? Date.now() - job.processedOn : undefined,
        result,
      });
    });

    this.queue.on('failed', (job: Bull.Job, error: Error) => {
      logger.error(`Job failed: ${job.id}`, {
        jobName: job.name,
        error: error.message,
        stack: error.stack,
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts.attempts,
      });
    });

    this.queue.on('stalled', (job: Bull.Job) => {
      logger.warn(`Job stalled: ${job.id}`, {
        jobName: job.name,
        attemptsMade: job.attemptsMade,
      });
    });

    this.queue.on('progress', (job: Bull.Job, progress: number) => {
      logger.debug(`Job progress: ${job.id}`, {
        jobName: job.name,
        progress: `${progress}%`,
      });
    });

    this.queue.on('waiting', (jobId: string) => {
      logger.debug(`Job waiting: ${jobId}`);
    });

    this.queue.on('active', (job: Bull.Job) => {
      logger.debug(`Job active: ${job.id}`, {
        jobName: job.name,
      });
    });

    this.queue.on('removed', (job: Bull.Job) => {
      logger.debug(`Job removed: ${job.id}`, {
        jobName: job.name,
      });
    });

    this.queue.on('error', (error: Error) => {
      logger.error('Queue error:', error);
    });

    logger.info('Queue event handlers setup complete');
  }

  async close(): Promise<void> {
    await this.queue.close();
    await this.redisClient.quit();
    logger.info('Queue and Redis connections closed');
  }

  // Utility methods for monitoring
  async getQueueStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    waitingJobs: number;
    completedJobs: number;
    failedJobs: number;
    delayedJobs: number;
  }> {
    const counts = await this.getJobCounts();

    return {
      totalJobs: Object.values(counts).reduce((sum, count) => sum + count, 0),
      activeJobs: counts.active,
      waitingJobs: counts.waiting,
      completedJobs: counts.completed,
      failedJobs: counts.failed,
      delayedJobs: counts.delayed,
    };
  }

  async getFailedJobs(limit: number = 10): Promise<Bull.Job[]> {
    return await this.queue.getFailed(0, limit - 1);
  }

  async getActiveJobs(limit: number = 10): Promise<Bull.Job[]> {
    return await this.queue.getActive(0, limit - 1);
  }

  async getWaitingJobs(limit: number = 10): Promise<Bull.Job[]> {
    return await this.queue.getWaiting(0, limit - 1);
  }

  async retryAllFailed(): Promise<void> {
    const failedJobs = await this.queue.getFailed();

    for (const job of failedJobs) {
      try {
        await job.retry();
        logger.info(`Retried failed job: ${job.id}`);
      } catch (error) {
        logger.error(`Failed to retry job ${job.id}:`, error);
      }
    }

    logger.info(`Retried ${failedJobs.length} failed jobs`);
  }

  async clearAllJobs(): Promise<void> {
    await this.queue.empty();
    logger.info('All jobs cleared from queue');
  }
}
