// ==================== Auth DTOs ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  userId: number;
}

// ==================== Todo DTOs ====================

export interface TodoItemResponse {
  id: number;
  userId: number;
  name: string;
  dueDate: string; // ISO 8601 date string
  notes: string | null;
  location: string | null;
  tags: string[];
  createdDate: string; // ISO 8601 date string
}

export interface CreateTodoRequest {
  name: string;
  dueDate: string; // ISO 8601 date string
  notes: string | null;
  tags: string[];
  location: string | null;
}

export interface UpdateTodoRequest {
  id: number;
  name: string;
  dueDate: string; // ISO 8601 date string
  notes: string | null;
  tags: string[];
  location: string | null;
}

// ==================== Filter Types ====================

export interface TodoFilters {
  dueDateFrom?: string;
  dueDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  tag?: string;
}

// For internal use (includes search term)
export interface TodoFiltersExtended extends TodoFilters {
  searchTerm: string;
}
