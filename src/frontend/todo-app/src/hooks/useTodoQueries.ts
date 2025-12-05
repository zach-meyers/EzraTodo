import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { todoAPI } from '@/services/api';
import { TodoItemResponse, TodoFilters } from '@/types';
import { queryKeys } from '@/config/queryClient';

export function useTodos(filters?: TodoFilters): UseQueryResult<TodoItemResponse[], Error> {
  return useQuery({
    queryKey: queryKeys.todo.list(filters),
    queryFn: () => todoAPI.getAll(filters),
  });
}

export function useTodo(id: number | null, options?: { enabled?: boolean }): UseQueryResult<TodoItemResponse, Error> {
  return useQuery({
    queryKey: queryKeys.todo.detail(id!),
    queryFn: () => todoAPI.getById(id!),
    enabled: id !== null && (options?.enabled ?? true),
  });
}
