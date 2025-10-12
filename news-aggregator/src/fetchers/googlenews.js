const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay, isValidUrl } = require('../utils/helpers');

class GoogleNewsFetcher {
  constructor() {
    this.baseUrl = config.sources.googleNews.baseUrl;
    this.enabled = config.sources.googleNews.enabled;
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('Google News fetcher disabled');
      return [];
    }

    try {
      logger.info('Fetching news from Google News RSS...');
      const articles = [];

      // Fetch for each query
      for (const query of config.sources.googleNews.queries) {
        await delay(config.fetching.requestDelayMs);
        
        const queryArticles = await this.fetchByQuery(query);
        articles.push(...queryArticles);
      }

      logger.info(`Fetched ${articles.length} articles from Google News`);
      return articles;

    } catch (error) {
      logger.error('Error fetching from Google News:', error.message);
      return [];
    }
  }

  async fetchByQuery(query) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseUrl}?q=${encodedQuery}&hl=en&gl=US&ceid=US:en`;
      
      logger.debug(`Fetching Google News for query: ${query}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'StartupNewsAggregator/1.0'
        },
        timeout: config.fetching.timeoutMs
      });

      const parsed = this.parser.parse(response.data);
      const items = this.extractItems(parsed);

      const normalizedArticles = items.map(item => 
        normalizeArticle({
          title: this.extractTitle(item),
          url: this.extractLink(item),
          published_at: this.extractDate(item),
          summary: this.extractDescription(item),
          author: this.extractSource(item),
          category: 'news'
        }, 'Google News')
      ).filter(article => article.url && isValidUrl(article.url));

      logger.debug(`Fetched ${normalizedArticles.length} articles for query: ${query}`);
      return normalizedArticles;

    } catch (error) {
      logger.error(`Error fetching Google News query ${query}:`, error.message);
      return [];
    }
  }

  extractItems(parsed) {
    if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
      return Array.isArray(parsed.rss.channel.item) 
        ? parsed.rss.channel.item 
        : [parsed.rss.channel.item];
    }
    return [];
  }

  extractTitle(item) {
    let title = item.title || '';
    
    // Google News titles often include source in format "Title - Source"
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length > 1) {
        // Remove the last part (source) and join the rest
        title = parts.slice(0, -1).join(' - ');
      }
    }
    
    return title;
  }

  extractLink(item) {
    if (item.link) {
      return item.link;
    }
    if (item.guid && typeof item.guid === 'string') {
      return item.guid;
    }
    return '';
  }

  extractDate(item) {
    return item.pubDate || new Date().toISOString();
  }

  extractDescription(item) {
    let description = item.description || '';
    
    // Clean up Google News description format
    if (description.includes('<a href=')) {
      // Remove HTML tags
      description = description.replace(/<[^>]*>/g, '');
    }
    
    return description;
  }

  extractSource(item) {
    // Try to extract source from title
    const title = item.title || '';
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length > 1) {
        return parts[parts.length - 1]; // Last part is usually the source
      }
    }
    
    return null;
  }
}

module.exports = GoogleNewsFetcher;