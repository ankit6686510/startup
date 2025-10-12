import { ApiResponse, PaginatedResponse, ApiError } from '@/lib/api';

// Types
export interface SearchFilters {
  q: string; // Search query (required)
  type?: 'all' | 'startups' | 'founders' | 'jobs' | 'news' | 'investors';
  industry?: string;
  location?: string;
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'relevance' | 'date' | 'popularity' | 'trending';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  
  // Entity-specific filters
  startupFilters?: {
    stage?: string;
    funding?: { min?: number; max?: number };
    status?: 'active' | 'acquired' | 'closed';
    verified?: boolean;
  };
  
  founderFilters?: {
    experience?: 'entry' | 'mid' | 'senior' | 'executive';
    role?: string;
    verified?: boolean;
  };
  
  jobFilters?: {
    workType?: 'remote' | 'hybrid' | 'onsite';
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
    salary?: { min?: number; max?: number };
  };
}

export interface SearchResult {
  id: string;
  type: 'startup' | 'founder' | 'job' | 'news' | 'investor';
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  imageUrl?: string;
  relevanceScore: number;
  
  // Common metadata
  createdDate?: string;
  updatedDate?: string;
  tags: string[];
  
  // Type-specific data
  metadata: {
    // For startups
    startup?: {
      industry: string;
      stage: string;
      funding: string;
      employees: string;
      headquarters: string;
      verified: boolean;
      trending: boolean;
    };
    
    // For founders
    founder?: {
      title: string;
      company: string;
      location: string;
      experience: number;
      verified: boolean;
      trending: boolean;
    };
    
    // For jobs
    job?: {
      company: string;
      companyLogo: string;
      location: string;
      workType: string;
      salary?: string;
      department: string;
      experienceLevel: string;
      featured: boolean;
      urgent: boolean;
    };
    
    // For news
    news?: {
      source: string;
      category: string;
      publishedDate: string;
      readTime?: number;
      featured: boolean;
    };
    
    // For investors
    investor?: {
      type: 'individual' | 'vc' | 'corporate' | 'government';
      portfolioSize: number;
      averageInvestment?: string;
      focusStages: string[];
      industries: string[];
    };
  };
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'startup' | 'founder' | 'job' | 'topic' | 'location' | 'industry';
  category?: string;
  count?: number;
  trending?: boolean;
}

export interface SearchStats {
  totalResults: number;
  resultsByType: Record<string, number>;
  searchTime: number;
  suggestions: SearchSuggestion[];
  relatedQueries: string[];
  popularFilters: Array<{
    name: string;
    values: Array<{ value: string; count: number }>;
  }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  alertFrequency?: 'daily' | 'weekly' | 'immediate';
  createdDate: string;
  lastRun?: string;
  resultCount: number;
}

export interface SearchAnalytics {
  popularQueries: Array<{
    query: string;
    count: number;
    growth: string;
  }>;
  trendingTopics: Array<{
    topic: string;
    mentions: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  searchVolume: {
    total: number;
    byType: Record<string, number>;
    byTime: Record<string, number>;
  };
  userBehavior: {
    averageQuery: string;
    clickThroughRate: string;
    sessionDuration: string;
  };
}

// API Service Class
export class SearchApi {
  private baseUrl = '/api/search';

  // Universal search across all entities
  async search(filters: SearchFilters): Promise<PaginatedResponse<SearchResult>> {
    try {
      const params = new URLSearchParams();
      
      // Add basic filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && !['startupFilters', 'founderFilters', 'jobFilters'].includes(key)) {
          params.append(key, value.toString());
        }
      });

      // Add nested filters
      if (filters.startupFilters) {
        Object.entries(filters.startupFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && value !== null && 'min' in value) {
              if (value.min !== undefined) params.append(`startupFilters[${key}][min]`, value.min.toString());
              if (value.max !== undefined) params.append(`startupFilters[${key}][max]`, value.max.toString());
            } else {
              params.append(`startupFilters[${key}]`, value.toString());
            }
          }
        });
      }

      if (filters.founderFilters) {
        Object.entries(filters.founderFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(`founderFilters[${key}]`, value.toString());
          }
        });
      }

      if (filters.jobFilters) {
        Object.entries(filters.jobFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && 'min' in value) {
              if (value.min !== undefined) params.append(`jobFilters[${key}][min]`, value.min.toString());
              if (value.max !== undefined) params.append(`jobFilters[${key}][max]`, value.max.toString());
            } else {
              params.append(`jobFilters[${key}]`, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to search: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while searching', 500);
    }
  }

  // Get search suggestions/autocomplete
  async getSuggestions(query: string, type?: SearchFilters['type']): Promise<ApiResponse<SearchSuggestion[]>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/suggestions?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get suggestions: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching suggestions', 500);
    }
  }

  // Get search statistics and analytics
  async getSearchStats(query?: string): Promise<ApiResponse<SearchStats>> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const response = await fetch(`${this.baseUrl}/stats?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get search stats: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching search stats', 500);
    }
  }

  // Search within specific entity types
  async searchStartups(query: string, filters?: SearchFilters['startupFilters']): Promise<PaginatedResponse<SearchResult>> {
    return this.search({ q: query, type: 'startups', startupFilters: filters });
  }

  async searchFounders(query: string, filters?: SearchFilters['founderFilters']): Promise<PaginatedResponse<SearchResult>> {
    return this.search({ q: query, type: 'founders', founderFilters: filters });
  }

  async searchJobs(query: string, filters?: SearchFilters['jobFilters']): Promise<PaginatedResponse<SearchResult>> {
    return this.search({ q: query, type: 'jobs', jobFilters: filters });
  }

  async searchNews(query: string): Promise<PaginatedResponse<SearchResult>> {
    return this.search({ q: query, type: 'news' });
  }

  // Advanced search with multiple types
  async advancedSearch(
    query: string,
    types: SearchFilters['type'][],
    filters: Partial<SearchFilters> = {}
  ): Promise<Record<string, PaginatedResponse<SearchResult>>> {
    try {
      const searchPromises = types.map(type => 
        this.search({ ...filters, q: query, type })
      );

      const results = await Promise.all(searchPromises);
      
      return types.reduce((acc, type, index) => {
        if (type) {
          acc[type] = results[index];
        }
        return acc;
      }, {} as Record<string, PaginatedResponse<SearchResult>>);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error during advanced search', 500);
    }
  }

  // Save search for later or alerts
  async saveSearch(searchData: {
    name: string;
    query: string;
    filters: SearchFilters;
    alertEnabled?: boolean;
    alertFrequency?: 'daily' | 'weekly' | 'immediate';
  }): Promise<ApiResponse<{ searchId: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to save search: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while saving search', 500);
    }
  }

  // Get saved searches
  async getSavedSearches(): Promise<PaginatedResponse<SavedSearch>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get saved searches: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching saved searches', 500);
    }
  }

  // Run saved search
  async runSavedSearch(searchId: string): Promise<PaginatedResponse<SearchResult>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved/${searchId}/run`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to run saved search: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while running saved search', 500);
    }
  }

  // Delete saved search
  async deleteSavedSearch(searchId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved/${searchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to delete saved search: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while deleting saved search', 500);
    }
  }

  // Get trending searches and topics
  async getTrendingSearches(): Promise<ApiResponse<{
    queries: string[];
    topics: string[];
    entities: SearchResult[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get trending searches: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching trending searches', 500);
    }
  }

  // Get search analytics (admin/analytics dashboard)
  async getSearchAnalytics(timeRange?: 'day' | 'week' | 'month' | 'year'): Promise<ApiResponse<SearchAnalytics>> {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);

      const response = await fetch(`${this.baseUrl}/analytics?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get search analytics: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching search analytics', 500);
    }
  }

  // Report search result or provide feedback
  async reportSearchResult(resultId: string, reason: string, feedback?: string): Promise<ApiResponse<{ reported: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resultId, reason, feedback }),
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to report search result: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while reporting search result', 500);
    }
  }

  // Get popular search filters and facets
  async getPopularFilters(type?: SearchFilters['type']): Promise<ApiResponse<{
    industries: Array<{ name: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    filters: Array<{ name: string; values: Array<{ value: string; count: number }> }>;
  }>> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/filters/popular?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get popular filters: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching popular filters', 500);
    }
  }

  // Semantic search using AI/ML
  async semanticSearch(query: string, type?: SearchFilters['type']): Promise<PaginatedResponse<SearchResult>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('semantic', 'true');
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/semantic?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to perform semantic search: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error during semantic search', 500);
    }
  }

  // Search with location/geo-based queries
  async searchByLocation(location: string, radius?: number, type?: SearchFilters['type']): Promise<PaginatedResponse<SearchResult>> {
    try {
      const params = new URLSearchParams();
      params.append('location', location);
      if (radius) params.append('radius', radius.toString());
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/location?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to search by location: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error during location search', 500);
    }
  }

  // Search history for user
  async getSearchHistory(): Promise<PaginatedResponse<{
    id: string;
    query: string;
    filters: SearchFilters;
    timestamp: string;
    resultCount: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/history`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to get search history: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching search history', 500);
    }
  }
}

// Export singleton instance
export const searchApi = new SearchApi();

// Export default
export default searchApi;
