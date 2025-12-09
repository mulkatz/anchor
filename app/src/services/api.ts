import axios from 'axios';
import type { ApiResponse } from '../models';

/**
 * API service for backend communication
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from storage if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login or trigger auth flow
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, config?: object): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((res) => res.data),

  post: <T>(url: string, data?: object, config?: object): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: object, config?: object): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: object): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((res) => res.data),
};

export default apiClient;
