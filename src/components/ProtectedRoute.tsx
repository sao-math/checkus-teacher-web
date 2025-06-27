import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'TEACHER' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check basic access (TEACHER or ADMIN role)
  const hasBasicRole = user?.data?.roles.some(role => 
    role.toUpperCase() === 'TEACHER' || role.toUpperCase() === 'ADMIN'
  );

  if (!hasBasicRole) {
    return <Navigate 
      to="/login" 
      state={{ 
        error: '접근 권한이 없습니다. 관리자에게 문의해주세요.' 
      }} 
      replace 
    />;
  }

  // Check specific role requirement (for admin-only pages)
  if (requiredRole === 'ADMIN') {
    const hasAdminRole = user?.data?.roles.some(role => 
      role.toUpperCase() === 'ADMIN'
    );

    if (!hasAdminRole) {
      return <Navigate 
        to="/dashboard" 
        state={{ 
          error: '관리자 권한이 필요합니다.' 
        }} 
        replace 
      />;
    }
  }

  return <>{children}</>;
};

// Convenience component for admin-only routes
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
}; 