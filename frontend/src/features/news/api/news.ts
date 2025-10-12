import { ApiResponse, PaginatedResponse, ApiError } from '@/lib/api';

// Types
export interface NewsFilters {
  q?: string; // Search query
  category?: 'all' | 'funding' | 'acquisition' | 'product' | 'partnership' | 'team' | 'industry' | 'regulatory';
  industry?: string;
  company?: string;
  source?: string;
  author?: string;
  location?: string;
  dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  trending?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'all';
  readTime?: 'short' | 'medium' | 'long' | 'all'; // <5min, 5-15min, >15min
  hasVideo?: boolean;
  hasImage?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'popularity' | 'engagement';
  sortOrder?: 'asc' | 'desc';
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  summary: string;
  
  // Media
  featuredImage?: string;
  images: string[];
  videos?: Array<{
    url: string;
    thumbnail: string;
    duration?: number;
    title?: string;
  }>;
  
  // Publication Info
  source: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    verified: boolean;
  };
  author: {
    id?: string;
    name: string;
    avatar?: string;
    bio?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Categorization
  category: 'funding' | 'acquisition' | 'product' | 'partnership' | 'team' | 'industry' | 'regulatory';
  subCategory?: string;
  industry: string;
  tags: string[];
  
  // Related Entities
  relatedCompanies: Array<{
    id: string;
    name: string;
    slug: string;
    logo?: string;
    role: 'primary' | 'secondary' | 'mentioned';
  }>;
  relatedPeople: Array<{
    id: string;
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
    role: 'primary' | 'secondary' | 'mentioned';
  }>;
  
  // Metrics
  views: number;
  shares: number;
  likes: number;
  comments: number;
  readTime: number; // in minutes
  engagementScore: number;
  
  // Analysis
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number; // sentiment confidence 0-1
  keyPoints: string[];
  implications: string[];
  
  // Status & Features
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  trending: boolean;
  breaking: boolean;
  exclusive: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  
  // Timestamps
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  
  // External Links
  originalUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface NewsDetail extends Omit<NewsArticle, 'comments'> {
  // Extended content
  fullContent: string;
  
  // Related Articles
  relatedArticles: NewsArticle[];
  
  // Comments (detailed)
  comments: Array<{
    id: string;
    author: {
      name: string;
      avatar?: string;
      verified: boolean;
    };
    content: string;
    likes: number;
    replies: number;
    createdAt: string;
  }>;
  
  // Analytics
  analytics: {
    viewsByDay: Record<string, number>;
    sharesByPlatform: Record<string, number>;
    readerDemographics: {
      roles: Record<string, number>;
      industries: Record<string, number>;
      locations: Record<string, number>;
    };
    averageReadTime: number;
    completionRate: number;
  };
  
  // Content Analysis
  contentAnalysis: {
    wordCount: number;
    readingLevel: string;
    mainTopics: Array<{
      topic: string;
      relevance: number;
    }>;
    entities: Array<{
      name: string;
      type: 'person' | 'company' | 'location' | 'technology';
      confidence: number;
    }>;
  };
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  categories: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  industries: string[];
  companies: string[];
  active: boolean;
  createdAt: string;
  lastSent?: string;
}

export interface NewsStats {
  totalArticles: number;
  publishedToday: number;
  publishedThisWeek: number;
  averageReadTime: number;
  totalViews: number;
  totalShares: number;
  
  // Category Distribution
  byCategory: Record<string, number>;
  byIndustry: Record<string, number>;
  bySource: Record<string, number>;
  bySentiment: Record<string, number>;
  
  // Trending
  trendingTopics: Array<{
    topic: string;
    articles: number;
    growth: string;
  }>;
  
  // Engagement
  topArticles: Array<{
    id: string;
    title: string;
    views: number;
    engagement: number;
  }>;
  
  // Analytics
  readerMetrics: {
    totalReaders: number;
    activeReaders: number;
    averageSessionTime: string;
    bounceRate: string;
  };
}

export interface PressRelease {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary: string;
  
  // Company Info
  company: {
    id: string;
    name: string;
    logo: string;
    website: string;
  };
  
  // Contact
  contact: {
    name: string;
    email: string;
    phone?: string;
    title: string;
  };
  
  // Media
  mediaKit?: {
    logos: string[];
    images: string[];
    videos?: string[];
    factSheet?: string;
  };
  
  // Distribution
  category: string;
  tags: string[];
  targetAudience: string[];
  embargo?: string;
  
  // Status
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Metrics
  views: number;
  downloads: number;
  mediaPickups: Array<{
    source: string;
    url: string;
    publishedAt: string;
  }>;
}

// API Service Class
export class NewsApi {
  private baseUrl = '/api/news';

  // Get paginated list of news articles
  async getNews(filters: NewsFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch news: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching news', 500);
    }
  }

  // Get news article by ID or slug
  async getArticle(identifier: string): Promise<ApiResponse<NewsDetail>> {
    try {
      const response = await fetch(`${this.baseUrl}/${identifier}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError('Article not found', 404);
        }
        throw new ApiError(`Failed to fetch article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching article', 500);
    }
  }

  // Get featured news
  async getFeaturedNews(): Promise<ApiResponse<NewsArticle[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/featured`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch featured news: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching featured news', 500);
    }
  }

  // Get trending news
  async getTrendingNews(): Promise<ApiResponse<NewsArticle[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch trending news: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching trending news', 500);
    }
  }

  // Get breaking news
  async getBreakingNews(): Promise<ApiResponse<NewsArticle[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/breaking`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch breaking news: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching breaking news', 500);
    }
  }

  // Get news by category
  async getNewsByCategory(category: NewsFilters['category'], filters: NewsFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
    const categoryFilters = { ...filters, category };
    return this.getNews(categoryFilters);
  }

  // Get news by company
  async getNewsByCompany(companyId: string, filters: NewsFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
    const companyFilters = { ...filters, company: companyId };
    return this.getNews(companyFilters);
  }

  // Get news by industry
  async getNewsByIndustry(industry: string, filters: NewsFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
    const industryFilters = { ...filters, industry };
    return this.getNews(industryFilters);
  }

  // Search news
  async searchNews(query: string, filters: NewsFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
    const searchFilters = { ...filters, q: query };
    return this.getNews(searchFilters);
  }

  // Get news statistics
  async getNewsStats(): Promise<ApiResponse<NewsStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch news stats: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching news statistics', 500);
    }
  }

  // Get related articles
  async getRelatedArticles(articleId: string): Promise<ApiResponse<NewsArticle[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/related`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch related articles: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching related articles', 500);
    }
  }

  // Like/Unlike article
  async likeArticle(articleId: string): Promise<ApiResponse<{ liked: boolean; likes: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to like article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while liking article', 500);
    }
  }

  async unlikeArticle(articleId: string): Promise<ApiResponse<{ liked: boolean; likes: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to unlike article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while unliking article', 500);
    }
  }

  // Share article
  async shareArticle(articleId: string, platform: 'twitter' | 'linkedin' | 'facebook' | 'email'): Promise<ApiResponse<{ shared: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to share article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while sharing article', 500);
    }
  }

  // Bookmark/Save article
  async bookmarkArticle(articleId: string): Promise<ApiResponse<{ bookmarked: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to bookmark article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while bookmarking article', 500);
    }
  }

  async unbookmarkArticle(articleId: string): Promise<ApiResponse<{ bookmarked: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/bookmark`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to unbookmark article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while unbookmarking article', 500);
    }
  }

  // Get bookmarked articles
  async getBookmarkedArticles(): Promise<PaginatedResponse<NewsArticle>> {
    try {
      const response = await fetch(`${this.baseUrl}/bookmarks`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch bookmarked articles: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching bookmarked articles', 500);
    }
  }

  // Newsletter subscription
  async subscribeToNewsletter(subscriptionData: {
    email: string;
    categories?: string[];
    frequency?: 'daily' | 'weekly' | 'monthly';
    industries?: string[];
    companies?: string[];
  }): Promise<ApiResponse<{ subscriptionId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to subscribe to newsletter: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while subscribing to newsletter', 500);
    }
  }

  async unsubscribeFromNewsletter(subscriptionId: string): Promise<ApiResponse<{ unsubscribed: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/newsletter/${subscriptionId}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to unsubscribe from newsletter: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while unsubscribing from newsletter', 500);
    }
  }

  // Press releases
  async getPressReleases(filters: {
    company?: string;
    category?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<PressRelease>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/press-releases?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch press releases: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching press releases', 500);
    }
  }

  async getPressRelease(id: string): Promise<ApiResponse<PressRelease>> {
    try {
      const response = await fetch(`${this.baseUrl}/press-releases/${id}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch press release: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching press release', 500);
    }
  }

  // Submit press release
  async submitPressRelease(pressReleaseData: Omit<PressRelease, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'downloads' | 'mediaPickups'>): Promise<ApiResponse<{ pressReleaseId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/press-releases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pressReleaseData),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to submit press release: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while submitting press release', 500);
    }
  }

  // Get available filter options
  async getFilterOptions(): Promise<ApiResponse<{
    categories: string[];
    industries: string[];
    sources: Array<{ id: string; name: string; logo?: string }>;
    authors: Array<{ id: string; name: string; avatar?: string }>;
    tags: string[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/filters`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch filter options: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching filter options', 500);
    }
  }

  // Report article
  async reportArticle(articleId: string, reason: string, description?: string): Promise<ApiResponse<{ reported: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, description }),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to report article: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while reporting article', 500);
    }
  }

  // Track article view
  async trackArticleView(articleId: string): Promise<ApiResponse<{ tracked: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${articleId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to track article view: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while tracking article view', 500);
    }
  }

  // Get reading history
  async getReadingHistory(): Promise<PaginatedResponse<{
    article: NewsArticle;
    readAt: string;
    readTime: number;
    completed: boolean;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/history`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch reading history: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching reading history', 500);
    }
  }

  // Get personalized recommendations
  async getRecommendations(): Promise<ApiResponse<NewsArticle[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch recommendations: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching recommendations', 500);
    }
  }
}

// Export singleton instance
export const newsApi = new NewsApi();

// Export default
export default newsApi;
