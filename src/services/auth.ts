import api from '../lib/axios';
import { LoginRequest, LoginResponse, TokenRefreshResponse, UserInfo } from '../types/auth';

// 메모리에서 토큰 관리
let accessToken: string | null = null;

const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', request);
    const { accessToken: newToken } = response.data.data;
    accessToken = newToken;
    return response.data;
  },

  async refreshToken(): Promise<TokenRefreshResponse> {
    // 쿠키에서 자동으로 refresh token이 전송되므로 별도의 데이터는 필요 없음
    const response = await api.post<TokenRefreshResponse>('/auth/refresh');
    const { accessToken: newToken } = response.data.data;
    accessToken = newToken;
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      accessToken = null;
    }
  },

  async getCurrentUser(): Promise<UserInfo> {
    const response = await api.get<UserInfo>('/auth/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!accessToken;
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
};

export default authService; 