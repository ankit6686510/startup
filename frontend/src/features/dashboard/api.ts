import axios from 'axios';
import { DashboardData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardAPI = {
  // Get all dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await client.get<DashboardData>('/dashboard');
    return response.data;
  },

  // Get dashboard stats only
  getStats: async () => {
    const response = await client.get('/dashboard/stats');
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10) => {
    const response = await client.get('/dashboard/activity', {
      params: { limit }
    });
    return response.data;
  },

  // Get trending startups
  getTrendingStartups: async (limit: number = 6) => {
    const response = await client.get('/dashboard/trending', {
      params: { limit }
    });
    return response.data;
  },

  // Get watchlist summary
  getWatchlist: async (limit: number = 5) => {
    const response = await client.get('/dashboard/watchlist', {
      params: { limit }
    });
    return response.data;
  },

  // Get latest news
  getNews: async (limit: number = 5) => {
    const response = await client.get('/dashboard/news', {
      params: { limit }
    });
    return response.data;
  }
};
