import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { navItems } from './training-manager/constants';
import type { PageKey } from './training-manager/types';
import { Spin } from 'antd';
import { ModernLayout } from '@/components/layout/ModernLayout';

const CommandCenterDashboard = React.lazy(() => import('./training-manager/tabs/CommandCenterDashboard').then(m => ({ default: m.CommandCenterDashboard })));
const EnterpriseTab = React.lazy(() => import('./training-manager/tabs/EnterpriseTab').then(m => ({ default: m.EnterpriseTab })));
const StudentsTab = React.lazy(() => import('./training-manager/tabs/StudentsTab').then(m => ({ default: m.StudentsTab })));
const OJTTab = React.lazy(() => import('./training-manager/tabs/OJTTab').then(m => ({ default: m.OJTTab })));
const StatsTab = React.lazy(() => import('./training-manager/tabs/StatsTab').then(m => ({ default: m.StatsTab })));
const IncidentsTab = React.lazy(() => import('./training-manager/tabs/IncidentsTab').then(m => ({ default: m.IncidentsTab })));
const ReportsTab = React.lazy(() => import('./training-manager/tabs/ReportsTab').then(m => ({ default: m.ReportsTab })));
const SemesterTab = React.lazy(() => import('./training-manager/tabs/SemesterTab').then(m => ({ default: m.SemesterTab })));
const NoticesTab = React.lazy(() => import('./training-manager/tabs/NoticesTab').then(m => ({ default: m.NoticesTab })));
const WeeklyReportsTab = React.lazy(() => import('./training-manager/tabs/WeeklyReportsTab').then(m => ({ default: m.WeeklyReportsTab })));
const AtRiskStudentsTab = React.lazy(() => import('./training-manager/tabs/AtRiskStudentsTab').then(m => ({ default: m.AtRiskStudentsTab })));

import { extractUserFromToken } from '@/utils/jwt';

export const TrainingManagerDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as PageKey;

  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = extractUserFromToken(token);
  const roles = payload?.roles || [];



  // Redirect if no role
  if (roles.length === 0) {
    return <Navigate to="/no-role" replace />;
  }

  if (roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || roles.includes('ENTERPRISE') || roles.includes('ROLE_ENTERPRISE')) {
    return <Navigate to={`/student/${tab || 'dashboard'}`} replace />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <CommandCenterDashboard />,
    enterprises: <EnterpriseTab />,
    students: <StudentsTab />,
    ojt: <OJTTab />,
    analytics: <StatsTab />,
    incidents: <IncidentsTab />,
    'system-reports': <ReportsTab />,
    'weekly-reports': <WeeklyReportsTab />,
    calendar: <SemesterTab />,
    notifications: <NoticesTab />,
    'at-risk': <AtRiskStudentsTab />,
  };

  const allowedItem = navItems.find((item) => item.key === currentTab);

  if (!allowedItem || (allowedItem.roles && !roles.some((r: string) => allowedItem.roles?.includes(r)))) {
    // Redirect to the first available tab for this role
    const firstAllowed = navItems.find((item) => !item.roles || roles.some((r: string) => item.roles?.includes(r)));
    if (firstAllowed) {
      return <Navigate to={`/training-manager/${firstAllowed.key}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <ModernLayout navItems={navItems} defaultRoute="dashboard" basePath="/training-manager">
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
