const express = require('express');
const cron = require('node-cron');
const fs = require('fs').promises;
const config = require('./config');
const logger = require('./utils/logger');
const NewsAggregator = require('./aggregator');

class NewsAggregatorServer {
  constructor() {
    this.app = express();
    this.aggregator = new NewsAggregator();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupScheduler();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('public'));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Get latest news
    this.app.get('/api/news', async (req, res) => {
      try {
        const data = await this.getLatestNews();
        const { limit = 50, source, category, keyword } = req.query;
        
        let articles = data.articles || [];
        
        // Apply filters
        if (source) {
          articles = articles.filter(article => 
            article.source.toLowerCase().includes(source.toLowerCase())
          );
        }
        
        if (category) {
          articles = articles.filter(article => 
            article.category.toLowerCase().includes(category.toLowerCase())
          );
        }
        
        if (keyword) {
          const keywordLower = keyword.toLowerCase();
          articles = articles.filter(article => 
            article.title.toLowerCase().includes(keywordLower) ||
            article.summary.toLowerCase().includes(keywordLower)
          );
        }
        
        // Limit results
        articles = articles.slice(0, parseInt(limit));
        
        res.json({
          success: true,
          metadata: data.metadata,
          total: articles.length,
          articles: articles
        });
        
      } catch (error) {
        logger.error('Error serving news:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch news' 
        });
      }
    });

    // Get news metadata/stats
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.aggregator.getStats();
        res.json({ success: true, stats });
      } catch (error) {
        logger.error('Error serving stats:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch stats' 
        });
      }
    });

    // Trigger manual fetch
    this.app.post('/api/fetch', async (req, res) => {
      try {
        logger.info('Manual fetch triggered');
        const result = await this.aggregator.aggregateNews();
        
        res.json({ 
          success: true, 
          message: 'News fetched successfully',
          total_articles: result.articles.length,
          processing_time: result.metadata.processing_time_ms
        });
        
      } catch (error) {
        logger.error('Error in manual fetch:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch news' 
        });
      }
    });

    // Get available sources
    this.app.get('/api/sources', (req, res) => {
      const sources = Object.keys(config.sources)
        .filter(source => config.sources[source].enabled)
        .map(source => ({
          name: source,
          enabled: config.sources[source].enabled,
          description: this.getSourceDescription(source)
        }));
        
      res.json({ success: true, sources });
    });

    // Search news
    this.app.get('/api/search', async (req, res) => {
      try {
        const { q, limit = 20 } = req.query;
        
        if (!q) {
          return res.status(400).json({ 
            success: false, 
            error: 'Query parameter "q" is required' 
          });
        }
        
        const data = await this.getLatestNews();
        const queryLower = q.toLowerCase();
        
        const results = data.articles.filter(article => 
          article.title.toLowerCase().includes(queryLower) ||
          article.summary.toLowerCase().includes(queryLower) ||
          (article.keywords && article.keywords.some(keyword => 
            keyword.toLowerCase().includes(queryLower)
          ))
        ).slice(0, parseInt(limit));
        
        res.json({
          success: true,
          query: q,
          total: results.length,
          articles: results
        });
        
      } catch (error) {
        logger.error('Error in search:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Search failed' 
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
      });
    });
  }

  setupScheduler() {
    // Schedule automatic fetching
    const cronExpression = `*/${config.fetching.intervalMinutes} * * * *`;
    
    cron.schedule(cronExpression, async () => {
      try {
        logger.info('Scheduled fetch starting...');
        await this.aggregator.aggregateNews();
        logger.info('Scheduled fetch completed');
      } catch (error) {
        logger.error('Scheduled fetch failed:', error);
      }
    });
    
    logger.info(`Scheduled fetching every ${config.fetching.intervalMinutes} minutes`);
  }

  async getLatestNews() {
    try {
      const data = await fs.readFile(config.output.file, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn('No existing news data found, fetching fresh data...');
      return await this.aggregator.aggregateNews();
    }
  }

  getSourceDescription(source) {
    const descriptions = {
      newsapi: 'NewsAPI.org - Business and technology news',
      mediastack: 'Mediastack API - Real-time news',
      guardian: 'The Guardian Open Platform',
      hackernews: 'Hacker News - Tech and startup stories',
      reddit: 'Reddit - Startup and entrepreneur communities',
      rssFeeds: 'RSS Feeds - TechCrunch, Inc42, VentureBeat',
      googleNews: 'Google News RSS - Keyword-based searches'
    };
    
    return descriptions[source] || 'News source';
  }

  start() {
    const port = config.server.port;
    
    this.app.listen(port, () => {
      logger.info(`News Aggregator Server running on port ${port}`);
      logger.info(`API endpoints:`);
      logger.info(`  GET  /api/news - Get latest news`);
      logger.info(`  GET  /api/stats - Get aggregation statistics`);
      logger.info(`  POST /api/fetch - Trigger manual fetch`);
      logger.info(`  GET  /api/sources - Get available sources`);
      logger.info(`  GET  /api/search?q=query - Search news`);
      logger.info(`  GET  /health - Health check`);
    });
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new NewsAggregatorServer();
  server.start();
}

module.exports = NewsAggregatorServer;