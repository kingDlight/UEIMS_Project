import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';
import { extractUserFromToken } from '@/utils/jwt';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, token } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const result = await AuthService.introspect(token);
        if (!result.valid) {
          const { refreshToken } = useAuthStore.getState();
          if (refreshToken) {
            try {
              const refreshResult = await AuthService.refreshToken(refreshToken);
              if (refreshResult && refreshResult.accessToken) {
                useAuthStore.getState().setTokens(refreshResult.accessToken, refreshResult.refreshToken);
                setIsValid(true);
              } else {
                useAuthStore.getState().logout();
                setIsValid(false);
              }
            } catch {
              useAuthStore.getState().logout();
              setIsValid(false);
            }
          } else {
            useAuthStore.getState().logout();
            setIsValid(false);
          }
        } else {
          setIsValid(true);
        }
      } catch {
        useAuthStore.getState().logout();
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  if (isValidating) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: 18,
          color: '#E67E22',
        }}
      >
        Authenticating your session…
      </div>
    );
  }

  if (!isAuthenticated || !isValid) {
    return <Navigate to="/login" replace />;
  }

  const payload = token ? extractUserFromToken(token) : null;
  const roles = payload?.roles || [];
  
  if (allowedRoles) {
    const hasAllowedRole = roles.some(role => allowedRoles.includes(role));
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
