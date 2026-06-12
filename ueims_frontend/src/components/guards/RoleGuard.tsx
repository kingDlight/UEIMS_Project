import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { extractUserFromToken } from '@/utils/jwt';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { token } = useAuthStore();
  const payload = token ? extractUserFromToken(token) : null;
  const roles = payload?.roles || [];

  if (roles.length === 0) return null;

  if (roles.some(role => allowedRoles.includes(role))) {
    return <>{children}</>;
  }

  return null;
};
