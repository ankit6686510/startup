require('dotenv').config();

module.exports = {
  // API Keys (optional)
  apiKeys: {
    newsapi: process.env.NEWSAPI_KEY || null,
    mediastack: process.env.MEDIASTACK_KEY || null,
    guardian: process.env.GUARDIAN_API_KEY || null
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Fetching configuration
  fetching: {
    intervalMinutes: parseInt(process.env.FETCH_INTERVAL_MINUTES) || 30,
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60,
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS) || 1000,
    maxArticlesPerSource: parseInt(process.env.MAX_ARTICLES_PER_SOURCE) || 50,
    timeoutMs: 10000
  },

  // Output configuration
  output: {
    file: process.env.OUTPUT_FILE || './data/aggregated_news.json',
    format: 'json'
  },

  // Keywords for filtering
  keywords: [
    'startup', 'funding', 'series a', 'series b', 'series c',
    'seed round', 'venture capital', 'entrepreneurship', 'fintech',
    'saas', 'ai startup', 'tech startup', 'unicorn', 'ipo',
    'acquisition', 'merger', 'investment', 'angel investor',
    'accelerator', 'incubator', 'y combinator', 'techstars'
  ],

  // Sources configuration
  sources: {
    newsapi: {
      enabled: true,
      baseUrl: 'https://newsapi.org/v2',
      categories: ['business', 'technology'],
      keywords: ['startup', 'funding', 'series a', 'entrepreneurship'],
      language: 'en',
      sortBy: 'publishedAt'
    },

    mediastack: {
      enabled: true,
      baseUrl: 'http://api.mediastack.com/v1',
      categories: ['business', 'technology'],
      keywords: ['startup', 'investment', 'seed round'],
      languages: 'en'
    },

    guardian: {
      enabled: true,
      baseUrl: 'https://content.guardianapis.com',
      sections: ['technology', 'business'],
      keywords: ['startup', 'funding', 'venture capital']
    },

    hackernews: {
      enabled: true,
      baseUrl: 'https://hacker-news.firebaseio.com/v0',
      endpoints: ['topstories', 'newstories'],
      maxItems: 100
    },

    reddit: {
      enabled: true,
      baseUrl: 'https://www.reddit.com',
      subreddits: [
        'startups',
        'Entrepreneur', 
        'startup',
        'startup_business',
        'startup_jobs',
        'SideProject',
        'StartupsIndia'
      ],
      limit: 25
    },

    rssFeeds: {
      enabled: true,
      feeds: [
        {
          name: 'TechCrunch',
          url: 'https://techcrunch.com/feed/',
          category: 'technology'
        },
        {
          name: 'Inc42',
          url: 'https://inc42.com/feed',
          category: 'startup'
        },
        {
          name: 'VentureBeat',
          url: 'https://venturebeat.com/feed/',
          category: 'technology'
        },
        {
          name: 'TechInAsia',
          url: 'https://www.techinasia.com/rss',
          category: 'startup'
        }
      ]
    },

    googleNews: {
      enabled: true,
      baseUrl: 'https://news.google.com/rss/search',
      queries: [
        'startup funding',
        'series A',
        'seed round',
        'venture capital',
        'tech startup',
        'fintech startup',
        'ai startup'
      ]
    }
  }
};