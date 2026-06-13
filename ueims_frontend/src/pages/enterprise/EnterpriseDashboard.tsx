import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import { Spin } from 'antd';
import { extractUserFromToken } from '@/utils/jwt';

const ApplicantKanbanTab = React.lazy(() => import('./tabs/ApplicantKanbanTab').then(m => ({ default: m.ApplicantKanbanTab })));
const EvaluationTab = React.lazy(() => import('./tabs/EvaluationTab').then(m => ({ default: m.EvaluationTab })));

export type EnterprisePageKey = 'applicants' | 'evaluation' | 'reports' | 'analytics' | 'notifications';

export const enterpriseNavItems = navItems;

export const EnterpriseDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'applicants') as EnterprisePageKey;
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
    applicants: <ApplicantKanbanTab />,
    evaluation: <EvaluationTab />,
    reports: <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#64748b', textAlign: 'center' }}>Reports — Coming Soon</div>,
    analytics: <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#64748b', textAlign: 'center' }}>Analytics — Coming Soon</div>,
    notifications: <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', color: '#64748b', textAlign: 'center' }}>Notifications — Coming Soon</div>,
  };

  return (
    <ModernLayout
      navItems={enterpriseNavItems}
      defaultRoute="applicants"
      basePath="/enterprise-dashboard"
    >
      <React.Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%' }}>
          <Spin size="large" />
        </div>
      }>
        {pages[currentTab] || <ApplicantKanbanTab />}
      </React.Suspense>
    </ModernLayout>
  );
};
