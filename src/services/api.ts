import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Parse errors nicely and handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as ApiError | undefined;
    
    // Normalize error message
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (responseData && responseData.message) {
      errorMessage = responseData.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle session expiration (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    // Attach custom error message for React Query / Axios catches
    const normalizedError = new Error(errorMessage) as Error & {
      status?: number;
      raw?: ApiError;
    };
    normalizedError.status = error.response?.status;
    normalizedError.raw = responseData;

    return Promise.reject(normalizedError);
  }
);
