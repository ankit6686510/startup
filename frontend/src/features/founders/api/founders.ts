import { ApiResponse, PaginatedResponse, ApiError } from '@/lib/api';

// Types
export interface FounderFilters {
  industry?: string;
  location?: string;
  experience?: 'entry' | 'mid' | 'senior' | 'executive';
  role?: string;
  company?: string;
  verified?: boolean;
  trending?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'experience' | 'companies' | 'funding' | 'trending';
  sortOrder?: 'asc' | 'desc';
}

export interface Founder {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  location: string;
  verified: boolean;
  trending: boolean;
  featured: boolean;
  
  // Professional Info
  experience: {
    total: number;
    current: {
      company: string;
      title: string;
      startDate: string;
    };
  };
  
  // Social Links
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    medium?: string;
    personal?: string;
  };
  
  // Contact
  contact: {
    email?: string;
    website?: string;
    calendly?: string;
  };
  
  // Statistics
  stats: {
    companiesFounded: number;
    totalFundingRaised: string;
    teamsLed: number;
    yearsExperience: number;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface FounderProfile extends Founder {
  // Extended information
  longBio: string;
  
  // Education
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
    description?: string;
  }>;
  
  // Work Experience
  experience: {
    total: number;
    current: {
      company: string;
      title: string;
      startDate: string;
    };
    history: Array<{
      id: string;
      company: string;
      title: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
      achievements: string[];
      companyLogo?: string;
      companyUrl?: string;
    }>;
  };
  
  // Companies Founded
  companies: Array<{
    id: string;
    name: string;
    slug: string;
    role: 'founder' | 'co-founder' | 'advisor' | 'investor';
    description: string;
    logo: string;
    founded: number;
    status: 'active' | 'acquired' | 'closed';
    funding?: string;
    stage?: string;
    industry: string;
    current: boolean;
    achievements: string[];
  }>;
  
  // Investments (if investor)
  investments?: Array<{
    id: string;
    company: string;
    amount?: string;
    round?: string;
    date: string;
    status: 'active' | 'exited';
    description?: string;
  }>;
  
  // Publications & Media
  media: Array<{
    id: string;
    title: string;
    type: 'article' | 'interview' | 'podcast' | 'video' | 'book';
    url?: string;
    publication?: string;
    date: string;
    description: string;
  }>;
  
  // Awards & Recognition
  awards: Array<{
    id: string;
    title: string;
    description: string;
    year: number;
    organization?: string;
  }>;
  
  // Skills & Expertise
  skills: string[];
  interests: string[];
  
  // Network
  network: {
    followers: number;
    following: number;
    connections: number;
  };
}

export interface FounderStats {
  totalFounders: number;
  activeFounders: number;
  totalCompanies: number;
  totalFundingInfluenced: string;
  averageExperience: number;
  topIndustries: Record<string, number>;
  topLocations: Record<string, number>;
  experienceLevels: Record<string, number>;
}

// API Service Class
export class FoundersApi {
  private baseUrl = '/api/founders';

  // Get paginated list of founders
  async getFounders(filters: FounderFilters = {}): Promise<PaginatedResponse<Founder>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founders: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founders', 500);
    }
  }

  // Get founder by ID or slug
  async getFounder(identifier: string): Promise<ApiResponse<FounderProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/${identifier}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new ApiError('Founder not found', 404);
        }
        throw new ApiError(`Failed to fetch founder: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder profile', 500);
    }
  }

  // Get featured founders
  async getFeaturedFounders(): Promise<ApiResponse<Founder[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/featured`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch featured founders: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching featured founders', 500);
    }
  }

  // Get trending founders
  async getTrendingFounders(): Promise<ApiResponse<Founder[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch trending founders: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching trending founders', 500);
    }
  }

  // Get founders by industry
  async getFoundersByIndustry(industry: string, filters: FounderFilters = {}): Promise<PaginatedResponse<Founder>> {
    const industryFilters = { ...filters, industry };
    return this.getFounders(industryFilters);
  }

  // Get founders by company
  async getFoundersByCompany(companyId: string): Promise<ApiResponse<Founder[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/company/${companyId}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founders by company: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founders by company', 500);
    }
  }

  // Get founder statistics
  async getFounderStats(): Promise<ApiResponse<FounderStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founder stats: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder statistics', 500);
    }
  }

  // Get founder's companies
  async getFounderCompanies(founderId: string): Promise<ApiResponse<FounderProfile['companies']>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/companies`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founder companies: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder companies', 500);
    }
  }

  // Get founder's investments
  async getFounderInvestments(founderId: string): Promise<ApiResponse<FounderProfile['investments']>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/investments`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founder investments: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder investments', 500);
    }
  }

  // Get founder's media mentions
  async getFounderMedia(founderId: string): Promise<ApiResponse<FounderProfile['media']>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/media`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founder media: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder media', 500);
    }
  }

  // Search founders
  async searchFounders(query: string, filters: FounderFilters = {}): Promise<PaginatedResponse<Founder>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to search founders: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while searching founders', 500);
    }
  }

  // Get similar founders
  async getSimilarFounders(founderId: string): Promise<ApiResponse<Founder[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/similar`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch similar founders: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching similar founders', 500);
    }
  }

  // Get available filter options
  async getFilterOptions(): Promise<ApiResponse<{
    industries: string[];
    locations: string[];
    roles: string[];
    experienceLevels: string[];
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

  // Follow/Unfollow founder (requires authentication)
  async followFounder(founderId: string): Promise<ApiResponse<{ following: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to follow founder: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while following founder', 500);
    }
  }

  async unfollowFounder(founderId: string): Promise<ApiResponse<{ following: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/follow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new ApiError(`Failed to unfollow founder: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while unfollowing founder', 500);
    }
  }

  // Get founder's followers/following
  async getFounderFollowers(founderId: string): Promise<PaginatedResponse<Founder>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/followers`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founder followers: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder followers', 500);
    }
  }

  async getFounderFollowing(founderId: string): Promise<PaginatedResponse<Founder>> {
    try {
      const response = await fetch(`${this.baseUrl}/${founderId}/following`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch founder following: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching founder following', 500);
    }
  }
}

// Export singleton instance
export const foundersApi = new FoundersApi();

// Export default
export default foundersApi;
