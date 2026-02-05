import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalyticsHistory } from './hooks';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Setup QueryClient for testing
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useAnalyticsHistory', () => {
    it('fetches analytics history successfully', async () => {
        const mockData = {
            metric: 'revenue',
            range: '1Y',
            data: [{ name: 'Jan', value: 100 }],
            comparison: [{ name: 'Jan', value: 90 }],
        };

        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        const { result } = renderHook(() => useAnalyticsHistory('revenue', '1Y'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/analytics/history', {
            params: { metric: 'revenue', range: '1Y' },
        });
    });

    it('handles errors correctly', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useAnalyticsHistory('revenue', '1Y'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
