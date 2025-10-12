import { ApiResponse, PaginatedResponse, ApiError } from '@/lib/api';

// Types
export interface StartupFilters {
  industry?: string;
  stage?: string;
  location?: string;
  fundingMin?: number;
  fundingMax?: number;
  teamSizeMin?: number;
  teamSizeMax?: number;
  status?: 'active' | 'acquired' | 'closed';
  verification?: boolean;
  trending?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'founded' | 'funding' | 'employees' | 'trending';
  sortOrder?: 'asc' | 'desc';
}

export interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  logo: string;
  coverImage?: string;
  website: string;
  industry: string;
  subIndustry?: string;
  
  // Company Details
  founded: number;
  status: 'active' | 'acquired' | 'closed';
  employees: string;
  headquarters: string;
  locations: string[];
  
  // Funding Information
  totalFunding: string;
  lastFundingAmount?: string;
  lastFundingDate?: string;
  fundingStage: string;
  investorCount: number;
  
  // Metrics
  valuation?: string;
  revenue?: string;
  growth: {
    monthly: string;
    yearly: string;
  };
  
  // Features
  verified: boolean;
  trending: boolean;
  featured: boolean;
  
  // Social & Contact
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    crunchbase?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface StartupDetail extends Startup {
  // Extended information
  founders: Array<{
    id: string;
    name: string;
    title: string;
    avatar: string;
    linkedinUrl?: string;
  }>;
  
  investors: Array<{
    id: string;
    name: string;
    type: 'individual' | 'vc' | 'corporate' | 'government';
    logo?: string;
    amount?: string;
    round?: string;
    date?: string;
  }>;
  
  fundingHistory: Array<{
    id: string;
    round: string;
    amount: string;
    date: string;
    leadInvestor?: string;
    participants: string[];
    valuation?: string;
  }>;
  
  competitors: Array<{
    id: string;
    name: string;
    logo: string;
    industry: string;
    funding?: string;
  }>;
  
  news: Array<{
    id: string;
    title: string;
    summary: string;
    date: string;
    source: string;
    category: 'funding' | 'product' | 'team' | 'partnership' | 'acquisition';
    url?: string;
  }>;
  
  jobs: Array<{
    id: string;
    title: string;
    department: string;
    location: string;
    workType: 'remote' | 'hybrid' | 'onsite';
    experience: string;
    postedDate: string;
  }>;
  
  metrics: {
    monthlyVisitors?: number;
    appDownloads?: number;
    userBase?: string;
    countries?: number;
  };
  
  technology: {
    techStack?: string[];
    platforms?: string[];
    integrations?: string[];
  };
}

export interface StartupStats {
  totalStartups: number;
  activeStartups: number;
  totalFunding: string;
  averageFunding: string;
  unicorns: number;
  exits: number;
  byIndustry: Record<string, number>;
  byStage: Record<string, number>;
  byLocation: Record<string, number>;
  growthMetrics: {
    monthlyGrowth: string;
    yearlyGrowth: string;
    newStartups: number;
  };
}

// API Service Class
export class StartupsApi {
  private baseUrl = '/api/startups';

  // Get paginated list of startups
  async getStartups(filters: StartupFilters = {}): Promise<PaginatedResponse<Startup>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch startups: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching startups', 500);
    }
  }

  // Get startup by ID or slug
  async getStartup(identifier: string): Promise<ApiResponse<StartupDetail>> {
    try {
      const response = await fetch(`${this.baseUrl}/${identifier}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError('Startup not found', 404);
        }
        throw new ApiError(`Failed to fetch startup: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching startup details', 500);
    }
  }

  // Get featured startups
  async getFeaturedStartups(): Promise<ApiResponse<Startup[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/featured`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch featured startups: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching featured startups', 500);
    }
  }

  // Get trending startups
  async getTrendingStartups(): Promise<ApiResponse<Startup[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch trending startups: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching trending startups', 500);
    }
  }

  // Get startups by industry
  async getStartupsByIndustry(industry: string, filters: StartupFilters = {}): Promise<PaginatedResponse<Startup>> {
    const industryFilters = { ...filters, industry };
    return this.getStartups(industryFilters);
  }

  // Get startup statistics
  async getStartupStats(): Promise<ApiResponse<StartupStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch startup stats: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching startup statistics', 500);
    }
  }

  // Get similar startups
  async getSimilarStartups(startupId: string): Promise<ApiResponse<Startup[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${startupId}/similar`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch similar startups: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching similar startups', 500);
    }
  }

  // Get startup funding history
  async getStartupFunding(startupId: string): Promise<ApiResponse<StartupDetail['fundingHistory']>> {
    try {
      const response = await fetch(`${this.baseUrl}/${startupId}/funding`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch startup funding: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching startup funding', 500);
    }
  }

  // Get startup news
  async getStartupNews(startupId: string): Promise<ApiResponse<StartupDetail['news']>> {
    try {
      const response = await fetch(`${this.baseUrl}/${startupId}/news`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch startup news: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching startup news', 500);
    }
  }

  // Get available filter options
  async getFilterOptions(): Promise<ApiResponse<{
    industries: string[];
    stages: string[];
    locations: string[];
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
}

// Export singleton instance
export const startupsApi = new StartupsApi();

// Export default
export default startupsApi;
