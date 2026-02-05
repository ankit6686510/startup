import axios, { AxiosInstance } from 'axios';
import {
  Startup,
  StartupDetail,
  StartupFilters,
  PaginatedResponse,
  StartupComparison,
  TrendingStartup,
  IndustryStats,
  StartupSearchResult,
  StartupJob,
  StartupNews,
} from './types';
import {
  PaginatedStartupResponseSchema,
  StartupDetailSchema,
  StartupSearchResultSchema,
  TrendingStartupSchema,
  StartupSchema,
  IndustryStatsSchema,
  StartupComparisonSchema,
  StartupJobSchema,
  StartupNewsSchema,
} from './schemas';
import { z } from 'zod';

class StartupsAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add token interceptor
    this.api.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all startups with pagination
  async getStartups(
    page: number = 1,
    pageSize: number = 20,
    filters?: StartupFilters
  ): Promise<PaginatedResponse<Startup>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.industries?.length) params.append('industries', filters.industries.join(','));
      if (filters.fundingStages?.length) params.append('fundingStages', filters.fundingStages.join(','));
      if (filters.minFunding !== undefined) params.append('minFunding', filters.minFunding.toString());
      if (filters.maxFunding !== undefined) params.append('maxFunding', filters.maxFunding.toString());
      if (filters.locations?.length) params.append('locations', filters.locations.join(','));
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.employeeCount?.length) params.append('employeeCount', filters.employeeCount.join(','));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    const response = await this.api.get<PaginatedResponse<Startup>>(
      `startups?${params.toString()}`
    );
    return PaginatedStartupResponseSchema.parse(response.data);
  }

  // Get startup by ID
  async getStartupById(id: string): Promise<StartupDetail> {
    const response = await this.api.get<StartupDetail>(`startups/${id}`);
    return StartupDetailSchema.parse(response.data);
  }

  // Search startups (quick search)
  async searchStartups(query: string, limit: number = 10): Promise<StartupSearchResult[]> {
    const response = await this.api.get<StartupSearchResult[]>(`startups/search`, {
      params: { q: query, limit },
    });
    return z.array(StartupSearchResultSchema).parse(response.data);
  }

  // Get trending startups
  async getTrendingStartups(limit: number = 10, timeframe: 'week' | 'month' | 'all' = 'week'): Promise<TrendingStartup[]> {
    const response = await this.api.get<TrendingStartup[]>(`startups/trending`, {
      params: { limit, timeframe },
    });
    return z.array(TrendingStartupSchema).parse(response.data);
  }

  // Get startups by industry
  async getStartupsByIndustry(industry: string, limit: number = 20): Promise<Startup[]> {
    const response = await this.api.get<Startup[]>(`/startups/industry/${industry}`, {
      params: { limit },
    });
    return z.array(StartupSchema).parse(response.data);
  }

  // Get industry statistics
  async getIndustryStats(): Promise<IndustryStats[]> {
    const response = await this.api.get<IndustryStats[]>(`startups/stats/industries`);
    return z.array(IndustryStatsSchema).parse(response.data);
  }

  // Compare startups
  async compareStartups(startupIds: string[]): Promise<StartupComparison> {
    const response = await this.api.post<StartupComparison>(`startups/compare`, {
      startupIds,
    });
    return StartupComparisonSchema.parse(response.data);
  }

  // Get startup jobs
  async getStartupJobs(startupId: string): Promise<StartupJob[]> {
    const response = await this.api.get<StartupJob[]>(`startups/${startupId}/jobs`);
    return z.array(StartupJobSchema).parse(response.data);
  }

  // Get startup news
  async getStartupNews(startupId: string, limit: number = 10): Promise<StartupNews[]> {
    const response = await this.api.get<TrendingStartup[]>(`startups/${startupId}/news`, {
      params: { limit },
    });
    return z.array(StartupNewsSchema).parse(response.data);
  }

  // Get related startups
  async getRelatedStartups(startupId: string, limit: number = 6): Promise<Startup[]> {
    const response = await this.api.get<Startup[]>(`startups/${startupId}/related`, {
      params: { limit },
    });
    return z.array(StartupSchema).parse(response.data);
  }

  // Follow/unfollow startup
  async toggleFollowStartup(startupId: string, follow: boolean): Promise<{ following: boolean }> {
    const response = await this.api.post(`startups/${startupId}/follow`, { follow });
    return response.data;
  }

  // Save/unsave startup
  async toggleSaveStartup(startupId: string, save: boolean): Promise<{ saved: boolean }> {
    const response = await this.api.post(`startups/${startupId}/save`, { save });
    return response.data;
  }

  // Get user's saved startups
  async getSavedStartups(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Startup>> {
    const response = await this.api.get<PaginatedResponse<Startup>>(`startups/saved`, {
      params: { page, pageSize },
    });
    return PaginatedStartupResponseSchema.parse(response.data);
  }

  // Get suggested startups (for you)
  async getSuggestedStartups(limit: number = 10): Promise<Startup[]> {
    const response = await this.api.get<Startup[]>(`startups/suggested`, {
      params: { limit },
    });
    return z.array(StartupSchema).parse(response.data);
  }
}

export const startupsAPI = new StartupsAPI();
