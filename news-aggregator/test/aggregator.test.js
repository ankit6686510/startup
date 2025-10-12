const NewsAggregator = require('../src/aggregator');
const { normalizeArticle, removeDuplicates, filterRelevantArticles } = require('../src/utils/helpers');

describe('NewsAggregator', () => {
  let aggregator;

  beforeEach(() => {
    aggregator = new NewsAggregator();
  });

  describe('Article Processing', () => {
    test('should normalize article correctly', () => {
      const rawArticle = {
        title: 'Test Startup Raises $10M',
        url: 'https://example.com/article',
        published_at: '2024-01-15T10:00:00Z',
        summary: 'A test startup has raised funding',
        author: 'John Doe'
      };

      const normalized = normalizeArticle(rawArticle, 'TestSource');

      expect(normalized).toHaveProperty('id');
      expect(normalized.title).toBe('Test Startup Raises $10M');
      expect(normalized.source).toBe('TestSource');
      expect(normalized.url).toBe('https://example.com/article');
      expect(normalized.keywords).toContain('startup');
    });

    test('should remove duplicate articles', () => {
      const articles = [
        {
          title: 'Same Article',
          url: 'https://example.com/1',
          published_at: '2024-01-15T10:00:00Z'
        },
        {
          title: 'Same Article',
          url: 'https://example.com/1',
          published_at: '2024-01-15T10:00:00Z'
        },
        {
          title: 'Different Article',
          url: 'https://example.com/2',
          published_at: '2024-01-15T10:00:00Z'
        }
      ];

      const normalized = articles.map(article => normalizeArticle(article, 'TestSource'));
      const unique = removeDuplicates(normalized);

      expect(unique).toHaveLength(2);
    });

    test('should filter relevant articles', () => {
      const articles = [
        {
          title: 'Startup raises funding',
          summary: 'A tech startup got investment',
          keywords: ['startup', 'funding']
        },
        {
          title: 'Weather update',
          summary: 'It will rain tomorrow',
          keywords: []
        },
        {
          title: 'AI company launches',
          summary: 'New AI venture capital backed company',
          keywords: ['ai', 'venture']
        }
      ];

      const relevant = filterRelevantArticles(articles);
      expect(relevant).toHaveLength(2);
      expect(relevant[0].title).toContain('Startup');
      expect(relevant[1].title).toContain('AI');
    });
  });

  describe('Metadata Generation', () => {
    test('should generate correct metadata', () => {
      const articles = [
        { source: 'TechCrunch', category: 'technology', published_at: '2024-01-15T10:00:00Z' },
        { source: 'TechCrunch', category: 'startup', published_at: '2024-01-15T09:00:00Z' },
        { source: 'Reddit', category: 'startup', published_at: '2024-01-15T08:00:00Z' }
      ];

      const metadata = aggregator.generateMetadata(articles, Date.now() - 1000);

      expect(metadata.total_articles).toBe(3);
      expect(metadata.sources_count).toBe(2);
      expect(metadata.sources).toContain('TechCrunch');
      expect(metadata.sources).toContain('Reddit');
      expect(metadata.source_distribution.TechCrunch).toBe(2);
      expect(metadata.source_distribution.Reddit).toBe(1);
      expect(metadata.processing_time_ms).toBeGreaterThan(0);
    });
  });
});

describe('Helper Functions', () => {
  describe('normalizeArticle', () => {
    test('should handle missing fields gracefully', () => {
      const article = { title: 'Test' };
      const normalized = normalizeArticle(article, 'TestSource');

      expect(normalized.title).toBe('Test');
      expect(normalized.url).toBe('');
      expect(normalized.summary).toBe('');
      expect(normalized.source).toBe('TestSource');
    });

    test('should clean HTML from summary', () => {
      const article = {
        title: 'Test',
        summary: '<p>This is <strong>HTML</strong> content</p>'
      };
      const normalized = normalizeArticle(article, 'TestSource');

      expect(normalized.summary).toBe('This is HTML content');
    });
  });
});