import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import { extractUserFromToken } from '@/utils/jwt';

const EnterpriseDashboardTab = React.lazy(() => import('./tabs/EnterpriseDashboardTab').then(m => ({ default: m.EnterpriseDashboardTab })));
const ApplicantKanbanTab = React.lazy(() => import('./tabs/ApplicantKanbanTab').then(m => ({ default: m.ApplicantKanbanTab })));
const EvaluationTab = React.lazy(() => import('./tabs/EvaluationTab').then(m => ({ default: m.EvaluationTab })));

export type EnterprisePageKey =
  | 'dashboard'
  | 'applicants'
  | 'evaluation'
  | 'reports'
  | 'analytics'
  | 'notifications';

export const enterpriseNavItems = navItems;

export const EnterpriseDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as EnterprisePageKey;
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = extractUserFromToken(token);
  const roles = payload?.roles || [];

  if (roles.length === 0) {
    return <Navigate to="/no-role" replace />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <EnterpriseDashboardTab />,
    applicants: <ApplicantKanbanTab />,
    evaluation: <EvaluationTab />,
    reports: (
      <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#64748b', textAlign: 'center' }}>
        Reports — Coming Soon
      </div>
    ),
    analytics: (
      <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#64748b', textAlign: 'center' }}>
        Analytics — Coming Soon
      </div>
    ),
    notifications: (
      <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#64748b', textAlign: 'center' }}>
        Notifications — Coming Soon
      </div>
    ),
  };

  return (
    <ModernLayout
      navItems={enterpriseNavItems}
      defaultRoute="dashboard"
      basePath="/enterprise-dashboard"
    >
      <React.Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%' }}>
          <Spin size="large" />
        </div>
      }>
        {pages[currentTab] || <EnterpriseDashboardTab />}
      </React.Suspense>
    </ModernLayout>
  );
};
