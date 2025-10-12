const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const { 
  removeDuplicates, 
  filterRelevantArticles, 
  sortByDate, 
  limitArray,
  calculateRelevanceScore 
} = require('./utils/helpers');

// Import all fetchers
const NewsAPIFetcher = require('./fetchers/newsapi');
const MediastackFetcher = require('./fetchers/mediastack');
const GuardianFetcher = require('./fetchers/guardian');
const HackerNewsFetcher = require('./fetchers/hackernews');
const RedditFetcher = require('./fetchers/reddit');
const RSSFetcher = require('./fetchers/rss');
const GoogleNewsFetcher = require('./fetchers/googlenews');

class NewsAggregator {
  constructor() {
    this.fetchers = [
      new NewsAPIFetcher(),
      new MediastackFetcher(),
      new GuardianFetcher(),
      new HackerNewsFetcher(),
      new RedditFetcher(),
      new RSSFetcher(),
      new GoogleNewsFetcher()
    ];
  }

  async aggregateNews() {
    logger.info('Starting news aggregation...');
    const startTime = Date.now();
    
    try {
      // Fetch from all sources in parallel
      const fetchPromises = this.fetchers.map(async (fetcher) => {
        try {
          return await fetcher.fetchNews();
        } catch (error) {
          logger.error(`Error in fetcher ${fetcher.constructor.name}:`, error.message);
          return [];
        }
      });

      const results = await Promise.allSettled(fetchPromises);
      
      // Combine all articles
      let allArticles = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const articles = result.value;
          allArticles.push(...articles);
          logger.info(`${this.fetchers[index].constructor.name}: ${articles.length} articles`);
        } else {
          logger.error(`${this.fetchers[index].constructor.name} failed:`, result.reason);
        }
      });

      logger.info(`Total articles before processing: ${allArticles.length}`);

      // Process articles
      const processedArticles = this.processArticles(allArticles);
      
      // Generate metadata
      const metadata = this.generateMetadata(processedArticles, startTime);
      
      // Create final output
      const output = {
        metadata,
        articles: processedArticles
      };

      // Save to file
      await this.saveToFile(output);
      
      logger.info(`News aggregation completed. Final count: ${processedArticles.length} articles`);
      return output;

    } catch (error) {
      logger.error('Error during news aggregation:', error);
      throw error;
    }
  }

  processArticles(articles) {
    logger.info('Processing articles...');
    
    // Step 1: Remove duplicates
    let processed = removeDuplicates(articles);
    logger.info(`After deduplication: ${processed.length} articles`);
    
    // Step 2: Filter for relevance
    processed = filterRelevantArticles(processed);
    logger.info(`After relevance filtering: ${processed.length} articles`);
    
    // Step 3: Calculate relevance scores
    processed = processed.map(article => ({
      ...article,
      relevance_score: calculateRelevanceScore(article)
    }));
    
    // Step 4: Sort by relevance and date
    processed = processed.sort((a, b) => {
      // First by relevance score, then by date
      if (b.relevance_score !== a.relevance_score) {
        return b.relevance_score - a.relevance_score;
      }
      return new Date(b.published_at) - new Date(a.published_at);
    });
    
    // Step 5: Limit to max articles
    processed = limitArray(processed, config.fetching.maxArticlesPerSource * this.fetchers.length);
    
    return processed;
  }

  generateMetadata(articles, startTime) {
    const endTime = Date.now();
    const sources = [...new Set(articles.map(article => article.source))];
    const categories = [...new Set(articles.map(article => article.category))];
    
    // Calculate source distribution
    const sourceDistribution = {};
    sources.forEach(source => {
      sourceDistribution[source] = articles.filter(article => article.source === source).length;
    });

    // Calculate category distribution
    const categoryDistribution = {};
    categories.forEach(category => {
      categoryDistribution[category] = articles.filter(article => article.category === category).length;
    });

    // Calculate time distribution (last 24h, 7d, etc.)
    const now = new Date();
    const timeDistribution = {
      last_hour: 0,
      last_24_hours: 0,
      last_7_days: 0,
      older: 0
    };

    articles.forEach(article => {
      const publishedAt = new Date(article.published_at);
      const hoursAgo = (now - publishedAt) / (1000 * 60 * 60);
      
      if (hoursAgo <= 1) timeDistribution.last_hour++;
      else if (hoursAgo <= 24) timeDistribution.last_24_hours++;
      else if (hoursAgo <= 168) timeDistribution.last_7_days++; // 7 * 24
      else timeDistribution.older++;
    });

    return {
      generated_at: new Date().toISOString(),
      processing_time_ms: endTime - startTime,
      total_articles: articles.length,
      sources_count: sources.length,
      sources: sources,
      source_distribution: sourceDistribution,
      category_distribution: categoryDistribution,
      time_distribution: timeDistribution,
      keywords_found: this.extractTopKeywords(articles),
      avg_relevance_score: articles.reduce((sum, article) => sum + (article.relevance_score || 0), 0) / articles.length
    };
  }

  extractTopKeywords(articles) {
    const keywordCount = {};
    
    articles.forEach(article => {
      if (article.keywords) {
        article.keywords.forEach(keyword => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      }
    });

    // Return top 10 keywords
    return Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  async saveToFile(output) {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(config.output.file);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Save main output
      await fs.writeFile(
        config.output.file, 
        JSON.stringify(output, null, 2), 
        'utf8'
      );
      
      // Save articles only (for easier consumption)
      const articlesOnlyFile = config.output.file.replace('.json', '_articles_only.json');
      await fs.writeFile(
        articlesOnlyFile,
        JSON.stringify(output.articles, null, 2),
        'utf8'
      );
      
      // Save metadata only
      const metadataFile = config.output.file.replace('.json', '_metadata.json');
      await fs.writeFile(
        metadataFile,
        JSON.stringify(output.metadata, null, 2),
        'utf8'
      );
      
      logger.info(`Results saved to ${config.output.file}`);
      
    } catch (error) {
      logger.error('Error saving to file:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const data = await fs.readFile(config.output.file, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.metadata;
    } catch (error) {
      logger.error('Error reading stats:', error);
      return null;
    }
  }
}

// CLI execution
if (require.main === module) {
  const aggregator = new NewsAggregator();
  
  aggregator.aggregateNews()
    .then((result) => {
      console.log('\n=== NEWS AGGREGATION COMPLETE ===');
      console.log(`Total articles: ${result.articles.length}`);
      console.log(`Sources: ${result.metadata.sources.join(', ')}`);
      console.log(`Processing time: ${result.metadata.processing_time_ms}ms`);
      console.log(`Output saved to: ${config.output.file}`);
      
      // Display top articles
      console.log('\n=== TOP 5 ARTICLES ===');
      result.articles.slice(0, 5).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.source} | Score: ${article.relevance_score}`);
        console.log(`   URL: ${article.url}`);
        console.log('');
      });
    })
    .catch((error) => {
      console.error('Aggregation failed:', error);
      process.exit(1);
    });
}

module.exports = NewsAggregator;