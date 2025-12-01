import axios from "axios";

const API_BASE_URL = "https://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
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
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  signup: async (email, password) => {
    const response = await api.post("/auth/signup", { email, password });
    return response.data;
  },
};

// Todos API
export const todosAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get("/todos", { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },
  create: async (todo) => {
    const response = await api.post("/todos", todo);
    return response.data;
  },
  update: async (id, todo) => {
    const response = await api.put(`/todos/${id}`, { ...todo, id });
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/todos/${id}`);
  },
};

export default api;
