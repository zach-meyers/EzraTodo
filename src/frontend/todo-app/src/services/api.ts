import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  TodoItemResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters
} from '@/types';

const API_BASE_URL = 'https://localhost:5001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const request: LoginRequest = { email, password };
    const response = await api.post<AuthResponse>('/auth/login', request);
    return response.data;
  },

  signup: async (email: string, password: string): Promise<AuthResponse> => {
    const request: SignupRequest = { email, password };
    const response = await api.post<AuthResponse>('/auth/signup', request);
    return response.data;
  },
};

// Todos API
export const todosAPI = {
  getAll: async (filters: TodoFilters = {}): Promise<TodoItemResponse[]> => {
    const response = await api.get<TodoItemResponse[]>('/todos', { params: filters });
    return response.data;
  },

  getById: async (id: number): Promise<TodoItemResponse> => {
    const response = await api.get<TodoItemResponse>(`/todos/${id}`);
    return response.data;
  },

  create: async (todo: CreateTodoRequest): Promise<TodoItemResponse> => {
    const response = await api.post<TodoItemResponse>('/todos', todo);
    return response.data;
  },

  update: async (id: number, todo: UpdateTodoRequest): Promise<TodoItemResponse> => {
    const response = await api.put<TodoItemResponse>(`/todos/${id}`, { ...todo, id });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};

export default api;
