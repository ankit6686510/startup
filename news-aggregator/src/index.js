#!/usr/bin/env node

const NewsAggregatorServer = require('./server');
const NewsAggregator = require('./aggregator');
const logger = require('./utils/logger');

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'fetch':
        logger.info('Running one-time fetch...');
        const aggregator = new NewsAggregator();
        const result = await aggregator.aggregateNews();
        console.log(`\nFetch completed: ${result.articles.length} articles aggregated`);
        process.exit(0);
        break;
        
      case 'server':
      case 'serve':
        logger.info('Starting server mode...');
        const server = new NewsAggregatorServer();
        server.start();
        break;
        
      case 'stats':
        logger.info('Fetching statistics...');
        const statsAggregator = new NewsAggregator();
        const stats = await statsAggregator.getStats();
        if (stats) {
          console.log('\n=== NEWS AGGREGATION STATS ===');
          console.log(`Generated: ${stats.generated_at}`);
          console.log(`Total articles: ${stats.total_articles}`);
          console.log(`Sources: ${stats.sources_count}`);
          console.log(`Processing time: ${stats.processing_time_ms}ms`);
          console.log(`Average relevance: ${stats.avg_relevance_score?.toFixed(2)}`);
          
          console.log('\nSource distribution:');
          Object.entries(stats.source_distribution).forEach(([source, count]) => {
            console.log(`  ${source}: ${count} articles`);
          });
          
          console.log('\nTop keywords:');
          stats.keywords_found.slice(0, 5).forEach(({ keyword, count }) => {
            console.log(`  ${keyword}: ${count} mentions`);
          });
        } else {
          console.log('No statistics available. Run fetch first.');
        }
        process.exit(0);
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      default:
        if (command) {
          console.error(`Unknown command: ${command}`);
        }
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    logger.error('Application error:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
News Aggregator - Startup & Tech News from Multiple Sources

Usage:
  npm start [command]

Commands:
  fetch     - Run one-time news aggregation
  server    - Start HTTP server with API endpoints
  stats     - Show aggregation statistics
  help      - Show this help message

Examples:
  npm start fetch          # Fetch news once and exit
  npm start server         # Start API server
  npm start stats          # Show current stats

API Endpoints (when running server):
  GET  /api/news           # Get latest news
  GET  /api/news?source=TechCrunch&limit=10
  GET  /api/search?q=funding
  GET  /api/stats          # Get statistics
  POST /api/fetch          # Trigger manual fetch
  GET  /api/sources        # List available sources
  GET  /health             # Health check

Environment Variables:
  NEWSAPI_KEY              # NewsAPI.org API key (optional)
  MEDIASTACK_KEY           # Mediastack API key (optional)
  GUARDIAN_API_KEY         # Guardian API key (optional)
  PORT                     # Server port (default: 3000)
  FETCH_INTERVAL_MINUTES   # Auto-fetch interval (default: 30)

Configuration:
  Copy .env.example to .env and add your API keys for better results.
  The aggregator works without API keys using free sources.
`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main();