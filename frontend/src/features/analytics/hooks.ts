import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

export interface AnalyticsDataPoint {
    name: string;
    value: number;
}

export interface AnalyticsResponse {
    metric: string;
    range: string;
    data: AnalyticsDataPoint[];
    comparison: AnalyticsDataPoint[];
}

const analyticsAPI = {
    getHistory: async (metric: string, range: string) => {
        // Ensure we use the relative path correctly or the environment variable
        const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
        // Remove /api if it's already in the base URL to avoids double /api/api
        const normalizedBase = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

        // Actually, since we set up a relative proxy or just use Next.js API routes directly:
        // If we are calling our own Next.js API routes, we can just use /api directly if we are client side.

        const response = await axios.get<AnalyticsResponse>(`/api/analytics/history`, {
            params: { metric, range }
        });
        return response.data;
    }
};

export const useAnalyticsHistory = (metric: string, range: string) => {
    return useQuery({
        queryKey: ['analytics', metric, range],
        queryFn: () => analyticsAPI.getHistory(metric, range),
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: keepPreviousData, // Keep showing old data while fetching new data
    });
};
