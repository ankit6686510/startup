export interface DashboardStats {
  startupsFollowed: number;
  jobsSaved: number;
  fundingOpportunities: number;
  watchlistItems: number;
}

export interface Activity {
  id: string;
  type: 'startup_followed' | 'job_saved' | 'article_read' | 'funding_update';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  actionUrl?: string;
}

export interface TrendingStartup {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  industry: string;
  trendScore: number;
  followers: number;
  fundingRaised: string;
  lastFundingRound: string;
}

export interface WatchlistItem {
  id: string;
  type: 'startup' | 'job' | 'funding';
  name: string;
  description: string;
  addedAt: string;
  status?: string;
}

export interface DashboardNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  url: string;
  category: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Activity[];
  trendingStartups: TrendingStartup[];
  watchlist: WatchlistItem[];
  news: DashboardNews[];
}
