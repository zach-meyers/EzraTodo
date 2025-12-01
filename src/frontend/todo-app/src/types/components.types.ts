import { TodoItemResponse, CreateTodoRequest } from './api.types';
import { ReactNode } from 'react';

// ==================== Component Props ====================

export interface TodoCardProps {
  todo: TodoItemResponse;
  onDelete: (id: number) => void;
}

export interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todoData: CreateTodoRequest) => void | Promise<void>;
  initialData?: TodoItemResponse | null;
}

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface PublicRouteProps {
  children: ReactNode;
}
