import { useUrlState } from './useUrlState';

interface SearchFilters {
  q: string;
  type: string;
  industry: string;
  location: string;
  page: number;
}

const defaultFilters: SearchFilters = {
  q: '',
  type: 'all',
  industry: '',
  location: '',
  page: 1,
};

export function useSearchFilters() {
  return useUrlState<SearchFilters>(defaultFilters);
}
