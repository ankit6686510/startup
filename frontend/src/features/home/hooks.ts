import { useQuery } from '@tanstack/react-query';

import { MarketDataService, MarketStat } from '@/services/market-data';

export const homeKeys = {
    all: ['home'] as const,
    stats: () => [...homeKeys.all, 'stats'] as const,
    globalReach: () => [...homeKeys.all, 'reach'] as const,
};

/**
 * Hook to fetch live market statistics
 */
export function useMarketStats() {
    return useQuery({
        queryKey: homeKeys.stats(),
        queryFn: () => MarketDataService.getStats(),
        staleTime: 60 * 1000, // 1 minute stale time
        gcTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

/**
 * Hook to fetch global reach/platform data
 */
export function useGlobalReach() {
    return useQuery({
        queryKey: homeKeys.globalReach(),
        queryFn: () => MarketDataService.getGlobalReach(),
        staleTime: 5 * 60 * 1000,
    });
}
