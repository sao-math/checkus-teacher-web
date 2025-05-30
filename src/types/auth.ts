export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  username: string;
  name: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: number;
  username: string;
  name: string;
  phoneNumber: string | null;
  discordId: string | null;
  roles: string[];
  createdAt: string | null;
} 