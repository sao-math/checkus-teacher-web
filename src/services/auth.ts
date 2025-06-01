import api from '../lib/axios';
import { LoginRequest, LoginResponse, TokenRefreshResponse, UserInfo } from '../types/auth';

// 메모리에서 토큰 관리
let accessToken: string | null = null;

const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', request);
    return response.data;
  },

  async refreshToken(): Promise<TokenRefreshResponse> {
    const response = await api.post<TokenRefreshResponse>('/auth/refresh');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await api.get<UserInfo>('/user/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  async checkUsername(username: string): Promise<{ success: boolean; data: boolean }> {
    const response = await api.get<{ success: boolean; data: boolean }>(`/auth/check-username?username=${username}`);
    return response.data;
  },

  async checkPhoneNumber(phoneNumber: string): Promise<{ success: boolean; data: boolean }> {
    const response = await api.get<{ success: boolean; data: boolean }>(`/auth/check-phone?phoneNumber=${phoneNumber}`);
    return response.data;
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  removeTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export default authService; 