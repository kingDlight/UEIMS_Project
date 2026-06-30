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
const EnterpriseProfileTab = React.lazy(() => import('./tabs/EnterpriseProfileTab').then(m => ({ default: m.EnterpriseProfileTab })));
const JobPostManagementTab = React.lazy(() => import('./tabs/JobPostManagementTab').then(m => ({ default: m.JobPostManagementTab })));
const AssignedStudentsTab = React.lazy(() => import('./tabs/AssignedStudentsTab').then(m => ({ default: m.AssignedStudentsTab })));
const StudentQualityReportTab = React.lazy(() => import('./tabs/StudentQualityReportTab').then(m => ({ default: m.StudentQualityReportTab })));
const InterviewScheduleTab = React.lazy(() => import('./tabs/InterviewScheduleTab').then(m => ({ default: m.InterviewScheduleTab })));
const InterviewResultTab = React.lazy(() => import('./tabs/InterviewResultTab').then(m => ({ default: m.InterviewResultTab })));
const InternshipPlanTab = React.lazy(() => import('./tabs/InternshipPlanTab').then(m => ({ default: m.InternshipPlanTab })));
const WeeklyReportReviewTab = React.lazy(() => import('./tabs/WeeklyReportReviewTab').then(m => ({ default: m.WeeklyReportReviewTab })));
const IncidentReportTab = React.lazy(() => import('./tabs/IncidentReportTab').then(m => ({ default: m.IncidentReportTab })));
const NoticesTab = React.lazy(() => import('./tabs/NoticesTab'));

export type EnterprisePageKey =
  | 'dashboard'
  | 'applicants'
  | 'job-posts'
  | 'students'
  | 'quality-report'
  | 'interviews'
  | 'results'
  | 'plans'
  | 'reports'
  | 'incidents'
  | 'evaluation'
  | 'profile'
  | 'notifications'
  | 'notices';

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
    'job-posts': <JobPostManagementTab />,
    students: <AssignedStudentsTab />,
    'quality-report': <StudentQualityReportTab />,
    interviews: <InterviewScheduleTab />,
    results: <InterviewResultTab />,
    plans: <InternshipPlanTab />,
    reports: <WeeklyReportReviewTab />,
    incidents: <IncidentReportTab />,
    evaluation: <EvaluationTab />,
    profile: <EnterpriseProfileTab />,
    notifications: <NoticesTab />,
    notices: <NoticesTab />,
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
