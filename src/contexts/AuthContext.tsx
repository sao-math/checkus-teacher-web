import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { UserInfo } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (formData: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setIsAuthenticated(true);
          setUser(response);
          setError(null);
        } else {
          // Token is invalid, clear it
          authService.removeTokens();
          setIsAuthenticated(false);
          setUser(null);
          setError('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Token is invalid, clear it
        authService.removeTokens();
        setIsAuthenticated(false);
        setUser(null);
        setError('인증에 실패했습니다. 다시 로그인해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (formData: { username: string; password: string }) => {
    try {
      setError(null);
      const response = await authService.login(formData);
      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;
        authService.setTokens(accessToken, refreshToken);
        // Verify the token by getting user info
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setIsAuthenticated(true);
          setUser(userResponse);
          navigate('/dashboard');
        } else {
          throw new Error('Failed to verify user session');
        }
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      // Clear tokens if login fails
      authService.removeTokens();
      setIsAuthenticated(false);
      setUser(null);
      setError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      authService.removeTokens();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 