import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../services/authService';

interface ProtectedRouteProps {
  requiredRole?: string[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, redirectPath = '/', children }) => {
  const isAuth = AuthService.hasToken();
  const userRole = localStorage.getItem('role');

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && (!userRole || !requiredRole.includes(userRole))) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
