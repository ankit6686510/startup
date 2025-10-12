const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay } = require('../utils/helpers');

class GuardianFetcher {
  constructor() {
    this.baseUrl = config.sources.guardian.baseUrl;
    this.apiKey = config.apiKeys.guardian;
    this.enabled = config.sources.guardian.enabled && this.apiKey;
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('Guardian fetcher disabled - no API key provided');
      return [];
    }

    try {
      logger.info('Fetching news from The Guardian...');
      const articles = [];

      // Fetch by sections
      for (const section of config.sources.guardian.sections) {
        await delay(config.fetching.requestDelayMs);
        
        const sectionArticles = await this.fetchBySection(section);
        articles.push(...sectionArticles);
      }

      // Fetch by keywords
      for (const keyword of config.sources.guardian.keywords) {
        await delay(config.fetching.requestDelayMs);
        
        const keywordArticles = await this.fetchByKeyword(keyword);
        articles.push(...keywordArticles);
      }

      const normalizedArticles = articles.map(article => 
        normalizeArticle({
          title: article.webTitle,
          url: article.webUrl,
          published_at: article.webPublicationDate,
          summary: article.fields?.trailText || article.webTitle,
          author: article.fields?.byline,
          category: article.sectionName,
          image_url: article.fields?.thumbnail
        }, 'The Guardian')
      );

      logger.info(`Fetched ${normalizedArticles.length} articles from The Guardian`);
      return normalizedArticles;

    } catch (error) {
      logger.error('Error fetching from The Guardian:', error.message);
      return [];
    }
  }

  async fetchBySection(section) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          'api-key': this.apiKey,
          section: section,
          'show-fields': 'trailText,byline,thumbnail',
          'page-size': 20,
          'order-by': 'newest'
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.response.results || [];
    } catch (error) {
      logger.error(`Error fetching Guardian section ${section}:`, error.message);
      return [];
    }
  }

  async fetchByKeyword(keyword) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          'api-key': this.apiKey,
          q: keyword,
          'show-fields': 'trailText,byline,thumbnail',
          'page-size': 15,
          'order-by': 'newest',
          'from-date': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 7 days
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.response.results || [];
    } catch (error) {
      logger.error(`Error fetching Guardian keyword ${keyword}:`, error.message);
      return [];
    }
  }
}

module.exports = GuardianFetcher;