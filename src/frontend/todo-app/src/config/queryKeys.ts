import { TodoFilters } from "@/types";

/**
 * Centralized query key factory for type-safe, consistent cache keys
 * Following TanStack Query best practices for hierarchical keys
 */
export const queryKeys = {
  // Auth keys
  auth: {
    user: ["auth", "user"] as const,
  },

  // Todo keys - hierarchical structure
  todo: {
    all: ["todo"] as const,
    lists: () => [...queryKeys.todo.all, "list"] as const,
    list: (filters?: TodoFilters) => [...queryKeys.todo.lists(), filters] as const,
    details: () => [...queryKeys.todo.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.todo.details(), id] as const,
  },
} as const;
