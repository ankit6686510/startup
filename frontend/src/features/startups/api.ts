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

class StartupsAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
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
      `/api/startups?${params.toString()}`
    );
    return response.data;
  }

  // Get startup by ID
  async getStartupById(id: string): Promise<StartupDetail> {
    const response = await this.api.get<StartupDetail>(`/api/startups/${id}`);
    return response.data;
  }

  // Search startups (quick search)
  async searchStartups(query: string, limit: number = 10): Promise<StartupSearchResult[]> {
    const response = await this.api.get<StartupSearchResult[]>(`/api/startups/search`, {
      params: { q: query, limit },
    });
    return response.data;
  }

  // Get trending startups
  async getTrendingStartups(limit: number = 10, timeframe: 'week' | 'month' | 'all' = 'week'): Promise<TrendingStartup[]> {
    const response = await this.api.get<TrendingStartup[]>(`/api/startups/trending`, {
      params: { limit, timeframe },
    });
    return response.data;
  }

  // Get startups by industry
  async getStartupsByIndustry(industry: string, limit: number = 20): Promise<Startup[]> {
    const response = await this.api.get<Startup[]>(`/api/startups/industry/${industry}`, {
      params: { limit },
    });
    return response.data;
  }

  // Get industry statistics
  async getIndustryStats(): Promise<IndustryStats[]> {
    const response = await this.api.get<IndustryStats[]>(`/api/startups/stats/industries`);
    return response.data;
  }

  // Compare startups
  async compareStartups(startupIds: string[]): Promise<StartupComparison> {
    const response = await this.api.post<StartupComparison>(`/api/startups/compare`, {
      startupIds,
    });
    return response.data;
  }

  // Get startup jobs
  async getStartupJobs(startupId: string): Promise<StartupJob[]> {
    const response = await this.api.get<StartupJob[]>(`/api/startups/${startupId}/jobs`);
    return response.data;
  }

  // Get startup news
  async getStartupNews(startupId: string, limit: number = 10): Promise<StartupNews[]> {
    const response = await this.api.get<StartupNews[]>(`/api/startups/${startupId}/news`, {
      params: { limit },
    });
    return response.data;
  }

  // Get related startups
  async getRelatedStartups(startupId: string, limit: number = 6): Promise<Startup[]> {
    const response = await this.api.get<Startup[]>(`/api/startups/${startupId}/related`, {
      params: { limit },
    });
    return response.data;
  }

  // Follow/unfollow startup
  async toggleFollowStartup(startupId: string, follow: boolean): Promise<{ following: boolean }> {
    const response = await this.api.post(`/api/startups/${startupId}/follow`, { follow });
    return response.data;
  }

  // Save/unsave startup
  async toggleSaveStartup(startupId: string, save: boolean): Promise<{ saved: boolean }> {
    const response = await this.api.post(`/api/startups/${startupId}/save`, { save });
    return response.data;
  }

  // Get user's saved startups
  async getSavedStartups(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Startup>> {
    const response = await this.api.get<PaginatedResponse<Startup>>(`/api/startups/saved`, {
      params: { page, pageSize },
    });
    return response.data;
  }

  // Get suggested startups (for you)
  async getSuggestedStartups(limit: number = 10): Promise<Startup[]> {
    const response = await this.api.get<Startup[]>(`/api/startups/suggested`, {
      params: { limit },
    });
    return response.data;
  }
}

export const startupsAPI = new StartupsAPI();
