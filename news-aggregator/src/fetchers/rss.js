const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const config = require('../config');
const logger = require('../utils/logger');
const { normalizeArticle, delay, isValidUrl } = require('../utils/helpers');

class RSSFetcher {
  constructor() {
    this.enabled = config.sources.rssFeeds.enabled;
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  }

  async fetchNews() {
    if (!this.enabled) {
      logger.warn('RSS fetcher disabled');
      return [];
    }

    try {
      logger.info('Fetching news from RSS feeds...');
      const articles = [];

      // Fetch from each RSS feed
      for (const feed of config.sources.rssFeeds.feeds) {
        await delay(config.fetching.requestDelayMs);
        
        const feedArticles = await this.fetchRSSFeed(feed);
        articles.push(...feedArticles);
      }

      logger.info(`Fetched ${articles.length} articles from RSS feeds`);
      return articles;

    } catch (error) {
      logger.error('Error fetching from RSS feeds:', error.message);
      return [];
    }
  }

  async fetchRSSFeed(feed) {
    try {
      logger.debug(`Fetching RSS feed: ${feed.name}`);
      
      const response = await axios.get(feed.url, {
        headers: {
          'User-Agent': 'StartupNewsAggregator/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
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
          author: this.extractAuthor(item),
          category: feed.category
        }, feed.name)
      ).filter(article => article.url && isValidUrl(article.url));

      logger.debug(`Fetched ${normalizedArticles.length} articles from ${feed.name}`);
      return normalizedArticles;

    } catch (error) {
      logger.error(`Error fetching RSS feed ${feed.name}:`, error.message);
      return [];
    }
  }

  extractItems(parsed) {
    // Handle different RSS/Atom formats
    if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
      return Array.isArray(parsed.rss.channel.item) 
        ? parsed.rss.channel.item 
        : [parsed.rss.channel.item];
    }
    
    if (parsed.feed && parsed.feed.entry) {
      return Array.isArray(parsed.feed.entry) 
        ? parsed.feed.entry 
        : [parsed.feed.entry];
    }

    if (parsed.channel && parsed.channel.item) {
      return Array.isArray(parsed.channel.item) 
        ? parsed.channel.item 
        : [parsed.channel.item];
    }

    return [];
  }

  extractTitle(item) {
    return item.title || item['title'] || '';
  }

  extractLink(item) {
    if (item.link) {
      return typeof item.link === 'string' ? item.link : item.link['@_href'] || item.link.href;
    }
    if (item.guid && typeof item.guid === 'string' && item.guid.startsWith('http')) {
      return item.guid;
    }
    return '';
  }

  extractDate(item) {
    return item.pubDate || item.published || item.date || item['dc:date'] || new Date().toISOString();
  }

  extractDescription(item) {
    return item.description || item.summary || item.content || item['content:encoded'] || '';
  }

  extractAuthor(item) {
    return item.author || item['dc:creator'] || item.creator || null;
  }
}

module.exports = RSSFetcher;