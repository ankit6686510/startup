import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Application State Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  token?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface ApplicationState {
  // User Management
  user: User | null;
  isAuthenticated: boolean;
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  
  // Modals & Overlays
  modals: {
    authModal: boolean;
    feedbackModal: boolean;
    startupSubmissionModal: boolean;
  };
  
  // Search & Filters
  recentSearches: string[];
  savedFilters: Array<{
    id: string;
    name: string;
    filters: Record<string, any>;
  }>;
  
  // User Preferences
  favorites: {
    startups: string[];
    founders: string[];
  };
  
  // Loading States
  loading: {
    global: boolean;
    auth: boolean;
    startup: boolean;
  };
}

interface SavedSearch {
  id: string;
  query: string;
  filters: Record<string, any>;
  timestamp: string;
  resultCount: number;
}

interface ApplicationActions {
  // User Actions
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
  logout: () => void;
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Modal Actions
  openModal: (modal: keyof ApplicationState['modals']) => void;
  closeModal: (modal: keyof ApplicationState['modals']) => void;
  closeAllModals: () => void;
  
  // Search Actions
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Search History Actions
  saveSearch: (search: SavedSearch) => void;
  getSavedSearches: () => SavedSearch[];
  removeSavedSearch: (id: string) => void;
  
  // Filter Actions
  saveFilter: (name: string, filters: Record<string, any>) => void;
  removeFilter: (id: string) => void;
  
  // Favorites Actions
  toggleStartupFavorite: (startupId: string) => void;
  toggleFounderFavorite: (founderId: string) => void;
  
  // Loading Actions
  setLoading: (key: keyof ApplicationState['loading'], loading: boolean) => void;
}

type ApplicationStore = ApplicationState & ApplicationActions;

const initialState: ApplicationState = {
  user: null,
  isAuthenticated: false,
  sidebarOpen: false,
  theme: 'system',
  notifications: [],
  unreadNotificationsCount: 0,
  modals: {
    authModal: false,
    feedbackModal: false,
    startupSubmissionModal: false,
  },
  recentSearches: [],
  savedFilters: [],
  favorites: {
    startups: [],
    founders: [],
  },
  loading: {
    global: false,
    auth: false,
    startup: false,
  },
};

export const useApplicationStore = create<ApplicationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // User Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }, false, 'setUser'),
        
        updateUserPreferences: (preferences) =>
          set((state) => ({
            user: state.user
              ? { ...state.user, preferences: { ...state.user.preferences, ...preferences } }
              : null,
          }), false, 'updateUserPreferences'),
        
        logout: () => set({
          user: null,
          isAuthenticated: false,
          favorites: { startups: [], founders: [] },
          savedFilters: [],
        }, false, 'logout'),
        
        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        
        // Notification Actions
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substring(2),
            timestamp: new Date(),
            read: false,
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadNotificationsCount: state.unreadNotificationsCount + 1,
          }), false, 'addNotification');
        },
        
        markNotificationAsRead: (id) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
          }), false, 'markNotificationAsRead'),
        
        removeNotification: (id) =>
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadNotificationsCount: notification && !notification.read
                ? Math.max(0, state.unreadNotificationsCount - 1)
                : state.unreadNotificationsCount,
            };
          }, false, 'removeNotification'),
        
        clearAllNotifications: () => set({
          notifications: [],
          unreadNotificationsCount: 0,
        }, false, 'clearAllNotifications'),
        
        // Modal Actions
        openModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: true },
          }), false, 'openModal'),
        
        closeModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: false },
          }), false, 'closeModal'),
        
        closeAllModals: () =>
          set((state) => ({
            modals: Object.keys(state.modals).reduce((acc, key) => ({
              ...acc,
              [key]: false,
            }), {} as ApplicationState['modals']),
          }), false, 'closeAllModals'),
        
        // Search Actions
        addRecentSearch: (query) =>
          set((state) => ({
            recentSearches: [
              query,
              ...state.recentSearches.filter((s) => s !== query),
            ].slice(0, 10), // Keep only last 10 searches
          }), false, 'addRecentSearch'),
        
        removeRecentSearch: (query) =>
          set((state) => ({
            recentSearches: state.recentSearches.filter((s) => s !== query),
          }), false, 'removeRecentSearch'),
        
        clearRecentSearches: () => set({ recentSearches: [] }, false, 'clearRecentSearches'),
        
        // Search History Actions
        saveSearch: (search) =>
          set((state) => ({
            savedFilters: [
              ...state.savedFilters,
              {
                id: search.id,
                name: search.query,
                filters: { ...search.filters, query: search.query },
              },
            ],
          }), false, 'saveSearch'),
        
        getSavedSearches: () => {
          const state = get();
          return state.savedFilters
            .filter(filter => filter.filters.query)
            .map(filter => ({
              id: filter.id,
              query: filter.filters.query,
              filters: filter.filters,
              timestamp: new Date().toISOString(),
              resultCount: 0,
            }));
        },
        
        removeSavedSearch: (id) =>
          set((state) => ({
            savedFilters: state.savedFilters.filter((f) => f.id !== id),
          }), false, 'removeSavedSearch'),
        
        // Filter Actions
        saveFilter: (name, filters) =>
          set((state) => ({
            savedFilters: [
              ...state.savedFilters,
              {
                id: Math.random().toString(36).substring(2),
                name,
                filters,
              },
            ],
          }), false, 'saveFilter'),
        
        removeFilter: (id) =>
          set((state) => ({
            savedFilters: state.savedFilters.filter((f) => f.id !== id),
          }), false, 'removeFilter'),
        
        // Favorites Actions
        toggleStartupFavorite: (startupId) =>
          set((state) => ({
            favorites: {
              ...state.favorites,
              startups: state.favorites.startups.includes(startupId)
                ? state.favorites.startups.filter((id) => id !== startupId)
                : [...state.favorites.startups, startupId],
            },
          }), false, 'toggleStartupFavorite'),
        
        toggleFounderFavorite: (founderId) =>
          set((state) => ({
            favorites: {
              ...state.favorites,
              founders: state.favorites.founders.includes(founderId)
                ? state.favorites.founders.filter((id) => id !== founderId)
                : [...state.favorites.founders, founderId],
            },
          }), false, 'toggleFounderFavorite'),
        
        // Loading Actions
        setLoading: (key, loading) =>
          set((state) => ({
            loading: { ...state.loading, [key]: loading },
          }), false, 'setLoading'),
      }),
      {
        name: 'startupcompass-app-state',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          recentSearches: state.recentSearches,
          savedFilters: state.savedFilters,
          favorites: state.favorites,
        }),
      }
    ),
    { name: 'ApplicationStore' }
  )
);

// Selectors for better performance
export const useUser = () => useApplicationStore((state) => state.user);
export const useIsAuthenticated = () => useApplicationStore((state) => state.isAuthenticated);
export const useTheme = () => useApplicationStore((state) => state.theme);
export const useNotifications = () => useApplicationStore((state) => state.notifications);
export const useUnreadNotificationsCount = () => useApplicationStore((state) => state.unreadNotificationsCount);
export const useFavorites = () => useApplicationStore((state) => state.favorites);
export const useRecentSearches = () => useApplicationStore((state) => state.recentSearches);
export const useLoading = () => useApplicationStore((state) => state.loading);

// Search History Hook
export const useSearchHistory = () => useApplicationStore((state) => ({
  searches: state.recentSearches,
  addSearch: state.addRecentSearch,
  removeSearch: state.removeRecentSearch,
  saveSearch: state.saveSearch,
  getSavedSearches: state.getSavedSearches,
  removeSavedSearch: state.removeSavedSearch,
}));
