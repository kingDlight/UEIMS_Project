import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from './constants';
import { StudentProfileService } from '@/services/StudentProfileService';
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
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await StudentProfileService.getMyProfile();
        setProfile(res?.data?.result ?? res?.data);
      } catch (err) {
        console.error('Failed to fetch profile in StudentDashboard:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    if (token) {
      fetchProfile();
    } else {
      setProfileLoading(false);
    }
  }, [token]);

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

  const currentSemester = profile?.currentSemester || 5;

  const getFilteredNavItems = (sem: number) => {
    // Semester 1-4: browse only -> dashboard, profile, jobs
    if (sem >= 1 && sem <= 4) {
      return studentNavItems.filter(item => ['dashboard', 'profile', 'jobs'].includes(item.key));
    }
    // Semester 5: apply for jobs -> dashboard, profile, jobs, applications, schedule
    if (sem === 5) {
      return studentNavItems.filter(item => ['dashboard', 'profile', 'jobs', 'applications', 'schedule'].includes(item.key));
    }
    // Semester 6: active internship -> dashboard, profile, training-plan, reports, final-report
    if (sem === 6) {
      return studentNavItems.filter(item => ['dashboard', 'profile', 'training-plan', 'reports', 'final-report'].includes(item.key));
    }
    // Semester 7-9: view results & feedback -> dashboard, profile, feedback, evaluation
    if (sem >= 7 && sem <= 9) {
      return studentNavItems.filter(item => ['dashboard', 'profile', 'feedback', 'evaluation'].includes(item.key));
    }
    return studentNavItems;
  };

  const filteredNavItems = getFilteredNavItems(currentSemester);
  const allowedTabs = filteredNavItems.map(item => item.key);

  if (currentTab !== 'dashboard' && currentTab !== 'profile' && !allowedTabs.includes(currentTab)) {
    return <Navigate to="/student/dashboard" replace />;
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
      navItems={filteredNavItems} 
      defaultRoute="dashboard" 
      basePath="/student"
    >
      {pages[currentTab] || <StudentDashboardTab />}
    </ModernLayout>
  );
};
