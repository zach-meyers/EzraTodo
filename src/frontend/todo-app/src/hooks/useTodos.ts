import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { todosAPI } from '@/services/api';
import { queryKeys } from '@/config/queryKeys';
import { TodoItemResponse, TodoFilters } from '@/types';

/**
 * Fetch all todos with optional filters
 * Auto-refetches on window focus, reconnect, and every 5 minutes
 *
 * Features:
 * - Automatic caching (5 minute staleTime)
 * - Background refetch on window focus
 * - Automatic retry on failure (3 attempts)
 * - Request deduplication
 *
 * @param filters - Optional filters for todos
 * @returns Query result with todos data, loading state, and error state
 *
 * @example
 * const { data: todos, isLoading, error } = useTodos({ tag: 'work' });
 */
export function useTodos(
  filters?: TodoFilters
): UseQueryResult<TodoItemResponse[], Error> {
  return useQuery({
    queryKey: queryKeys.todos.list(filters),
    queryFn: () => todosAPI.getAll(filters),
    // staleTime inherited from global config (5 minutes)
    // Auto-refetch inherited from global config
  });
}

/**
 * Fetch a single todo by ID
 * Only fetches when enabled (e.g., modal is open)
 *
 * @param id - Todo ID to fetch
 * @param options - Query options including enabled flag
 * @returns Query result with todo data
 *
 * @example
 * const { data: todo } = useTodo(5, { enabled: isModalOpen });
 */
export function useTodo(
  id: number | null,
  options?: { enabled?: boolean }
): UseQueryResult<TodoItemResponse, Error> {
  return useQuery({
    queryKey: queryKeys.todos.detail(id!),
    queryFn: () => todosAPI.getById(id!),
    enabled: id !== null && (options?.enabled ?? true), // Only run if ID exists and enabled
    staleTime: 10 * 60 * 1000, // 10 minutes for individual todos (less likely to change)
  });
}
