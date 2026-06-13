import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import { ApplicantKanbanTab } from './tabs/ApplicantKanbanTab';
import { EvaluationTab } from './tabs/EvaluationTab';
import { extractUserFromToken } from '@/utils/jwt';

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
      {pages[currentTab] || <ApplicantKanbanTab />}
    </ModernLayout>
  );
};
