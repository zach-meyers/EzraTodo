import { TodoFilters } from '@/types';

/**
 * Centralized query key factory for type-safe, consistent cache keys
 * Following TanStack Query best practices for hierarchical keys
 */
export const queryKeys = {
  // Auth keys
  auth: {
    user: ['auth', 'user'] as const,
  },

  // Todo keys - hierarchical structure
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (filters?: TodoFilters) => [...queryKeys.todos.lists(), filters] as const,
    details: () => [...queryKeys.todos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.todos.details(), id] as const,
  },
} as const;
