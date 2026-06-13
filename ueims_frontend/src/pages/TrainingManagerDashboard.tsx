import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { navItems } from './training-manager/constants';
import type { PageKey } from './training-manager/types';
import {
  CommandCenterDashboard,
  EnterpriseTab,
  IncidentsTab,
  NoticesTab,
  OJTTab,
  ReportsTab,
  WeeklyReportsTab,
  SemesterTab,
  StatsTab,
  StudentsTab,
} from './training-manager/tabs';
import { ModernLayout } from '@/components/layout/ModernLayout';

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

  // Redirect STUDENT to their own dashboard
  if (roles.includes('STUDENT') || roles.includes('ROLE_STUDENT') || roles.includes('ENTERPRISE') || roles.includes('ROLE_ENTERPRISE')) {
    return <Navigate to={`/student-dashboard/${tab || 'dashboard'}`} replace />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <CommandCenterDashboard />,
    enterprises: <EnterpriseTab />,
    students: <StudentsTab />,
    ojt: <OJTTab />,
    analytics: <StatsTab />,
    incidents: <IncidentsTab />,
    reports: <ReportsTab />,
    'weekly-reports': <WeeklyReportsTab />,
    calendar: <SemesterTab />,
    notifications: <NoticesTab />,
  };

  const allowedItem = navItems.find((item) => item.key === currentTab);

  if (!allowedItem || (allowedItem.roles && !roles.some((r: string) => allowedItem.roles?.includes(r)))) {
    // Redirect to the first available tab for this role
    const firstAllowed = navItems.find((item) => !item.roles || roles.some((r: string) => item.roles?.includes(r)));
    if (firstAllowed) {
      return <Navigate to={`/tm-dashboard/${firstAllowed.key}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <ModernLayout navItems={navItems} defaultRoute="dashboard" basePath="/tm-dashboard">
      {pages[currentTab]}
    </ModernLayout>
  );
};
