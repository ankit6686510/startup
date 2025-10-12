import Redis from 'ioredis';

export class TestRedis {
  private static instance: TestRedis;
  private client: Redis | null = null;

  static getInstance(): TestRedis {
    if (!TestRedis.instance) {
      TestRedis.instance = new TestRedis();
    }
    return TestRedis.instance;
  }

  async setup(): Promise<Redis> {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 15, // Use database 15 for tests
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    // Clear test database
    await this.client.flushdb();
    
    return this.client;
  }

  async cleanup(): Promise<void> {
    if (this.client) {
      await this.client.flushdb();
      await this.client.quit();
      this.client = null;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }
}

export const setupTestRedis = () => TestRedis.getInstance().setup();
export const cleanupTestRedis = () => TestRedis.getInstance().cleanup();
export const getTestRedis = () => TestRedis.getInstance().getClient();