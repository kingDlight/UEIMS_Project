import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { ModernLayout } from '@/components/layout/ModernLayout';

import { KanbanTab } from './tabs/KanbanTab';
import { ApplicantsTab } from './tabs/ApplicantsTab';
import { EvaluationTab } from './tabs/EvaluationTab';
import { SupervisionTab } from './tabs/SupervisionTab';

import {
  AppstoreOutlined,
  FileSearchOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const navItems: NavItem[] = [
  { key: 'kanban', label: 'Quản lý ứng viên', icon: <AppstoreOutlined /> },
  { key: 'applicants', label: 'Danh sách ứng viên', icon: <FileSearchOutlined /> },
  { key: 'evaluation', label: 'Chấm điểm', icon: <StarOutlined /> },
  { key: 'supervision', label: 'Giám sát thực tập', icon: <TeamOutlined /> },
];

export const EnterpriseDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { currentRole } = useAuthStore();
  const currentTab = (tab || 'kanban') as string;

  const pages: Record<string, React.ReactNode> = {
    kanban: <KanbanTab />,
    applicants: <ApplicantsTab />,
    evaluation: <EvaluationTab />,
    supervision: <SupervisionTab />,
  };

  if (currentRole !== 'ENTERPRISE') {
    return <div style={{ padding: 40, textAlign: 'center' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  if (!pages[currentTab]) {
    navigate('/enterprise/kanban', { replace: true });
    return null;
  }

  return (
    <ModernLayout navItems={navItems} defaultRoute="kanban" basePath="/enterprise">
      {pages[currentTab]}
    </ModernLayout>
  );
};

export default EnterpriseDashboard;
