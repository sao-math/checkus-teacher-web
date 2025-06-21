import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Prevent multiple concurrent auth checks
  const isCheckingAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple concurrent checks
      if (isCheckingAuth.current) {
        return;
      }
      
      isCheckingAuth.current = true;
      
      try {
        if (!authService.isAuthenticated()) {
          setIsAuthenticated(false);
          setUser(null);
          setError(null);
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
            setError(null); // Don't set error message for silent token cleanup
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          // Token is invalid, clear it
          authService.removeTokens();
          setIsAuthenticated(false);
          setUser(null);
          setError(null); // Don't set error message for silent token cleanup
        }
      } finally {
        setIsLoading(false);
        isCheckingAuth.current = false;
      }
    };

    checkAuth();
  }, []);

  const login = async (formData: { username: string; password: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.login(formData);
      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;
        authService.setTokens(accessToken, refreshToken);
        
        // Verify the token by getting user info
        try {
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            setIsAuthenticated(true);
            setUser(userResponse);
            setError(null);
            navigate('/dashboard');
          } else {
            throw new Error('Failed to verify user session');
          }
        } catch (userError) {
          // Clear tokens if user verification fails
          authService.removeTokens();
          throw new Error('로그인은 성공했지만 사용자 정보를 가져올 수 없습니다.');
        }
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      // Clear tokens if login fails
      authService.removeTokens();
      setIsAuthenticated(false);
      setUser(null);
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout API fails, clear local tokens
      console.error('Logout error:', error);
    } finally {
      authService.removeTokens();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      setIsLoading(false);
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