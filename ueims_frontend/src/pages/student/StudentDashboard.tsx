import React from 'react';
import { useParams } from 'react-router-dom';
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
  SettingsTab,
} from './tabs';

export type StudentPageKey = 
  | 'dashboard'
  | 'profile'
  | 'jobs'
  | 'applications'
  | 'schedule'
  | 'training-plan'
  | 'reports'
  | 'final-report'
  | 'evaluation'
  | 'feedback'
  | 'settings';

export const studentNavItems = navItems;

export const StudentDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as StudentPageKey;

  const pages: Record<string, React.ReactNode> = {
    dashboard: <StudentDashboardTab />,
    profile: <ProfileTab />,
    jobs: <JobBoardTab />,
    applications: <ApplicationsTab />,
    schedule: <ScheduleTab />,
    'training-plan': <TrainingPlanTab />,
    reports: <ReportsTab />,
    'final-report': <FinalReportTab />,
    evaluation: <EvaluationTab />,
    feedback: <FeedbackTab />,
    settings: <SettingsTab />,
  };

  return (
    <ModernLayout 
      navItems={studentNavItems} 
      defaultRoute="dashboard" 
      basePath="/student-dashboard"
    >
      {pages[currentTab] || <StudentDashboardTab />}
    </ModernLayout>
  );
};
