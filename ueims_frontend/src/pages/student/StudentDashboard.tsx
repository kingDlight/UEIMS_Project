import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';

import { ProfileTab } from './tabs/ProfileTab';
import { JobBoardTab } from './tabs/JobBoardTab';
import { ApplicationsTab } from './tabs/ApplicationsTab';
import { InterviewsTab } from './tabs/InterviewsTab';
import { FeedbackTab } from './tabs/FeedbackTab';

import {
  UserOutlined,
  ReadOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  StarOutlined,
} from '@ant-design/icons';

const navItems = [
  { key: 'profile', label: 'Hồ sơ', icon: <UserOutlined /> },
  { key: 'jobs', label: 'Tìm việc', icon: <ReadOutlined /> },
  { key: 'applications', label: 'Đơn của tôi', icon: <FileSearchOutlined /> },
  { key: 'interviews', label: 'Phỏng vấn', icon: <CalendarOutlined /> },
  { key: 'feedback', label: 'Đánh giá DN', icon: <StarOutlined /> },
];

export const StudentDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { currentRole } = useAuthStore();
  const currentTab = (tab || 'profile') as string;

  const pages: Record<string, React.ReactNode> = {
    profile: <ProfileTab />,
    jobs: <JobBoardTab />,
    applications: <ApplicationsTab />,
    interviews: <InterviewsTab />,
    feedback: <FeedbackTab />,
  };

  if (currentRole !== 'STUDENT') {
    return <div style={{ padding: 40, textAlign: 'center' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  if (!pages[currentTab]) {
    navigate('/student/profile', { replace: true });
    return null;
  }

  return (
    <ModernLayout navItems={navItems} defaultRoute="profile" basePath="/student">
      {pages[currentTab]}
    </ModernLayout>
  );
};

export default StudentDashboard;
