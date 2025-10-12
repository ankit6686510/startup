import { DataSource, QueryRunner } from 'typeorm';
import { performance } from 'perf_hooks';

interface QueryAnalysis {
  query: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: Date;
  parameters?: any[];
  explain?: any;
}

interface IndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: string;
}

interface OptimizationRecommendation {
  type: 'index' | 'query' | 'schema' | 'configuration';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  implementation: string;
}

export class DatabaseOptimizer {
  private dataSource: DataSource;
  private queryAnalytics: QueryAnalysis[] = [];
  private slowQueryThreshold: number = 1000; // 1 second
  private isMonitoring: boolean = false;

  constructor(dataSource: DataSource, slowQueryThreshold: number = 1000) {
    this.dataSource = dataSource;
    this.slowQueryThreshold = slowQueryThreshold;
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.setupQueryLogging();
    console.log('Database optimization monitoring started');
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Database optimization monitoring stopped');
  }

  private setupQueryLogging(): void {
    // Override the query method to capture performance metrics
    const originalQuery = this.dataSource.query.bind(this.dataSource);
    
    this.dataSource.query = async (query: string, parameters?: any[]): Promise<any> => {
      const startTime = performance.now();
      
      try {
        const result = await originalQuery(query, parameters);
        const executionTime = performance.now() - startTime;
        
        // Record query analytics
        this.recordQuery({
          query,
          executionTime,
          rowsAffected: Array.isArray(result) ? result.length : 1,
          timestamp: new Date(),
          parameters
        });

        // If query is slow, get execution plan
        if (executionTime > this.slowQueryThreshold) {
          await this.analyzeSlowQuery(query, parameters);
        }

        return result;
      } catch (error) {
        const executionTime = performance.now() - startTime;
        
        this.recordQuery({
          query,
          executionTime,
          rowsAffected: 0,
          timestamp: new Date(),
          parameters
        });

        throw error;
      }
    };
  }

  private recordQuery(analysis: QueryAnalysis): void {
    this.queryAnalytics.push(analysis);
    
    // Keep only last 10000 queries to prevent memory issues
    if (this.queryAnalytics.length > 10000) {
      this.queryAnalytics = this.queryAnalytics.slice(-5000);
    }
  }

  private async analyzeSlowQuery(query: string, parameters?: any[]): Promise<void> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      
      // Get execution plan for PostgreSQL
      if (this.dataSource.options.type === 'postgres') {
        const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
        const explainResult = await queryRunner.query(explainQuery, parameters);
        
        const analysis = this.queryAnalytics[this.queryAnalytics.length - 1];
        if (analysis) {
          analysis.explain = explainResult[0]['QUERY PLAN'][0];
        }
      }
      
      await queryRunner.release();
    } catch (error) {
      console.warn('Failed to analyze slow query:', error);
    }
  }

  public getSlowQueries(limit: number = 50): QueryAnalysis[] {
    return this.queryAnalytics
      .filter(q => q.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  public getQueryStatistics(): any {
    if (this.queryAnalytics.length === 0) {
      return null;
    }

    const executionTimes = this.queryAnalytics.map(q => q.executionTime);
    const totalQueries = this.queryAnalytics.length;
    const slowQueries = this.queryAnalytics.filter(q => q.executionTime > this.slowQueryThreshold).length;

    executionTimes.sort((a, b) => a - b);

    return {
      totalQueries,
      slowQueries,
      slowQueryPercentage: (slowQueries / totalQueries) * 100,
      averageExecutionTime: executionTimes.reduce((sum, time) => sum + time, 0) / totalQueries,
      medianExecutionTime: executionTimes[Math.floor(executionTimes.length / 2)],
      p95ExecutionTime: executionTimes[Math.floor(executionTimes.length * 0.95)],
      p99ExecutionTime: executionTimes[Math.floor(executionTimes.length * 0.99)],
      maxExecutionTime: Math.max(...executionTimes),
      minExecutionTime: Math.min(...executionTimes)
    };
  }

  public async analyzeTableUsage(): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      if (this.dataSource.options.type === 'postgres') {
        // Get table statistics
        const tableStats = await queryRunner.query(`
          SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_tuples,
            n_dead_tup as dead_tuples,
            last_vacuum,
            last_autovacuum,
            last_analyze,
            last_autoanalyze
          FROM pg_stat_user_tables
          ORDER BY n_live_tup DESC;
        `);

        // Get index usage statistics
        const indexStats = await queryRunner.query(`
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_tup_read,
            idx_tup_fetch,
            idx_scan
          FROM pg_stat_user_indexes
          ORDER BY idx_scan DESC;
        `);

        // Get table sizes
        const tableSizes = await queryRunner.query(`
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
            pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
          FROM pg_tables 
          WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        `);

        return {
          tableStats,
          indexStats,
          tableSizes
        };
      }
    } finally {
      await queryRunner.release();
    }

    return null;
  }

  public async findMissingIndexes(): Promise<IndexSuggestion[]> {
    const suggestions: IndexSuggestion[] = [];
    const slowQueries = this.getSlowQueries(100);

    for (const query of slowQueries) {
      if (query.explain) {
        const plan = query.explain.Plan;
        const indexSuggestions = this.analyzeExecutionPlan(plan, query.query);
        suggestions.push(...indexSuggestions);
      }
    }

    // Remove duplicates and sort by estimated improvement
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => 
        s.table === suggestion.table && 
        JSON.stringify(s.columns) === JSON.stringify(suggestion.columns)
      )
    );

    return uniqueSuggestions;
  }

  private analyzeExecutionPlan(plan: any, query: string): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];

    // Look for sequential scans on large tables
    if (plan['Node Type'] === 'Seq Scan' && plan['Actual Rows'] > 1000) {
      const tableName = plan['Relation Name'];
      const filter = plan['Filter'];
      
      if (filter) {
        // Extract column names from filter condition
        const columns = this.extractColumnsFromFilter(filter);
        if (columns.length > 0) {
          suggestions.push({
            table: tableName,
            columns,
            reason: `Sequential scan on ${plan['Actual Rows']} rows with filter condition`,
            estimatedImprovement: 'High - Could reduce query time significantly'
          });
        }
      }
    }

    // Look for hash joins that could benefit from indexes
    if (plan['Node Type'] === 'Hash Join') {
      const hashCondition = plan['Hash Cond'];
      if (hashCondition) {
        const joinColumns = this.extractJoinColumns(hashCondition);
        for (const { table, column } of joinColumns) {
          suggestions.push({
            table,
            columns: [column],
            reason: 'Hash join condition could benefit from index',
            estimatedImprovement: 'Medium - Could improve join performance'
          });
        }
      }
    }

    // Recursively analyze child plans
    if (plan.Plans) {
      for (const childPlan of plan.Plans) {
        suggestions.push(...this.analyzeExecutionPlan(childPlan, query));
      }
    }

    return suggestions;
  }

  private extractColumnsFromFilter(filter: string): string[] {
    // Simple regex to extract column names from filter conditions
    const columnMatches = filter.match(/\b(\w+)\s*[=<>!]/g);
    if (!columnMatches) return [];

    return columnMatches.map(match => match.replace(/\s*[=<>!].*/, '').trim());
  }

  private extractJoinColumns(hashCondition: string): Array<{ table: string, column: string }> {
    // Extract table.column patterns from join conditions
    const matches = hashCondition.match(/(\w+)\.(\w+)/g);
    if (!matches) return [];

    return matches.map(match => {
      const [table, column] = match.split('.');
      return { table, column };
    });
  }

  public async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    const stats = this.getQueryStatistics();
    const tableUsage = await this.analyzeTableUsage();
    const missingIndexes = await this.findMissingIndexes();

    // Query performance recommendations
    if (stats && stats.slowQueryPercentage > 10) {
      recommendations.push({
        type: 'query',
        priority: 'high',
        description: `${stats.slowQueryPercentage.toFixed(1)}% of queries are slow (>${this.slowQueryThreshold}ms)`,
        impact: 'High - Affects user experience and system performance',
        implementation: 'Review and optimize slow queries, add appropriate indexes'
      });
    }

    if (stats && stats.p95ExecutionTime > 2000) {
      recommendations.push({
        type: 'query',
        priority: 'medium',
        description: `95th percentile query time is ${stats.p95ExecutionTime.toFixed(0)}ms`,
        impact: 'Medium - May cause timeouts under load',
        implementation: 'Optimize queries in the 95th percentile range'
      });
    }

    // Index recommendations
    for (const indexSuggestion of missingIndexes.slice(0, 10)) {
      recommendations.push({
        type: 'index',
        priority: indexSuggestion.estimatedImprovement.includes('High') ? 'high' : 'medium',
        description: `Add index on ${indexSuggestion.table}(${indexSuggestion.columns.join(', ')})`,
        impact: indexSuggestion.estimatedImprovement,
        implementation: `CREATE INDEX idx_${indexSuggestion.table}_${indexSuggestion.columns.join('_')} ON ${indexSuggestion.table}(${indexSuggestion.columns.join(', ')});`
      });
    }

    // Table maintenance recommendations
    if (tableUsage && tableUsage.tableStats) {
      for (const table of tableUsage.tableStats) {
        const deadTupleRatio = table.dead_tuples / (table.live_tuples + table.dead_tuples);
        
        if (deadTupleRatio > 0.2) {
          recommendations.push({
            type: 'schema',
            priority: 'medium',
            description: `Table ${table.tablename} has ${(deadTupleRatio * 100).toFixed(1)}% dead tuples`,
            impact: 'Medium - Affects query performance and storage efficiency',
            implementation: `VACUUM ANALYZE ${table.tablename};`
          });
        }
      }
    }

    // Configuration recommendations
    if (stats && stats.totalQueries > 10000) {
      recommendations.push({
        type: 'configuration',
        priority: 'low',
        description: 'Consider enabling query plan caching for frequently executed queries',
        impact: 'Low - Small performance improvement for repeated queries',
        implementation: 'Configure prepared statements and query plan caching'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  public async optimizeDatabase(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      if (this.dataSource.options.type === 'postgres') {
        console.log('Running database optimization...');
        
        // Update table statistics
        await queryRunner.query('ANALYZE;');
        console.log('✓ Updated table statistics');
        
        // Vacuum tables with high dead tuple ratio
        const tableUsage = await this.analyzeTableUsage();
        if (tableUsage && tableUsage.tableStats) {
          for (const table of tableUsage.tableStats) {
            const deadTupleRatio = table.dead_tuples / (table.live_tuples + table.dead_tuples);
            
            if (deadTupleRatio > 0.1) {
              await queryRunner.query(`VACUUM ANALYZE ${table.tablename};`);
              console.log(`✓ Vacuumed table ${table.tablename}`);
            }
          }
        }
        
        // Reindex tables if needed
        const recommendations = await this.generateOptimizationRecommendations();
        const indexRecommendations = recommendations.filter(r => r.type === 'index' && r.priority === 'high');
        
        for (const rec of indexRecommendations.slice(0, 5)) { // Limit to 5 indexes per run
          try {
            await queryRunner.query(rec.implementation);
            console.log(`✓ Created index: ${rec.implementation}`);
          } catch (error) {
            console.warn(`Failed to create index: ${rec.implementation}`, error);
          }
        }
        
        console.log('Database optimization completed');
      }
    } finally {
      await queryRunner.release();
    }
  }

  public generatePerformanceReport(): any {
    const stats = this.getQueryStatistics();
    const slowQueries = this.getSlowQueries(10);
    
    return {
      timestamp: new Date().toISOString(),
      statistics: stats,
      slowQueries: slowQueries.map(q => ({
        query: q.query.substring(0, 200) + (q.query.length > 200 ? '...' : ''),
        executionTime: q.executionTime,
        timestamp: q.timestamp,
        rowsAffected: q.rowsAffected
      })),
      recommendations: [], // Will be populated by generateOptimizationRecommendations
      monitoring: {
        isActive: this.isMonitoring,
        slowQueryThreshold: this.slowQueryThreshold,
        totalQueriesAnalyzed: this.queryAnalytics.length
      }
    };
  }

  // Connection pool optimization
  public async optimizeConnectionPool(): Promise<void> {
    const poolSize = (this.dataSource.options as any).extra?.max || 10;
    const activeConnections = this.dataSource.isInitialized ? 1 : 0; // Simplified check
    
    console.log(`Current pool size: ${poolSize}`);
    console.log(`Active connections: ${activeConnections}`);
    
    // Recommendations for connection pool optimization
    if (poolSize < 5) {
      console.log('Recommendation: Increase connection pool size for better concurrency');
    } else if (poolSize > 50) {
      console.log('Recommendation: Consider reducing connection pool size to avoid resource exhaustion');
    }
  }

  // Query cache optimization
  public analyzeQueryPatterns(): any {
    const queryPatterns = new Map<string, number>();
    
    for (const query of this.queryAnalytics) {
      // Normalize query by removing parameters
      const normalizedQuery = query.query.replace(/\$\d+/g, '?').replace(/\d+/g, 'N');
      const count = queryPatterns.get(normalizedQuery) || 0;
      queryPatterns.set(normalizedQuery, count + 1);
    }
    
    // Sort by frequency
    const sortedPatterns = Array.from(queryPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return {
      totalUniquePatterns: queryPatterns.size,
      mostFrequentPatterns: sortedPatterns.map(([pattern, count]) => ({
        pattern: pattern.substring(0, 100) + (pattern.length > 100 ? '...' : ''),
        frequency: count,
        percentage: (count / this.queryAnalytics.length) * 100
      }))
    };
  }
}

// Express middleware for database performance monitoring
export const databasePerformanceMiddleware = (optimizer: DatabaseOptimizer) => {
  return (req: any, res: any, next: any) => {
    // Start monitoring if not already started
    if (!optimizer['isMonitoring']) {
      optimizer.startMonitoring();
    }
    
    next();
  };
};

// Utility function to create optimizer instance
export const createDatabaseOptimizer = (dataSource: DataSource, options?: {
  slowQueryThreshold?: number;
  autoOptimize?: boolean;
}): DatabaseOptimizer => {
  const optimizer = new DatabaseOptimizer(
    dataSource, 
    options?.slowQueryThreshold || 1000
  );
  
  if (options?.autoOptimize) {
    // Run optimization every hour
    setInterval(async () => {
      try {
        await optimizer.optimizeDatabase();
      } catch (error) {
        console.error('Auto-optimization failed:', error);
      }
    }, 60 * 60 * 1000);
  }
  
  return optimizer;
};

export default DatabaseOptimizer;