import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    // Verifica se tem token
    if (!AuthService.hasToken()) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Valida o token com o backend
    const validation = await AuthService.validateToken();
    if (!validation.valid) {
      AuthService.removeToken();
    }
    setIsAuthenticated(validation.valid);
    setIsLoading(false);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;

