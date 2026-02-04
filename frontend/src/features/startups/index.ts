/**
 * Startups Discovery - Component & Hook Exports
 *
 * This index file centralizes all exports from the startups feature.
 * Use these imports to access components, hooks, and utilities.
 */

// Types
export type {
  Startup,
  StartupDetail,
  Founder,
  FundingRound,
  StartupJob,
  StartupNews,

  StartupSearchResult,
  FundingStage,
  StartupStatus,
  EmployeeRange,
} from './types';



// API Client
export { startupsAPI } from './api';

// Hooks - Queries
export {
  useStartups,
  useStartupDetail,
  useStartupSearch,
  useTrendingStartups,
  useStartupsByIndustry,
  useIndustryStats,
  useStartupJobs,
  useStartupNews,
  useRelatedStartups,
  useSavedStartups,
  useSuggestedStartups,
} from './hooks';

// Hooks - Mutations
export {
  useToggleFollowStartup,
  useToggleSaveStartup,
} from './hooks';

// Components
export {
  StartupCard,
  StartupCardSkeleton,
} from './components/StartupCardComponent';

export {
  StartupFilters,
} from './components/StartupFilters';

export {
  StartupSearch,
} from './components/StartupSearch';

// export {
//   StartupComparison,
// } from './components/StartupComparison';

export {
  TeamSection,
} from './components/TeamSection';

export {
  NewsTimeline,
} from './components/NewsTimeline';
