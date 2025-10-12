const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay } = require('../utils/helpers');

class MediastackFetcher {
  constructor() {
    this.baseUrl = config.sources.mediastack.baseUrl;
    this.apiKey = config.apiKeys.mediastack;
    this.enabled = config.sources.mediastack.enabled && this.apiKey;
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('Mediastack fetcher disabled - no API key provided');
      return [];
    }

    try {
      logger.info('Fetching news from Mediastack...');
      const articles = [];

      // Fetch by categories
      for (const category of config.sources.mediastack.categories) {
        await delay(config.fetching.requestDelayMs);
        
        const categoryArticles = await this.fetchByCategory(category);
        articles.push(...categoryArticles);
      }

      // Fetch by keywords
      for (const keyword of config.sources.mediastack.keywords) {
        await delay(config.fetching.requestDelayMs);
        
        const keywordArticles = await this.fetchByKeyword(keyword);
        articles.push(...keywordArticles);
      }

      const normalizedArticles = articles.map(article => 
        normalizeArticle({
          title: article.title,
          url: article.url,
          published_at: article.published_at,
          summary: article.description,
          author: article.author,
          image_url: article.image,
          category: article.category
        }, 'Mediastack')
      );

      logger.info(`Fetched ${normalizedArticles.length} articles from Mediastack`);
      return normalizedArticles;

    } catch (error) {
      logger.error('Error fetching from Mediastack:', error.message);
      return [];
    }
  }

  async fetchByCategory(category) {
    try {
      const response = await axios.get(`${this.baseUrl}/news`, {
        params: {
          access_key: this.apiKey,
          categories: category,
          languages: config.sources.mediastack.languages,
          limit: 25,
          sort: 'published_desc'
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.data || [];
    } catch (error) {
      logger.error(`Error fetching Mediastack category ${category}:`, error.message);
      return [];
    }
  }

  async fetchByKeyword(keyword) {
    try {
      const response = await axios.get(`${this.baseUrl}/news`, {
        params: {
          access_key: this.apiKey,
          keywords: keyword,
          languages: config.sources.mediastack.languages,
          limit: 25,
          sort: 'published_desc'
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.data || [];
    } catch (error) {
      logger.error(`Error fetching Mediastack keyword ${keyword}:`, error.message);
      return [];
    }
  }
}

module.exports = MediastackFetcher;