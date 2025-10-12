const crypto = require('crypto');

/**
 * Normalize article data to consistent format
 */
function normalizeArticle(article, source) {
  return {
    id: generateArticleId(article.title, article.url),
    title: cleanTitle(article.title),
    source: source,
    url: article.url,
    published_at: normalizeDate(article.published_at || article.publishedAt || article.pubDate),
    summary: cleanSummary(article.summary || article.description || article.content),
    category: article.category || 'general',
    author: article.author || null,
    image_url: article.image_url || article.urlToImage || null,
    keywords: extractKeywords(article.title + ' ' + (article.summary || '')),
    fetched_at: new Date().toISOString()
  };
}

/**
 * Generate unique ID for article
 */
function generateArticleId(title, url) {
  const content = (title + url).toLowerCase().replace(/[^a-z0-9]/g, '');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Clean and truncate title
 */
function cleanTitle(title) {
  if (!title) return '';
  
  return title
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?()]/g, '')
    .trim()
    .substring(0, 200);
}

/**
 * Clean and truncate summary
 */
function cleanSummary(summary) {
  if (!summary) return '';
  
  return summary
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}

/**
 * Normalize date to ISO string
 */
function normalizeDate(dateString) {
  if (!dateString) return new Date().toISOString();
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * Extract relevant keywords from text
 */
function extractKeywords(text) {
  if (!text) return [];
  
  const keywords = [
    'startup', 'funding', 'series a', 'series b', 'series c',
    'seed round', 'venture capital', 'vc', 'angel investor',
    'fintech', 'saas', 'ai', 'machine learning', 'blockchain',
    'cryptocurrency', 'ipo', 'acquisition', 'merger',
    'unicorn', 'decacorn', 'valuation', 'investment'
  ];
  
  const textLower = text.toLowerCase();
  return keywords.filter(keyword => textLower.includes(keyword));
}

/**
 * Remove duplicate articles based on title similarity and URL
 */
function removeDuplicates(articles) {
  const seen = new Set();
  const unique = [];
  
  for (const article of articles) {
    const key = generateArticleId(article.title, article.url);
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(article);
    }
  }
  
  return unique;
}

/**
 * Filter articles by relevance to startup/tech topics
 */
function filterRelevantArticles(articles) {
  const relevantKeywords = [
    'startup', 'funding', 'series', 'seed', 'venture',
    'entrepreneur', 'fintech', 'saas', 'ai', 'tech',
    'investment', 'ipo', 'acquisition', 'unicorn'
  ];
  
  return articles.filter(article => {
    const text = (article.title + ' ' + article.summary).toLowerCase();
    return relevantKeywords.some(keyword => text.includes(keyword));
  });
}

/**
 * Sort articles by published date (newest first)
 */
function sortByDate(articles) {
  return articles.sort((a, b) => {
    const dateA = new Date(a.published_at);
    const dateB = new Date(b.published_at);
    return dateB - dateA;
  });
}

/**
 * Add delay between requests to respect rate limits
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Truncate array to max length
 */
function limitArray(array, maxLength) {
  return array.slice(0, maxLength);
}

/**
 * Calculate relevance score for article
 */
function calculateRelevanceScore(article) {
  let score = 0;
  const text = (article.title + ' ' + article.summary).toLowerCase();
  
  // High value keywords
  const highValueKeywords = ['series a', 'series b', 'funding', 'startup', 'venture capital'];
  highValueKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  // Medium value keywords
  const mediumValueKeywords = ['investment', 'entrepreneur', 'fintech', 'saas', 'ai'];
  mediumValueKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  
  // Low value keywords
  const lowValueKeywords = ['tech', 'business', 'company', 'innovation'];
  lowValueKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 1;
  });
  
  // Recency bonus (newer articles get higher score)
  const hoursOld = (Date.now() - new Date(article.published_at)) / (1000 * 60 * 60);
  if (hoursOld < 24) score += 2;
  else if (hoursOld < 72) score += 1;
  
  return score;
}

module.exports = {
  normalizeArticle,
  generateArticleId,
  cleanTitle,
  cleanSummary,
  normalizeDate,
  extractKeywords,
  removeDuplicates,
  filterRelevantArticles,
  sortByDate,
  delay,
  isValidUrl,
  limitArray,
  calculateRelevanceScore
};