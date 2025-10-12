const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay } = require('../utils/helpers');

class NewsAPIFetcher {
  constructor() {
    this.baseUrl = config.sources.newsapi.baseUrl;
    this.apiKey = config.apiKeys.newsapi;
    this.enabled = config.sources.newsapi.enabled && this.apiKey;
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('NewsAPI fetcher disabled - no API key provided');
      return [];
    }

    try {
      logger.info('Fetching news from NewsAPI...');
      const articles = [];

      // Fetch from different categories and keywords
      for (const category of config.sources.newsapi.categories) {
        await delay(config.fetching.requestDelayMs);
        
        const categoryArticles = await this.fetchByCategory(category);
        articles.push(...categoryArticles);
      }

      // Fetch by specific keywords
      for (const keyword of config.sources.newsapi.keywords) {
        await delay(config.fetching.requestDelayMs);
        
        const keywordArticles = await this.fetchByKeyword(keyword);
        articles.push(...keywordArticles);
      }

      const normalizedArticles = articles.map(article => 
        normalizeArticle({
          title: article.title,
          url: article.url,
          published_at: article.publishedAt,
          summary: article.description,
          author: article.author,
          image_url: article.urlToImage,
          category: 'technology'
        }, 'NewsAPI')
      );

      logger.info(`Fetched ${normalizedArticles.length} articles from NewsAPI`);
      return normalizedArticles;

    } catch (error) {
      logger.error('Error fetching from NewsAPI:', error.message);
      return [];
    }
  }

  async fetchByCategory(category) {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          apiKey: this.apiKey,
          category: category,
          language: config.sources.newsapi.language,
          pageSize: 50
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.articles || [];
    } catch (error) {
      logger.error(`Error fetching NewsAPI category ${category}:`, error.message);
      return [];
    }
  }

  async fetchByKeyword(keyword) {
    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          apiKey: this.apiKey,
          q: keyword,
          language: config.sources.newsapi.language,
          sortBy: config.sources.newsapi.sortBy,
          pageSize: 30,
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.articles || [];
    } catch (error) {
      logger.error(`Error fetching NewsAPI keyword ${keyword}:`, error.message);
      return [];
    }
  }
}

module.exports = NewsAPIFetcher;