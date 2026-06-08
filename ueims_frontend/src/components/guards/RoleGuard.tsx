import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { currentRole } = useAuthStore();

  if (!currentRole) return null;

  if (allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }

  return null;
};
