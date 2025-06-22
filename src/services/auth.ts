import api from '../lib/axios';
import { LoginRequest, LoginResponse, TokenRefreshResponse, UserInfo } from '../types/auth';

// 액세스 토큰은 메모리에서만 관리
let accessToken: string | null = null;

const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', request);
    const { accessToken: newAccessToken } = response.data.data;
    
    // 액세스 토큰은 메모리에 저장
    this.setAccessToken(newAccessToken);
    
    // 리프레시 토큰은 서버에서 쿠키로 설정됨 (Set-Cookie 헤더)
    console.log('Login successful, access token stored in memory');
    return response.data;
  },

  async refreshToken(): Promise<TokenRefreshResponse> {
    try {
      console.log('Attempting to refresh token using cookie...');
      // 리프레시 토큰은 쿠키에서 자동으로 전송됨 (withCredentials: true)
      const response = await api.post<TokenRefreshResponse>('/auth/refresh');
      const { accessToken: newAccessToken } = response.data.data;
      
      // 새 액세스 토큰을 메모리에 저장
      this.setAccessToken(newAccessToken);
      console.log('Token refresh successful');
      return response.data;
    } catch (error) {
      console.error('Token refresh failed, clearing access token');
      this.clearAccessToken();
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      // 서버에서 리프레시 토큰 쿠키를 제거함
      await api.post('/auth/logout');
    } finally {
      // 메모리의 액세스 토큰 제거
      this.clearAccessToken();
      console.log('Logout completed, access token cleared from memory');
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

  // 인증 상태 확인 (메모리의 액세스 토큰 기준)
  isAuthenticated(): boolean {
    return !!accessToken;
  },

  // 액세스 토큰 반환 (메모리에서)
  getAccessToken(): string | null {
    return accessToken;
  },

  // 액세스 토큰 설정 (메모리에)
  setAccessToken(newAccessToken: string): void {
    accessToken = newAccessToken;
    console.log('Access token updated in memory');
  },

  // 액세스 토큰 제거 (메모리에서)
  clearAccessToken(): void {
    accessToken = null;
    console.log('Access token cleared from memory');
  },

  // 토큰이 만료되었는지 확인
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const isExpired = expirationTime < currentTime;
      
      if (isExpired) {
        console.log('Token expired:', {
          expirationTime: new Date(expirationTime),
          currentTime: new Date(currentTime)
        });
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  // 유효한 토큰 확보 (필요시 리프레시)
  async ensureValidToken(): Promise<void> {
    const currentAccessToken = this.getAccessToken();
    
    if (!currentAccessToken) {
      console.log('No access token in memory, attempting refresh from cookie');
      await this.refreshToken();
      return;
    }
    
    if (this.isTokenExpired(currentAccessToken)) {
      console.log('Access token expired, refreshing from cookie');
      await this.refreshToken();
      return;
    }
    
    console.log('Access token is valid');
  },

  // 페이지 로드 시 초기화 (리프레시 토큰으로 액세스 토큰 복구)
  async initializeFromRefreshToken(): Promise<boolean> {
    try {
      console.log('Initializing authentication from refresh token cookie...');
      await this.refreshToken();
      return true;
    } catch (error) {
      console.log('Failed to initialize from refresh token:', error);
      return false;
    }
  },

  // 디버깅을 위한 토큰 상태 확인
  debugTokenStatus(): void {
    const currentAccessToken = this.getAccessToken();
    
    console.log('=== Token Status Debug ===');
    console.log('Has Access Token in Memory:', !!currentAccessToken);
    console.log('Cookies:', document.cookie); // 리프레시 토큰 쿠키 확인용
    
    if (currentAccessToken) {
      try {
        const payload = JSON.parse(atob(currentAccessToken.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        console.log('Access Token Expiry:', new Date(expirationTime));
        console.log('Current Time:', new Date(currentTime));
        console.log('Time Until Expiry:', `${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);
        console.log('Is Expired:', this.isTokenExpired(currentAccessToken));
      } catch (error) {
        console.error('Error parsing access token:', error);
      }
    }
    
    console.log('=== End Token Status ===');
  }
};

export default authService; 