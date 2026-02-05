'use client';

import { useCallback, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// URL state management hook
export function useUrlState<T extends Record<string, any>>(
  defaultValues: T = {} as T
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current URL parameters
  const urlState = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const state: Partial<T> = {};

    for (const [key, defaultValue] of Object.entries(defaultValues)) {
      const value = params.get(key);
      
      if (value !== null) {
        // Try to parse the value based on the default value type
        if (typeof defaultValue === 'boolean') {
          state[key as keyof T] = (value === 'true') as T[keyof T];
        } else if (typeof defaultValue === 'number') {
          const parsed = Number(value);
          state[key as keyof T] = (isNaN(parsed) ? defaultValue : parsed) as T[keyof T];
        } else if (Array.isArray(defaultValue)) {
          state[key as keyof T] = value.split(',').filter(Boolean) as T[keyof T];
        } else {
          state[key as keyof T] = value as T[keyof T];
        }
      } else {
        state[key as keyof T] = defaultValue;
      }
    }

    return { ...defaultValues, ...state };
  }, [searchParams, defaultValues]);

  // Update URL state
  const setUrlState = useCallback(
    (updates: Partial<T>, options: { replace?: boolean; scroll?: boolean } = {}) => {
      const params = new URLSearchParams(searchParams);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === defaultValues[key]) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            params.delete(key);
          } else {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, String(value));
        }
      });

      const url = `${pathname}?${params.toString()}`;
      
      if (options.replace) {
        router.replace(url as any, { scroll: options.scroll ?? true });
      } else {
        router.push(url as any, { scroll: options.scroll ?? true });
      }
    },
    [searchParams, router, pathname, defaultValues]
  );

  // Reset to default values
  const resetUrlState = useCallback(() => {
    const hasParams = Array.from(searchParams.keys()).length > 0;
    if (hasParams) {
      router.replace(pathname as any);
    }
  }, [router, pathname, searchParams]);

  // Get a single parameter
  const getParam = useCallback(
    (key: keyof T) => urlState[key],
    [urlState]
  );

  // Set a single parameter
  const setParam = useCallback(
    (key: keyof T, value: T[keyof T], options?: { replace?: boolean; scroll?: boolean }) => {
      setUrlState({ [key]: value } as Partial<T>, options);
    },
    [setUrlState]
  );

  return {
    urlState,
    setUrlState,
    resetUrlState,
    getParam,
    setParam,
  };
}

// Hook for search/filter state in URL
export function useSearchFilters() {
  const defaultFilters = {
    q: '',
    industry: '',
    location: '',
    fundingStage: '',
    foundedYear: '',
    page: 1,
    limit: 12,
    sort: 'relevance',
    verified: false,
    trending: false,
  };

  return useUrlState(defaultFilters);
}

// Hook for pagination state in URL
export function usePagination(defaultPage = 1, defaultLimit = 12) {
  const { urlState, setParam, setUrlState } = useUrlState({
    page: defaultPage,
    limit: defaultLimit,
  });

  const setPage = useCallback(
    (page: number) => setParam('page', page, { replace: true, scroll: false }),
    [setParam]
  );

  const setLimit = useCallback(
    (limit: number) => {
      // Reset to page 1 when changing limit
      setUrlState({ page: 1, limit }, { replace: true, scroll: false });
    },
    [setUrlState]
  );

  return {
    page: urlState.page,
    limit: urlState.limit,
    setPage,
    setLimit,
  };
}

// Hook for sort state in URL
export function useSort(defaultSort = 'relevance') {
  const { urlState, setUrlState } = useUrlState({
    sort: defaultSort,
    order: 'asc' as 'asc' | 'desc',
  });

  const setSort = useCallback(
    (sort: string, order: 'asc' | 'desc' = 'asc') => {
      setUrlState({ sort, order }, { replace: true, scroll: false });
    },
    [setUrlState]
  );

  return {
    sort: urlState.sort,
    order: urlState.order,
    setSort,
  };
}

// Hook for modal state in URL
export function useModalState(modalName: string) {
  const { urlState, setParam } = useUrlState({
    [modalName]: false,
  });

  const isOpen = urlState[modalName];

  const openModal = useCallback(
    () => setParam(modalName, true, { scroll: false }),
    [setParam, modalName]
  );

  const closeModal = useCallback(
    () => setParam(modalName, false, { replace: true, scroll: false }),
    [setParam, modalName]
  );

  return {
    isOpen,
    openModal,
    closeModal,
  };
}

// Hook for tab state in URL
export function useTabState(defaultTab = 'overview') {
  const { urlState, setParam } = useUrlState({
    tab: defaultTab,
  });

  const setTab = useCallback(
    (tab: string) => setParam('tab', tab, { replace: true, scroll: false }),
    [setParam]
  );

  return {
    activeTab: urlState.tab,
    setTab,
  };
}

// Utility to parse URL search params
export function parseUrlParams(searchParams: URLSearchParams) {
  const params: Record<string, string | string[]> = {};
  
  // Use Array.from to convert iterator to array for better compatibility
  const entries = Array.from(searchParams.entries());
  
  for (const [key, value] of entries) {
    if (params[key]) {
      // If key already exists, convert to array
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }
  
  return params;
}

// Utility to build URL with params
export function buildUrlWithParams(
  baseUrl: string, 
  params: Record<string, any>
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });
  
  return url.pathname + url.search;
}
