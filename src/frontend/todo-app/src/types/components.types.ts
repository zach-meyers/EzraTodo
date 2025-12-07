import { TodoItemResponse } from './api.types';
import { ReactNode } from 'react';

export interface TodoCardProps {
  todo: TodoItemResponse;
  onEdit?: (todo: TodoItemResponse) => void;
}

export interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TodoItemResponse | null;
  onSuccess?: () => void; // Optional callback after successful mutation
}

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface PublicRouteProps {
  children: ReactNode;
}
