import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { LoginRequest, SignupRequest, AuthResponse, TodoItemResponse, MutateTodoRequest, TodoFilters, ErrorResponse } from '@/types';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    // Handle 401 - token expired
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('token');
      // Redirect to login (if not already there)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        traceId: error.response?.data?.traceId,
      });
    }

    // TODO: Send to error logging service in production
    // logErrorToService(error);

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

// Todo API
export const todoAPI = {
  getAll: async (filters: TodoFilters = {}): Promise<TodoItemResponse[]> => {
    const response = await api.get<TodoItemResponse[]>('/todo', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: number): Promise<TodoItemResponse> => {
    const response = await api.get<TodoItemResponse>(`/todo/${id}`);
    return response.data;
  },

  create: async (todo: MutateTodoRequest): Promise<TodoItemResponse> => {
    const response = await api.post<TodoItemResponse>('/todo', todo);
    return response.data;
  },

  update: async (id: number, todo: MutateTodoRequest): Promise<TodoItemResponse> => {
    const response = await api.put<TodoItemResponse>(`/todo/${id}`, {
      ...todo,
      id,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/todo/${id}`);
  },
};

export default api;
