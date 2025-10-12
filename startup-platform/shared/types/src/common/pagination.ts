export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
    searchQuery?: string;
  };
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    nextCursor?: string;
    prevCursor?: string;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  meta?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
    searchQuery?: string;
  };
}

export interface SearchParams extends PaginationParams {
  query: string;
  filters?: Record<string, any>;
  facets?: string[];
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  searchMeta: {
    query: string;
    took: number; // Time taken in milliseconds
    totalHits: number;
    maxScore?: number;
    facets?: Record<string, FacetResult[]>;
    suggestions?: string[];
  };
}

export interface FacetResult {
  value: string;
  count: number;
  selected?: boolean;
}

// Common sort options
export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  NAME_ASC: 'name_asc', 
  NAME_DESC: 'name_desc',
  FUNDING_ASC: 'funding_asc',
  FUNDING_DESC: 'funding_desc',
  POPULARITY: 'popularity',
  TRENDING: 'trending'
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

// Default pagination settings
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc' as const
};
