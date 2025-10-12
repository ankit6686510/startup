const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay, limitArray } = require('../utils/helpers');

class HackerNewsFetcher {
  constructor() {
    this.baseUrl = config.sources.hackernews.baseUrl;
    this.enabled = config.sources.hackernews.enabled;
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('HackerNews fetcher disabled');
      return [];
    }

    try {
      logger.info('Fetching news from Hacker News...');
      const articles = [];

      // Fetch top stories and new stories
      for (const endpoint of config.sources.hackernews.endpoints) {
        await delay(config.fetching.requestDelayMs);
        
        const stories = await this.fetchStories(endpoint);
        articles.push(...stories);
      }

      const normalizedArticles = articles.map(article => 
        normalizeArticle({
          title: article.title,
          url: article.url || `https://news.ycombinator.com/item?id=${article.id}`,
          published_at: new Date(article.time * 1000).toISOString(),
          summary: article.text || article.title,
          author: article.by,
          category: 'technology'
        }, 'Hacker News')
      );

      // Filter for startup/tech relevant content
      const relevantArticles = this.filterRelevantStories(normalizedArticles);

      logger.info(`Fetched ${relevantArticles.length} relevant articles from Hacker News`);
      return relevantArticles;

    } catch (error) {
      logger.error('Error fetching from Hacker News:', error.message);
      return [];
    }
  }

  async fetchStories(endpoint) {
    try {
      // Get story IDs
      const idsResponse = await axios.get(`${this.baseUrl}/${endpoint}.json`, {
        timeout: config.fetching.timeoutMs
      });

      const storyIds = limitArray(idsResponse.data, config.sources.hackernews.maxItems);
      const stories = [];

      // Fetch individual stories (with rate limiting)
      for (let i = 0; i < Math.min(storyIds.length, 50); i++) {
        try {
          await delay(100); // Small delay to avoid overwhelming the API
          
          const storyResponse = await axios.get(`${this.baseUrl}/item/${storyIds[i]}.json`, {
            timeout: 5000
          });

          const story = storyResponse.data;
          
          // Only include stories (not comments, jobs, etc.)
          if (story && story.type === 'story' && story.title) {
            stories.push(story);
          }
        } catch (error) {
          logger.debug(`Error fetching HN story ${storyIds[i]}:`, error.message);
          continue;
        }
      }

      return stories;
    } catch (error) {
      logger.error(`Error fetching HN ${endpoint}:`, error.message);
      return [];
    }
  }

  filterRelevantStories(articles) {
    const startupKeywords = [
      'startup', 'funding', 'series', 'seed', 'venture',
      'vc', 'entrepreneur', 'launch', 'saas', 'fintech',
      'ai', 'ml', 'blockchain', 'crypto', 'ipo',
      'acquisition', 'merger', 'unicorn', 'y combinator',
      'techstars', 'accelerator', 'incubator'
    ];

    return articles.filter(article => {
      const text = (article.title + ' ' + article.summary).toLowerCase();
      return startupKeywords.some(keyword => text.includes(keyword));
    });
  }
}

module.exports = HackerNewsFetcher;