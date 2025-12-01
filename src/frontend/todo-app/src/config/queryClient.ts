import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Queries
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for this long
      gcTime: 10 * 60 * 1000, // 10 minutes - unused data kept in cache (formerly cacheTime)
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      // Mutations
      retry: 1, // Retry failed mutations once
      retryDelay: 1000, // Wait 1 second before retry
    },
  },
});
