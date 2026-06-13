import React from 'react';
import {
  TeamOutlined,
  ProjectOutlined,
  StarOutlined,
  BarChartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { NavItem } from '@/components/layout/ModernLayout';

export const c = {
  brand: '#E67E22',
  brandHover: '#D35400',
  brandMuted: '#fff0e6',
  success: '#22c55e',
  successMuted: '#dcfce7',
  error: '#ef4444',
  errorMuted: '#fee2e2',
  warning: '#f59e0b',
  warningMuted: '#fef3c7',
  info: '#3b82f6',
  infoMuted: '#dbeafe',
  text: '#1e293b',
  textMuted: '#64748b',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  bgLight: '#f5f7fa',
  radiusMd: 8,
  radiusLg: 12,
  radiusFull: 9999,
};

export const navItems: NavItem[] = [
  { key: 'applicants', label: 'Applicants', icon: React.createElement(TeamOutlined), roles: ['ENTERPRISE'] },
  { key: 'evaluation', label: 'Evaluation', icon: React.createElement(StarOutlined), roles: ['ENTERPRISE'] },
  { key: 'reports', label: 'Reports', icon: React.createElement(ProjectOutlined), roles: ['ENTERPRISE'] },
  { key: 'analytics', label: 'Analytics', icon: React.createElement(BarChartOutlined), roles: ['ENTERPRISE'] },
  { key: 'notifications', label: 'Notices', icon: React.createElement(BellOutlined), roles: ['ENTERPRISE', 'STUDENT', 'TRAINING_MANAGER'] },
];
