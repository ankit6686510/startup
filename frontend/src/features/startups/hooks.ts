import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { startupsAPI } from './api';
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

// Query keys
const startupKeys = {
  all: ['startups'] as const,
  lists: () => [...startupKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, filters?: StartupFilters) =>
    [...startupKeys.lists(), { page, pageSize, filters }] as const,
  details: () => [...startupKeys.all, 'detail'] as const,
  detail: (id: string) => [...startupKeys.details(), id] as const,
  trending: () => [...startupKeys.all, 'trending'] as const,
  search: (query: string) => [...startupKeys.all, 'search', query] as const,
  byIndustry: (industry: string) => [...startupKeys.all, 'industry', industry] as const,
  industryStats: () => [...startupKeys.all, 'stats', 'industries'] as const,
  jobs: (startupId: string) => [...startupKeys.all, 'jobs', startupId] as const,
  news: (startupId: string) => [...startupKeys.all, 'news', startupId] as const,
  related: (startupId: string) => [...startupKeys.all, 'related', startupId] as const,
  saved: () => [...startupKeys.all, 'saved'] as const,
  suggested: () => [...startupKeys.all, 'suggested'] as const,
};

// Get startups with pagination and filters
export function useStartups(
  page: number = 1,
  pageSize: number = 20,
  filters?: StartupFilters
) {
  return useQuery({
    queryKey: startupKeys.list(page, pageSize, filters),
    queryFn: () => startupsAPI.getStartups(page, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// Get startup detail by ID
export function useStartupDetail(id: string) {
  return useQuery({
    queryKey: startupKeys.detail(id),
    queryFn: () => startupsAPI.getStartupById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  });
}

// Search startups
export function useStartupSearch(query: string, limit: number = 10) {
  return useQuery({
    queryKey: startupKeys.search(query),
    queryFn: () => startupsAPI.searchStartups(query, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!query && query.length >= 2,
  });
}

// Get trending startups
export function useTrendingStartups(limit: number = 10, timeframe: 'week' | 'month' | 'all' = 'week') {
  return useQuery({
    queryKey: startupKeys.trending(),
    queryFn: () => startupsAPI.getTrendingStartups(limit, timeframe),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get startups by industry
export function useStartupsByIndustry(industry: string, limit: number = 20) {
  return useQuery({
    queryKey: startupKeys.byIndustry(industry),
    queryFn: () => startupsAPI.getStartupsByIndustry(industry, limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!industry,
  });
}

// Get industry statistics
export function useIndustryStats() {
  return useQuery({
    queryKey: startupKeys.industryStats(),
    queryFn: () => startupsAPI.getIndustryStats(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

// Get startup jobs
export function useStartupJobs(startupId: string) {
  return useQuery({
    queryKey: startupKeys.jobs(startupId),
    queryFn: () => startupsAPI.getStartupJobs(startupId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!startupId,
  });
}

// Get startup news
export function useStartupNews(startupId: string, limit: number = 10) {
  return useQuery({
    queryKey: startupKeys.news(startupId),
    queryFn: () => startupsAPI.getStartupNews(startupId, limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!startupId,
  });
}

// Get related startups
export function useRelatedStartups(startupId: string, limit: number = 6) {
  return useQuery({
    queryKey: startupKeys.related(startupId),
    queryFn: () => startupsAPI.getRelatedStartups(startupId, limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!startupId,
  });
}

// Get saved startups
export function useSavedStartups(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: startupKeys.saved(),
    queryFn: () => startupsAPI.getSavedStartups(page, pageSize),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Get suggested startups
export function useSuggestedStartups(limit: number = 10) {
  return useQuery({
    queryKey: startupKeys.suggested(),
    queryFn: () => startupsAPI.getSuggestedStartups(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Toggle follow startup mutation
export function useToggleFollowStartup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { startupId: string; follow: boolean }) =>
      startupsAPI.toggleFollowStartup(args.startupId, args.follow),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: startupKeys.detail(variables.startupId),
      });
    },
  });
}

// Toggle save startup mutation
export function useToggleSaveStartup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { startupId: string; save: boolean }) =>
      startupsAPI.toggleSaveStartup(args.startupId, args.save),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: startupKeys.detail(variables.startupId),
      });
      queryClient.invalidateQueries({
        queryKey: startupKeys.saved(),
      });
    },
  });
}
