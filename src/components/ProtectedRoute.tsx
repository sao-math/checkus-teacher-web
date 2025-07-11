import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullScreenLoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoadingSpinner text="인증 확인 중..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Convenience component for admin-only routes
// Now relies on server-side authorization (401 responses) instead of client-side role checking
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
}; 