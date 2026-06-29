import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import { useStudentProfileQuery } from '@/hooks/useStudentProfile';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
const StudentDashboardTab = React.lazy(() => import('./tabs/DashboardTab').then(m => ({ default: m.StudentDashboardTab })));
const ProfileTab = React.lazy(() => import('./tabs/ProfileTab').then(m => ({ default: m.ProfileTab })));
const JobBoardTab = React.lazy(() => import('./tabs/JobBoardTab').then(m => ({ default: m.JobBoardTab })));
const ApplicationsTab = React.lazy(() => import('./tabs/ApplicationsTab').then(m => ({ default: m.ApplicationsTab })));
const ScheduleTab = React.lazy(() => import('./tabs/ScheduleTab').then(m => ({ default: m.ScheduleTab })));
const TrainingPlanTab = React.lazy(() => import('./tabs/TrainingPlanTab').then(m => ({ default: m.TrainingPlanTab })));
const ReportsTab = React.lazy(() => import('./tabs/ReportsTab').then(m => ({ default: m.ReportsTab })));
const FinalReportTab = React.lazy(() => import('./tabs/FinalReportTab').then(m => ({ default: m.FinalReportTab })));
const EvaluationTab = React.lazy(() => import('./tabs/EvaluationTab').then(m => ({ default: m.EvaluationTab })));
const FeedbackTab = React.lazy(() => import('./tabs/FeedbackTab').then(m => ({ default: m.FeedbackTab })));
const HistoryTab = React.lazy(() => import('./tabs/HistoryTab').then(m => ({ default: m.HistoryTab })));

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
  | 'evaluation'
  | 'history';

import { extractUserFromToken } from '@/utils/jwt';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchJobs, prefetchApplications } from '@/hooks/useStudentDashboardQueries';

export const StudentDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const currentTab = (tab || 'dashboard') as StudentPageKey;
  const { token } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useStudentProfileQuery();
  const [hasActivePlacement, setHasActivePlacement] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;
    EnterpriseAssignmentService.getMyAssignment()
      .then(res => {
        const data = res.data?.result ?? res.data;
        setHasActivePlacement(!!data);
      })
      .catch(() => setHasActivePlacement(false));
  }, [token]);

  const handlePrefetch = (key: string) => {
    switch (key) {
      case 'jobs':
        prefetchJobs(queryClient);
        break;
      case 'applications':
        prefetchApplications(queryClient);
        break;
      // Other tabs can be added here if needed
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const payload = extractUserFromToken(token);
  const roles = payload?.roles || [];

  if (roles.length === 0) {
    return <Navigate to="/no-role" replace />;
  }

  // Use the profile's currentSemester as source of truth — never default to 5
  const currentSemester = profile?.currentSemester;

  const getFilteredNavItems = (sem: number | undefined | null, hasPlacement: boolean) => {
    if (sem == null) return navItems;
    // Semester 1-4: browse only -> dashboard, profile, jobs
    if (sem >= 1 && sem <= 4) {
      return navItems.filter(item => ['dashboard', 'profile', 'jobs', 'history'].includes(item.key));
    }
    // Semester 5: apply for jobs -> dashboard, profile, jobs, applications, schedule
    if (sem === 5) {
      return navItems.filter(item => ['dashboard', 'profile', 'jobs', 'applications', 'schedule', 'history'].includes(item.key));
    }
    // Semester 6: PLACED -> weekly reports + final report + schedule (in case they have past interviews); NOT PLACED -> job board + applications + schedule
    if (sem === 6) {
      if (hasPlacement) {
        return navItems.filter(item => ['dashboard', 'profile', 'schedule', 'training-plan', 'reports', 'final-report', 'history'].includes(item.key));
      }
      return navItems.filter(item => ['dashboard', 'profile', 'jobs', 'applications', 'schedule', 'history'].includes(item.key));
    }
    // Semester 7-9: view results & feedback -> dashboard, profile, feedback, evaluation
    if (sem >= 7 && sem <= 9) {
      return navItems.filter(item => ['dashboard', 'profile', 'feedback', 'evaluation', 'history'].includes(item.key));
    }
    return navItems;
  };

  const filteredNavItems = getFilteredNavItems(currentSemester, hasActivePlacement);
  const allowedTabs = filteredNavItems.map(item => item.key);

  if (currentSemester != null && currentTab !== 'dashboard' && currentTab !== 'profile' && !allowedTabs.includes(currentTab)) {
    return <Navigate to="/student/dashboard" replace />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <StudentDashboardTab currentSemester={currentSemester ?? 5} hasActivePlacement={hasActivePlacement} />,
    profile: <ProfileTab />,
    jobs: <JobBoardTab />,
    applications: <ApplicationsTab />,
    schedule: <ScheduleTab />,
    'training-plan': <TrainingPlanTab />,
    reports: <ReportsTab />,
    feedback: <FeedbackTab />,
    'final-report': <FinalReportTab />,
    evaluation: <EvaluationTab />,
    history: <HistoryTab />,
  };

  return (
    <ModernLayout 
      navItems={filteredNavItems} 
      defaultRoute="dashboard" 
      basePath="/student"
      onPrefetch={handlePrefetch}
    >
      <React.Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%' }}>
          <Spin size="large" />
        </div>
      }>
        {pages[currentTab] || <StudentDashboardTab currentSemester={currentSemester ?? 5} hasActivePlacement={hasActivePlacement} />}
      </React.Suspense>
    </ModernLayout>
  );
};
