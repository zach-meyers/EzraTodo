import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { todoAPI } from '@/services/api';
import { TodoItemResponse, MutateTodoRequest } from '@/types';
import { queryKeys } from '@/config/queryClient';

export function useCreateTodo(): UseMutationResult<TodoItemResponse, Error, MutateTodoRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: MutateTodoRequest) => todoAPI.create(todo),
    onSuccess: (newTodo) => {
      // invalidate all todo lists queries to force refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.lists() });
      // add new todo to cache immediately
      queryClient.setQueryData(queryKeys.todo.detail(newTodo.id), newTodo);
    },
  });
}

export function useUpdateTodo(): UseMutationResult<TodoItemResponse, Error, { id: number; todo: MutateTodoRequest }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, todo }) => todoAPI.update(id, todo),
    onMutate: async ({ id, todo }) => {
      // cancel any pending queries and rely on the cache update from this mutation
      await queryClient.cancelQueries({ queryKey: queryKeys.todo.detail(id) });

      // use optimisitc update
      const previousTodo = queryClient.getQueryData<TodoItemResponse>(queryKeys.todo.detail(id));
      if (previousTodo) {
        queryClient.setQueryData<TodoItemResponse>(queryKeys.todo.detail(id), {
          ...previousTodo,
          ...todo,
        });
      }
      queryClient.setQueriesData<TodoItemResponse[]>({ queryKey: queryKeys.todo.lists() }, (old) => old?.filter((todo) => todo.id !== id));

      // return snapshot for error case
      return { previousTodo };
    },
    onError: (_error, variables, context) => {
      // rollback optimistic update on error
      if (context?.previousTodo) {
        queryClient.setQueryData(queryKeys.todo.detail(variables.id), context.previousTodo);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.lists() });
    },
  });
}

export function useDeleteTodo(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoAPI.delete(id),
    onMutate: async (id) => {
      // cancel any pending queries and rely on the cache update from this mutation
      await queryClient.cancelQueries({ queryKey: queryKeys.todo.lists() });

      // use optimisitc delete
      const previousQueries = queryClient.getQueriesData<TodoItemResponse[]>({ queryKey: queryKeys.todo.lists() });
      queryClient.setQueriesData<TodoItemResponse[]>(
        {
          queryKey: queryKeys.todo.lists(),
        },
        (old) => old?.filter((todo) => todo.id !== id)
      );

      // return snapshot for error case
      return { previousQueries };
    },
    onSuccess: (_, id) => {
      // remove from cache and invalidate list queries
      queryClient.removeQueries({ queryKey: queryKeys.todo.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todo.lists() });
    },
    onError: (_error, _id, context) => {
      // restore list queries
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}
