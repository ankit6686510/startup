const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay } = require('../utils/helpers');

class RedditFetcher {
  constructor() {
    this.baseUrl = config.sources.reddit.baseUrl;
    this.enabled = config.sources.reddit.enabled;
    this.userAgent = 'StartupNewsAggregator/1.0';
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('Reddit fetcher disabled');
      return [];
    }

    try {
      logger.info('Fetching news from Reddit...');
      const articles = [];

      // Fetch from each subreddit
      for (const subreddit of config.sources.reddit.subreddits) {
        await delay(config.fetching.requestDelayMs);
        
        const posts = await this.fetchSubreddit(subreddit);
        articles.push(...posts);
      }

      const normalizedArticles = articles.map(article => 
        normalizeArticle({
          title: article.title,
          url: article.url,
          published_at: new Date(article.created_utc * 1000).toISOString(),
          summary: article.selftext || article.title,
          author: article.author,
          category: 'startup'
        }, `Reddit r/${article.subreddit}`)
      );

      logger.info(`Fetched ${normalizedArticles.length} posts from Reddit`);
      return normalizedArticles;

    } catch (error) {
      logger.error('Error fetching from Reddit:', error.message);
      return [];
    }
  }

  async fetchSubreddit(subreddit) {
    try {
      const response = await axios.get(`${this.baseUrl}/r/${subreddit}/hot.json`, {
        params: {
          limit: config.sources.reddit.limit
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: config.fetching.timeoutMs
      });

      const posts = response.data.data.children.map(child => ({
        ...child.data,
        subreddit: subreddit
      }));

      // Filter out removed/deleted posts and self-promotion
      return posts.filter(post => 
        post.title && 
        !post.removed_by_category &&
        post.author !== '[deleted]' &&
        !post.is_self || post.selftext
      );

    } catch (error) {
      logger.error(`Error fetching Reddit r/${subreddit}:`, error.message);
      return [];
    }
  }

  async fetchSubredditNew(subreddit) {
    try {
      const response = await axios.get(`${this.baseUrl}/r/${subreddit}/new.json`, {
        params: {
          limit: 10
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: config.fetching.timeoutMs
      });

      return response.data.data.children.map(child => ({
        ...child.data,
        subreddit: subreddit
      }));

    } catch (error) {
      logger.error(`Error fetching Reddit new r/${subreddit}:`, error.message);
      return [];
    }
  }
}

module.exports = RedditFetcher;