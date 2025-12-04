import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { todoAPI } from "@/services/api";
import { queryKeys } from "@/config/queryKeys";
import { TodoItemResponse, CreateTodoRequest, UpdateTodoRequest } from "@/types";

/**
 * Create a new todo with automatic cache invalidation
 *
 * Features:
 * - Automatically invalidates todo lists after success
 * - Refetches data to include new todo
 * - Error handling built-in
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * const createTodo = useCreateTodo();
 * createTodo.mutate(todoData, {
 *   onSuccess: () => closeModal(),
 *   onError: (error) => showToast(error.message),
 * });
 */
export function useCreateTodo(): UseMutationResult<TodoItemResponse, Error, CreateTodoRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: CreateTodoRequest) => todoAPI.create(todo),
    onSuccess: (newTodo) => {
      // Invalidate all todo lists so they refetch with new todo
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.lists() });

      // Optionally: Add new todo to cache immediately
      queryClient.setQueryData(queryKeys.todo.detail(newTodo.id), newTodo);
    },
  });
}

/**
 * Update an existing todo with optimistic updates
 *
 * Features:
 * - Optimistic update: UI updates immediately before server response
 * - Automatic rollback on error
 * - Cache invalidation on success
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const updateTodo = useUpdateTodo();
 * updateTodo.mutate({ id: 5, todo: updatedData });
 */
export function useUpdateTodo(): UseMutationResult<TodoItemResponse, Error, { id: number; todo: UpdateTodoRequest }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, todo }) => todoAPI.update(id, todo),
    // Optimistic update: Update UI immediately before server responds
    onMutate: async ({ id, todo }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.todo.detail(id) });

      // Snapshot previous value for rollback
      const previousTodo = queryClient.getQueryData<TodoItemResponse>(queryKeys.todo.detail(id));

      // Optimistically update to new value
      if (previousTodo) {
        queryClient.setQueryData<TodoItemResponse>(queryKeys.todo.detail(id), {
          ...previousTodo,
          ...todo,
        });
      }

      // Return context with snapshot
      return { previousTodo };
    },
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache
      queryClient.setQueryData(queryKeys.todo.detail(updatedTodo.id), updatedTodo);

      // Invalidate lists to show updated todo
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.lists() });
    },
    onError: (_error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousTodo) {
        queryClient.setQueryData(queryKeys.todo.detail(variables.id), context.previousTodo);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after mutation completes (success or error)
      queryClient.invalidateQueries({
        queryKey: queryKeys.todo.detail(variables.id),
      });
    },
  });
}

/**
 * Delete a todo with optimistic update
 *
 * Features:
 * - Optimistic deletion: Removes from UI immediately
 * - Automatic rollback on error
 * - Updates all cached lists
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const deleteTodo = useDeleteTodo();
 * deleteTodo.mutate(todoId);
 * // UI updates immediately, rolls back if server request fails
 */
export function useDeleteTodo(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoAPI.delete(id),
    // Optimistic update: Remove from UI immediately
    onMutate: async (id) => {
      // Cancel queries to prevent overwrites
      await queryClient.cancelQueries({ queryKey: queryKeys.todo.lists() });

      // Snapshot all list queries
      const previousQueries = queryClient.getQueriesData<TodoItemResponse[]>({
        queryKey: queryKeys.todo.lists(),
      });

      // Optimistically remove todo from all lists
      queryClient.setQueriesData<TodoItemResponse[]>({ queryKey: queryKeys.todo.lists() }, (old) => old?.filter((todo) => todo.id !== id));

      return { previousQueries };
    },
    onSuccess: (_, id) => {
      // Remove todo detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.todo.detail(id) });

      // Invalidate all lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.lists() });
    },
    onError: (_error, _id, context) => {
      // Rollback: Restore all previous list queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}
