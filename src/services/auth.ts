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
    const response = await api.get<UserInfo>('/user/me');
    return response.data;
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
    const hasToken = !!this.getAccessToken();
    console.log('Checking authentication:', hasToken);
    return hasToken;
  },

  getAccessToken(): string | null {
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
      console.log('Retrieved token from localStorage:', !!accessToken);
    }
    return accessToken;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    console.log('Setting tokens...');
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    console.log('Tokens set successfully');
  },

  removeTokens(): void {
    console.log('Removing tokens...');
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('Tokens removed');
  },
};

export default authService; 