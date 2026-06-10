import React from 'react';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BookOutlined,
  UploadOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';

// ============================================================
// DESIGN TOKENS — Student Portal (ALIGNED with Training Manager)
// ============================================================
export const cc = {
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
  successMuted: '#dcfce7',
  successText: '#166534',
  warning: '#f59e0b',
  warningMuted: '#fef3c7',
  warningText: '#92400e',
  danger: '#ef4444',
  dangerMuted: '#fee2e2',
  dangerText: '#991b1b',
  info: '#3b82f6',
  infoMuted: '#dbeafe',
  infoText: '#1e40af',
  purple: '#8b5cf6',
  shadow: '0 30px 60px rgba(233, 101, 0, 0.15)',
  borderRadius: 16,
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  surface: '#ffffff',

  // Semantic shadows
  shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 10px 20px rgba(0,0,0,0.08)',
  shadowXl: '0 20px 40px rgba(0,0,0,0.10)',
  shadowBrand: '0 4px 12px rgba(233,101,0,0.25)',
  shadowSuccess: '0 4px 12px rgba(34,197,94,0.25)',
  shadowError: '0 4px 12px rgba(239,68,68,0.25)',
  shadowWarning: '0 4px 12px rgba(245,158,11,0.25)',

  // Radius
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radius2xl: 22,
  radiusFull: 9999,
};

// ============================================================
// HELPERS
// ============================================================
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// NAV ITEMS — Student specific
// ============================================================
export type StudentTabKey = 
  | 'dashboard'
  | 'profile'
  | 'jobs'
  | 'applications'
  | 'schedule'
  | 'training-plan'
  | 'reports'
  | 'feedback'
  | 'settings';

export interface StudentNavItem {
  key: StudentTabKey;
  label: string;
  icon: React.ReactNode;
}

export const studentNavItems: StudentNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: React.createElement(CalendarOutlined) },
  { key: 'profile', label: 'Profile', icon: React.createElement(UserOutlined) },
  { key: 'jobs', label: 'Job Board', icon: React.createElement(TrophyOutlined) },
  { key: 'applications', label: 'Applications', icon: React.createElement(FileTextOutlined) },
  { key: 'schedule', label: 'Interview', icon: React.createElement(CalendarOutlined) },
  { key: 'training-plan', label: 'Training Plan', icon: React.createElement(BookOutlined) },
  { key: 'reports', label: 'Reports', icon: React.createElement(FileTextOutlined) },
  { key: 'feedback', label: 'Feedback', icon: React.createElement(CheckCircleOutlined) },
  { key: 'settings', label: 'Settings', icon: React.createElement(UserOutlined) },
];
