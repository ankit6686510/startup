import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from './api';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard', 'data'],
    queryFn: () => dashboardAPI.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardAPI.getStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardAPI.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrendingStartups(limit: number = 6) {
  return useQuery({
    queryKey: ['dashboard', 'trending', limit],
    queryFn: () => dashboardAPI.getTrendingStartups(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useWatchlist(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'watchlist', limit],
    queryFn: () => dashboardAPI.getWatchlist(limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardNews(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'news', limit],
    queryFn: () => dashboardAPI.getNews(limit),
    staleTime: 5 * 60 * 1000,
  });
}
