import axios from 'axios';
import authService from '../services/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// List of endpoints that do NOT require authentication
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/register/teacher',
  '/auth/check-username',
  '/auth/check-phone',
  // Add more public endpoints as needed
];

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Skip token check for public endpoints
      if (config.url && PUBLIC_ENDPOINTS.some(url => config.url.startsWith(url))) {
        return config;
      }

      await authService.ensureValidToken();
      const token = authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If there's no config or it's not an axios error, reject immediately
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Don't retry login or refresh token requests
    if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    // Only retry if it's a 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        authService.removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 