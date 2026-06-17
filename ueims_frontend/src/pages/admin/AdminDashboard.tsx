import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import { extractUserFromToken } from '@/utils/jwt';

const AdminDashboardTab = React.lazy(() => import('./tabs/AdminDashboardTab').then(m => ({ default: m.AdminDashboardTab })));
const UsersTab = React.lazy(() => import('./tabs/UsersTab').then(m => ({ default: m.UsersTab })));
const AuditLogTab = React.lazy(() => import('./tabs/AuditLogTab').then(m => ({ default: m.AuditLogTab })));
const AdminSystemTab = React.lazy(() => import('./tabs/AdminSystemTab').then(m => ({ default: m.AdminSystemTab })));
const AdminStatsTab = React.lazy(() => import('./tabs/AdminStatsTab').then(m => ({ default: m.AdminStatsTab })));
const NoticesTab = React.lazy(() => import('./tabs/NoticesTab').then(m => ({ default: m.NoticesTab })));
const RequestLogTab = React.lazy(() => import('./tabs/RequestLogTab').then(m => ({ default: m.RequestLogTab })));

export type AdminPageKey =
  | 'dashboard'
  | 'users'
  | 'audit'
  | 'system'
  | 'analytics'
  | 'notifications'
  | 'request-logs';

export const AdminDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as AdminPageKey;
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = extractUserFromToken(token);
  const roles = payload?.roles || [];

  if (roles.length === 0) {
    return <Navigate to="/no-role" replace />;
  }

  // Only SYSTEM_ADMIN can access this portal

  if (!roles.includes('ADMIN') && !roles.includes('SYSTEM_ADMIN')) {
    // Redirect to appropriate dashboard based on role
    if (roles.includes('TRAINING_MANAGER')) {
      return <Navigate to="/training-manager/dashboard" replace />;
    }
    if (roles.includes('ENTERPRISE')) {
      return <Navigate to="/enterprise-dashboard/dashboard" replace />;
    }
    if (roles.includes('STUDENT')) {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/no-role" replace />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboardTab />,
    users: <UsersTab />,
    audit: <AuditLogTab />,
    system: <AdminSystemTab />,
    analytics: <AdminStatsTab />,
    notifications: <NoticesTab />,
    'request-logs': <RequestLogTab />,
  };

  const allowedItem = navItems.find((item) => item.key === currentTab);

  if (!allowedItem || (allowedItem.roles && !roles.some((r: string) => allowedItem.roles?.includes(r)))) {
    const firstAllowed = navItems.find((item) => !item.roles || roles.some((r: string) => item.roles?.includes(r)));
    if (firstAllowed) {
      return <Navigate to={`/admin/${firstAllowed.key}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <ModernLayout navItems={navItems} defaultRoute="dashboard" basePath="/admin">
      <React.Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%' }}>
          <Spin size="large" />
        </div>
      }>
        {pages[currentTab]}
      </React.Suspense>
    </ModernLayout>
  );
};
