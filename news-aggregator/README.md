# Startup News Aggregator

A comprehensive news aggregation service that fetches startup, funding, and tech-related news from multiple free APIs and RSS feeds. Designed for the StartupFlow platform to provide real-time startup intelligence.

## 🚀 Features

- **Multiple Sources**: Aggregates from 7+ different news sources
- **Free APIs**: Works with free tiers and public RSS feeds
- **Smart Filtering**: AI-powered relevance scoring and deduplication
- **Real-time Updates**: Scheduled fetching with configurable intervals
- **REST API**: Full HTTP API for integration
- **CLI Interface**: Command-line tools for manual operations
- **Unified Format**: Consistent JSON output across all sources

## 📊 Data Sources

### API Sources (Optional Keys)
- **NewsAPI.org** - Business and technology news
- **Mediastack** - Real-time news with keyword filtering
- **The Guardian** - Open platform with tech/business sections

### Free Sources (No Keys Required)
- **Hacker News** - Y Combinator's tech community
- **Reddit** - Startup and entrepreneur subreddits
- **RSS Feeds** - TechCrunch, Inc42, VentureBeat, TechInAsia
- **Google News** - Keyword-based RSS searches

## 🛠 Installation

```bash
# Clone the repository
git clone <repository-url>
cd news-aggregator

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your API keys (optional)
nano .env
```

## ⚙️ Configuration

### Environment Variables

```bash
# API Keys (Optional - improves data quality)
NEWSAPI_KEY=your_newsapi_key_here
MEDIASTACK_KEY=your_mediastack_key_here
GUARDIAN_API_KEY=your_guardian_key_here

# Server Configuration
PORT=3000
LOG_LEVEL=info
FETCH_INTERVAL_MINUTES=30

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
REQUEST_DELAY_MS=1000

# Output Configuration
OUTPUT_FILE=./data/aggregated_news.json
MAX_ARTICLES_PER_SOURCE=50
```

### Getting API Keys (Optional)

1. **NewsAPI**: Register at [newsapi.org](https://newsapi.org) - Free tier: 100 requests/day
2. **Mediastack**: Register at [mediastack.com](https://mediastack.com) - Free tier: 500 requests/month
3. **Guardian**: Register at [open-platform.theguardian.com](https://open-platform.theguardian.com)

**Note**: The aggregator works without API keys using free sources (Hacker News, Reddit, RSS feeds, Google News).

## 🚀 Usage

### Command Line Interface

```bash
# One-time fetch
npm start fetch

# Start API server
npm start server

# View statistics
npm start stats

# Show help
npm start help
```

### API Server

Start the server:
```bash
npm start server
```

The API will be available at `http://localhost:3000`

### API Endpoints

#### Get Latest News
```bash
GET /api/news
GET /api/news?limit=20&source=TechCrunch&category=startup
```

Response:
```json
{
  "success": true,
  "metadata": {
    "generated_at": "2024-01-15T10:30:00Z",
    "total_articles": 150,
    "sources_count": 7,
    "processing_time_ms": 5420
  },
  "total": 150,
  "articles": [
    {
      "id": "abc123",
      "title": "AI Startup Raises $50M Series A",
      "source": "TechCrunch",
      "url": "https://techcrunch.com/...",
      "published_at": "2024-01-15T09:00:00Z",
      "summary": "An AI startup focused on...",
      "category": "technology",
      "author": "John Doe",
      "keywords": ["startup", "funding", "ai"],
      "relevance_score": 8,
      "fetched_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Search News
```bash
GET /api/search?q=funding&limit=10
```

#### Get Statistics
```bash
GET /api/stats
```

#### Trigger Manual Fetch
```bash
POST /api/fetch
```

#### Get Available Sources
```bash
GET /api/sources
```

#### Health Check
```bash
GET /health
```

## 📁 Output Format

### Unified Article Schema

```json
{
  "id": "unique_hash",
  "title": "Article Title",
  "source": "Source Name",
  "url": "https://article-url.com",
  "published_at": "2024-01-15T10:00:00Z",
  "summary": "Article summary or description",
  "category": "technology|startup|business",
  "author": "Author Name",
  "image_url": "https://image-url.com",
  "keywords": ["startup", "funding"],
  "relevance_score": 8,
  "fetched_at": "2024-01-15T10:30:00Z"
}
```

### Output Files

- `./data/aggregated_news.json` - Complete output with metadata
- `./data/aggregated_news_articles_only.json` - Articles array only
- `./data/aggregated_news_metadata.json` - Metadata only

## 🔧 Advanced Configuration

### Custom Keywords

Edit `src/config/index.js` to modify filtering keywords:

```javascript
keywords: [
  'startup', 'funding', 'series a', 'venture capital',
  'fintech', 'saas', 'ai startup', 'unicorn'
]
```

### Adding RSS Feeds

```javascript
rssFeeds: {
  feeds: [
    {
      name: 'YourSource',
      url: 'https://yoursource.com/feed',
      category: 'startup'
    }
  ]
}
```

### Rate Limiting

Adjust request delays and limits in config:

```javascript
fetching: {
  requestDelayMs: 1000,  // 1 second between requests
  maxRequestsPerMinute: 60,
  timeoutMs: 10000
}
```

## 📊 Monitoring & Logging

### Log Files

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Statistics

View aggregation statistics:

```bash
npm start stats
```

Example output:
```
=== NEWS AGGREGATION STATS ===
Generated: 2024-01-15T10:30:00Z
Total articles: 150
Sources: 7
Processing time: 5420ms
Average relevance: 6.8

Source distribution:
  TechCrunch: 25 articles
  Hacker News: 30 articles
  Reddit: 20 articles
  ...

Top keywords:
  startup: 45 mentions
  funding: 32 mentions
  ai: 28 mentions
```

## 🔄 Scheduled Fetching

The server automatically fetches news every 30 minutes (configurable). To change the interval:

```bash
FETCH_INTERVAL_MINUTES=60  # Fetch every hour
```

## 🐛 Troubleshooting

### Common Issues

1. **No articles fetched**
   - Check internet connection
   - Verify API keys (if using paid sources)
   - Check logs for specific errors

2. **Rate limiting errors**
   - Increase `REQUEST_DELAY_MS` in config
   - Reduce `MAX_REQUESTS_PER_MINUTE`

3. **Memory issues**
   - Reduce `MAX_ARTICLES_PER_SOURCE`
   - Increase Node.js memory: `node --max-old-space-size=4096`

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start server
```

## 🚀 Integration with StartupFlow

This aggregator is designed to integrate with the StartupFlow platform:

```javascript
// Example integration
const NewsAggregator = require('./src/aggregator');

const aggregator = new NewsAggregator();
const news = await aggregator.aggregateNews();

// Process articles for StartupFlow database
news.articles.forEach(article => {
  // Extract company mentions, funding info, etc.
  processForStartupFlow(article);
});
```

## 📈 Performance

- **Typical fetch time**: 5-15 seconds
- **Memory usage**: ~100MB
- **Articles per run**: 100-300 (depending on sources)
- **Deduplication rate**: ~20-30%
- **Relevance filtering**: ~40-60% of articles retained

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new sources
4. Submit a pull request

### Adding New Sources

1. Create fetcher in `src/fetchers/`
2. Add configuration in `src/config/index.js`
3. Import in `src/aggregator.js`
4. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Projects

- [StartupFlow Platform](../README.md) - Main startup intelligence platform
- [Data Pipeline](../backend/README.md) - Backend data processing
- [Frontend Application](../frontend/README.md) - User interface

---

**Built for StartupFlow** - The only platform that combines startup intelligence with job opportunities.