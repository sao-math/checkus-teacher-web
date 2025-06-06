import api from '../lib/axios';
import { LoginRequest, LoginResponse, TokenRefreshResponse, UserInfo } from '../types/auth';

// 메모리에서 토큰 관리
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', request);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
    this.setTokens(newAccessToken, newRefreshToken);
    return response.data;
  },

  async refreshToken(): Promise<TokenRefreshResponse> {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await api.post<TokenRefreshResponse>('/auth/refresh', {
        refreshToken
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      this.setTokens(newAccessToken, newRefreshToken);
      return response.data;
    } catch (error) {
      this.removeTokens();
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.removeTokens();
    }
  },

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await api.get<UserInfo>('/users/me');
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
    return !!accessToken;
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  setTokens(newAccessToken: string, newRefreshToken: string): void {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  },

  removeTokens(): void {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // 토큰이 만료되었는지 확인
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  // 토큰 갱신이 필요한지 확인
  async ensureValidToken(): Promise<void> {
    if (!accessToken || this.isTokenExpired(accessToken)) {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      await this.refreshToken();
    }
  }
};

export default authService; 