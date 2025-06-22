import axios from 'axios';
import { handleError } from './errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // 쿠키 전송을 위해 필요
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

// Flag to prevent multiple redirects
let isRedirecting = false;

// Import auth service with dynamic import to avoid circular dependency
let authService: any = null;
const getAuthService = async () => {
  if (!authService) {
    const { default: auth } = await import('../services/auth');
    authService = auth;
  }
  return authService;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Skip token check for public endpoints
      if (config.url && PUBLIC_ENDPOINTS.some(url => config.url.startsWith(url))) {
        return config;
      }

      // Get access token from memory via auth service
      const auth = await getAuthService();
      const token = auth.getAccessToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No access token in memory for protected endpoint:', config.url);
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Prevent handling if already redirecting
    if (isRedirecting) {
      return Promise.reject(error);
    }

    // If there's no config or it's not an axios error, reject immediately
    if (!error.config) {
      handleError(error, {
        title: "네트워크 오류",
        fallbackMessage: "서버와 연결할 수 없습니다."
      });
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Don't retry login or refresh token requests
    if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    // Handle 401 errors (authentication failed)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('401 error detected, attempting token refresh using cookie:', {
        url: originalRequest.url
      });

      try {
        console.log('Attempting to refresh token...');
        
        // Try to refresh token using cookie-based refresh
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true // 쿠키의 리프레시 토큰 사용
        });
        
        const { accessToken: newAccessToken } = refreshResponse.data.data;
        
        // Update access token in memory via auth service
        const auth = await getAuthService();
        auth.setAccessToken(newAccessToken);
        
        console.log('Token refresh successful');
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        handleAuthenticationFailure();
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    if (error.response?.status >= 500) {
      handleError(error, {
        title: "서버 오류",
        fallbackMessage: "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      });
    } else if (error.response?.status >= 400 && error.response?.status !== 401) {
      // Log 4xx errors but don't show automatic toast (except 401)
      console.error('Client error:', error);
    } else if (error.request) {
      // Network error
      handleError(error, {
        title: "네트워크 오류",
        fallbackMessage: "인터넷 연결을 확인해주세요."
      });
    }

    return Promise.reject(error);
  }
);

// Helper function to handle authentication failure
async function handleAuthenticationFailure() {
  if (isRedirecting) return;
  
  isRedirecting = true;
  
  // Clear access token from memory
  const auth = await getAuthService();
  auth.clearAccessToken();
  
  // Show error message
  handleError(new Error('Authentication failed'), {
    title: "세션 만료",
    fallbackMessage: "다시 로그인해주세요."
  });
  
  // Use setTimeout to prevent immediate redirect conflicts
  setTimeout(() => {
    // Use history API instead of window.location.href to avoid full page reload
    if (window.location.pathname !== '/login') {
      window.history.pushState(null, '', '/login');
      // Trigger a popstate event to notify React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    isRedirecting = false;
  }, 100);
}

export default axiosInstance; 