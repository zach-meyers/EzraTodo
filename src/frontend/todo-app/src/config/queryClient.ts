import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parseError } from '@/utils/errorUtils';

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
      // Note: Global onError for queries was removed in React Query v5
      // Query errors are logged by the axios interceptor in api.ts
    },
    mutations: {
      // Mutations
      retry: 1, // Retry failed mutations once
      retryDelay: 1000, // Wait 1 second before retry
      onError: (error) => {
        // Log all mutation errors
        console.error('Mutation error:', parseError(error));

        // Show toast for network errors
        const parsed = parseError(error);
        if (parsed.type === 'network') {
          toast.error('Network error. Please check your connection.');
        }
        // Let components handle specific error messages
      },
    },
  },
});
