import { NewsType, DataSource } from '../common/enums';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  sourceUrl: string;
  sourceName: string;
  authorName?: string;
  publishedAt: Date;
  type: NewsType;
  startupId?: string; // If news is about a specific startup
  fundingRoundId?: string; // If news is about funding
  imageUrl?: string;
  tags: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevanceScore?: number; // 0-1 for ranking
  dataSource: DataSource;
  verified: boolean;
  views: number;
  shares: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsSource {
  id: string;
  name: string;
  website: string;
  rssUrl?: string;
  logoUrl?: string;
  description?: string;
  category: 'tech' | 'finance' | 'business' | 'startup' | 'general';
  credibilityScore: number; // 0-1
  isActive: boolean;
  lastScraped?: Date;
  totalArticles: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  category: NewsType;
  mentionCount: number;
  trendScore: number; // Calculated trend strength
  relatedStartups: string[]; // Startup IDs
  relatedArticles: string[]; // Article IDs
  keywords: string[];
  period: string; // 'daily', 'weekly', 'monthly'
  calculatedAt: Date;
}

export interface NewsAlert {
  id: string;
  userId: string;
  keywords: string[];
  categories: NewsType[];
  startupIds?: string[]; // Specific startups to monitor
  frequency: 'immediate' | 'daily' | 'weekly';
  isActive: boolean;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserNewsInteraction {
  id: string;
  userId: string;
  articleId: string;
  action: 'view' | 'like' | 'share' | 'save' | 'comment';
  duration?: number; // Reading time in seconds for 'view'
  timestamp: Date;
}

export interface NewsComment {
  id: string;
  articleId: string;
  userId: string;
  parentCommentId?: string; // For nested comments
  content: string;
  likes: number;
  dislikes: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Summary types
export interface NewsSummary {
  id: string;
  title: string;
  summary?: string;
  sourceName: string;
  publishedAt: Date;
  type: NewsType;
  imageUrl?: string;
  views: number;
  startupName?: string; // If related to specific startup
}

export interface NewsStats {
  totalArticles: number;
  todayArticles: number;
  weeklyGrowth: number;
  topSources: {
    sourceName: string;
    articleCount: number;
  }[];
  topCategories: {
    category: NewsType;
    count: number;
  }[];
  trendingTopics: string[];
  averageEngagement: {
    views: number;
    shares: number;
    likes: number;
  };
}

// Request/Response types
export interface CreateNewsArticleRequest {
  title: string;
  content: string;
  summary?: string;
  sourceUrl: string;
  sourceName: string;
  authorName?: string;
  publishedAt: Date;
  type: NewsType;
  startupId?: string;
  imageUrl?: string;
  tags: string[];
}

export interface UpdateNewsArticleRequest extends Partial<CreateNewsArticleRequest> {
  id: string;
  verified?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface NewsSearchCriteria {
  keywords?: string[];
  categories?: NewsType[];
  startupIds?: string[];
  sources?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sentiment?: 'positive' | 'neutral' | 'negative'[];
  verified?: boolean;
  sortBy?: 'relevance' | 'date' | 'popularity';
  limit?: number;
  offset?: number;
}

export interface CreateNewsAlertRequest {
  keywords: string[];
  categories: NewsType[];
  startupIds?: string[];
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface UpdateNewsAlertRequest extends Partial<CreateNewsAlertRequest> {
  id: string;
  isActive?: boolean;
}
