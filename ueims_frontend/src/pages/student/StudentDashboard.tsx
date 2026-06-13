import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import {
  StudentDashboardTab,
  ProfileTab,
  JobBoardTab,
  ApplicationsTab,
  ScheduleTab,
  TrainingPlanTab,
  ReportsTab,
  FinalReportTab,
  EvaluationTab,
  FeedbackTab,
} from './tabs';

export type StudentPageKey = 
  | 'dashboard'
  | 'profile'
  | 'jobs'
  | 'applications'
  | 'schedule'
  | 'training-plan'
  | 'reports'
  | 'feedback'
  | 'final-report'
  | 'evaluation';

export const studentNavItems = navItems;

import { extractUserFromToken } from '@/utils/jwt';

export const StudentDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as StudentPageKey;
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
    dashboard: <StudentDashboardTab />,
    profile: <ProfileTab />,
    jobs: <JobBoardTab />,
    applications: <ApplicationsTab />,
    schedule: <ScheduleTab />,
    'training-plan': <TrainingPlanTab />,
    reports: <ReportsTab />,
    feedback: <FeedbackTab />,
    'final-report': <FinalReportTab />,
    evaluation: <EvaluationTab />,
  };

  return (
    <ModernLayout 
      navItems={studentNavItems} 
      defaultRoute="dashboard" 
      basePath="/student"
    >
      {pages[currentTab] || <StudentDashboardTab />}
    </ModernLayout>
  );
};
