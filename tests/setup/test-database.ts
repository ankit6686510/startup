import { DataSource } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';

export class TestDatabase {
  private static instance: TestDatabase;
  private dataSource: DataSource | null = null;

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async setup(serviceName: string): Promise<DataSource> {
    const testDbName = `test_${serviceName}_${Date.now()}`;

    // Create test database
    await createDatabase({
      ifNotExist: true,
      options: {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: testDbName,
      },
    });

    // Create data source
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: testDbName,
      entities: [`src/entities/*.ts`],
      synchronize: true,
      logging: false,
    });

    await this.dataSource.initialize();
    return this.dataSource;
  }

  async cleanup(): Promise<void> {
    if (this.dataSource) {
      const dbName = this.dataSource.options.database as string;
      await this.dataSource.destroy();

      // Drop test database
      await dropDatabase({
        options: {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: dbName,
        },
      });

      this.dataSource = null;
    }
  }

  getDataSource(): DataSource | null {
    return this.dataSource;
  }
}

export const setupTestDatabase = (serviceName: string) =>
  TestDatabase.getInstance().setup(serviceName);

export const cleanupTestDatabase = () => TestDatabase.getInstance().cleanup();

export const getTestDataSource = () => TestDatabase.getInstance().getDataSource();
