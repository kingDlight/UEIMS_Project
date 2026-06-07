import React from 'react';
import {
  AlertOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  SnippetsOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { NavItem, PageKey, ThemeColors } from './types';

export const c: ThemeColors = {
  bg: '#e8ecf2',
  bgLight: '#f5f7fa',
  gradient: 'linear-gradient(135deg, #fff5ed, #ffe8d6)',
  primary: '#E96500',
  primaryLight: '#FF8533',
  primaryDark: '#C45200',
  primaryMuted: '#fff0e6',
  secondary: '#271c45',
  cardOrange: '#ffdfcf',
  cardPeach: '#fff0e6',
  cardYellow: '#fff8e6',
  cardGreen: '#e8f5e9',
  cardBlue: '#e3f2fd',
  cardPurple: '#f3e5f5',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  shadow: '0 30px 60px rgba(233, 101, 0, 0.15)',
  borderRadius: 16,
  border: '#e2e8f0',
};

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: React.createElement(BarChartOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN', 'ENTERPRISE', 'STUDENT'] },
  { key: 'enterprises', label: 'Enterprise', icon: React.createElement(BankOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN'] },
  { key: 'students', label: 'Students', icon: React.createElement(TeamOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN'] },
  { key: 'ojt', label: 'OJT', icon: React.createElement(FileProtectOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN', 'ENTERPRISE', 'STUDENT'] },
  { key: 'analytics', label: 'Stats', icon: React.createElement(TrophyOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN'] },
  { key: 'incidents', label: 'Incidents', icon: React.createElement(AlertOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN', 'ENTERPRISE'] },
  { key: 'reports', label: 'Reports', icon: React.createElement(FileTextOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN', 'ENTERPRISE', 'STUDENT'] },
  { key: 'weekly-reports', label: 'Weekly Reports', icon: React.createElement(SnippetsOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN', 'ENTERPRISE', 'STUDENT'] },
  { key: 'calendar', label: 'Semester', icon: React.createElement(CalendarOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN'] },
  { key: 'notifications', label: 'Notices', icon: React.createElement(BellOutlined), roles: ['TRAINING_MANAGER', 'SYSTEM_ADMIN', 'ENTERPRISE', 'STUDENT'] },
];

export const defaultPage: PageKey = 'dashboard';
