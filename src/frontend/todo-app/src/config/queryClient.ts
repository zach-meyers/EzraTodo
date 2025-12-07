import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parseError } from '@/utils/errorUtils';
import { TodoFilters } from '@/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Mutation error:', parseError(error));

        const parsed = parseError(error);
        if (parsed.type === 'network') {
          toast.error('Network error. Please check your connection.');
        }
      },
    },
  },
});

export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
  },
  todo: {
    all: ['todo'] as const,
    lists: () => [...queryKeys.todo.all, 'list'] as const,
    list: (filters?: TodoFilters) => [...queryKeys.todo.lists(), filters] as const,
    details: () => [...queryKeys.todo.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.todo.details(), id] as const,
  },
} as const;
