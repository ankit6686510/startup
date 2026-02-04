import { ReactNode } from 'react';

// Define strict types for market stats
export interface MarketStat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    color: string;
    bgColor: string;
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_STATS: MarketStat[] = [
    {
        label: 'Active Startups',
        value: '12,847',
        change: '+23%',
        trend: 'up',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10'
    },
    {
        label: 'Total Funding',
        value: '$52.3B',
        change: '+18%',
        trend: 'up',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10'
    },
    {
        label: 'Founders',
        value: '34,291',
        change: '+31%',
        trend: 'up',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10'
    },
    {
        label: 'Exits (IPO/M&A)',
        value: '842',
        change: '+12%',
        trend: 'up',
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10'
    },
];

export const MarketDataService = {
    getStats: async (): Promise<MarketStat[]> => {
        await delay(600);
        return MOCK_STATS;
    },

    getGlobalReach: async () => {
        await delay(400);
        return {
            countries: 150,
            industries: 45,
            uptime: '99.9%',
            latency: '50ms',
            updates: 'Daily'
        };
    }
};
