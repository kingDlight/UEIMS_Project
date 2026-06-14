import React from 'react';
import {
  TeamOutlined,
  ProjectOutlined,
  StarOutlined,
  BarChartOutlined,
  BellOutlined,
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { NavItem } from '@/components/layout/ModernLayout';

// ============================================================
// DESIGN TOKENS — matches StudentDashboardTab cc object
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const c = {
  brand: '#E67E22',
  brandHover: '#D35400',
  brandMuted: hexToRgba('#E67E22', 0.08),
  brandSubtle: hexToRgba('#E67E22', 0.04),

  success: '#10B981',
  successMuted: hexToRgba('#10B981', 0.08),
  error: '#EF4444',
  errorMuted: hexToRgba('#EF4444', 0.08),
  warning: '#F59E0B',
  warningMuted: hexToRgba('#F59E0B', 0.08),
  info: '#3B82F6',
  infoMuted: hexToRgba('#3B82F6', 0.08),

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',

  surface: '#FFFFFF',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  bgLight: '#F8FAFC',

  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusFull: 9999,

  shadowSm: '0 4px 16px rgba(15,23,42,0.04)',
  shadowMd: '0 8px 24px rgba(15,23,42,0.08)',
  shadowLg: '0 12px 32px rgba(15,23,42,0.12)',
  shadowBrand: '0 8px 22px rgba(230,126,34,0.22)',

  primary: '#E67E22',
};

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: React.createElement(HomeOutlined), roles: ['ENTERPRISE'] },
  { key: 'applicants', label: 'Applicants', icon: React.createElement(TeamOutlined), roles: ['ENTERPRISE'] },
  { key: 'job-posts', label: 'Job Posts', icon: React.createElement(ProjectOutlined), roles: ['ENTERPRISE'] },
  { key: 'evaluation', label: 'Evaluation', icon: React.createElement(StarOutlined), roles: ['ENTERPRISE'] },
  { key: 'reports', label: 'Reports', icon: React.createElement(FileTextOutlined), roles: ['ENTERPRISE'] },
  { key: 'analytics', label: 'Analytics', icon: React.createElement(BarChartOutlined), roles: ['ENTERPRISE'] },
  { key: 'profile', label: 'Profile', icon: React.createElement(UserOutlined), roles: ['ENTERPRISE'] },
  { key: 'notifications', label: 'Notices', icon: React.createElement(BellOutlined), roles: ['ENTERPRISE', 'STUDENT', 'TRAINING_MANAGER'] },
];
