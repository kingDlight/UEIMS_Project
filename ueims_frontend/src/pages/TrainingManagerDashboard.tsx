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

export const TrainingManagerDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as PageKey;

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

  const { currentRole } = useAuthStore();
  const allowedItem = navItems.find((item) => item.key === currentTab);

  if (!allowedItem || (allowedItem.roles && currentRole && !allowedItem.roles.includes(currentRole))) {
    // Redirect to the first available tab for this role
    const firstAllowed = navItems.find((item) => !item.roles || (currentRole && item.roles.includes(currentRole)));
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
