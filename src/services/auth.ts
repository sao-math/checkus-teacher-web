import axiosInstance from '../lib/axios';
import { LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse, UserInfo } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post('/auth/login', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || '로그인에 실패했습니다.');
  },

  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || '토큰 갱신에 실패했습니다.');
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosInstance.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getCurrentUser(): Promise<UserInfo> {
    const response = await axiosInstance.get('/auth/me');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || '사용자 정보를 가져오는데 실패했습니다.');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
};

export default authService; 