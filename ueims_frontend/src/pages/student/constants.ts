import React from 'react';
import {
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  SnippetsOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  FileProtectOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { NavItem } from '@/components/layout/ModernLayout';

// ============================================================
// DESIGN TOKENS — TM-Aligned Color System (matching StatsTab, StudentsTab, etc.)
// ============================================================
export const cc = {
  bg: '#e8ecf2',
  bgLight: '#f5f7fa',
  gradient: 'linear-gradient(135deg, #fff5ed, #ffe8d6)',
  
  // Brand colors (TM-aligned)
  primary: '#E67E22',
  primaryHover: '#D35400',
  primaryDark: '#C45200',
  primaryMuted: '#fff0e6',
  primarySubtle: '#fff8f0',
  
  secondary: '#271c45',
  cardOrange: '#ffdfcf',
  cardPeach: '#fff0e6',
  cardYellow: '#fff8e6',
  cardGreen: '#e8f5e9',
  cardBlue: '#e3f2fd',
  cardPurple: '#f3e5f5',
  
  // Text colors (TM-aligned)
  text: '#1e293b',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  
  // Semantic colors (TM-aligned)
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
  
  shadow: '0 30px 60px rgba(230, 126, 34, 0.15)',
  borderRadius: 16,
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  surface: '#ffffff',
  neutralBg: '#F9FAFB',

  // Semantic shadows
  shadowSm: '0 1px 3px rgba(0,0,0,.08)',
  shadowMd: '0 4px 6px rgba(0,0,0,.07)',
  shadowLg: '0 10px 15px rgba(0,0,0,.08)',
  shadowXl: '0 20px 40px rgba(0,0,0,.10)',
  shadowBrand: '0 4px 12px rgba(255,122,48,.25)',
  shadowSuccess: '0 4px 12px rgba(16,185,129,.25)',
  shadowError: '0 4px 12px rgba(239,68,68,.25)',
  shadowWarning: '0 4px 12px rgba(245,158,11,.25)',

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
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Alias for backward compatibility
export const st = cc;

// ============================================================
// NAV ITEMS — ModernLayout compatible
// ============================================================
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

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: React.createElement(CalendarOutlined), roles: ['STUDENT'] },
  { key: 'profile', label: 'Profile', icon: React.createElement(UserOutlined), roles: ['STUDENT'] },
  { key: 'jobs', label: 'Job Board', icon: React.createElement(TrophyOutlined), roles: ['STUDENT'] },
  { key: 'applications', label: 'Applications', icon: React.createElement(FileTextOutlined), roles: ['STUDENT'] },
  { key: 'schedule', label: 'Interviews', icon: React.createElement(CalendarOutlined), roles: ['STUDENT'] },
  { key: 'training-plan', label: 'Progress', icon: React.createElement(BookOutlined), roles: ['STUDENT'] },
  { key: 'reports', label: 'Reports', icon: React.createElement(SnippetsOutlined), roles: ['STUDENT'] },
  { key: 'feedback', label: 'Feedback', icon: React.createElement(CheckCircleOutlined), roles: ['STUDENT'] },
  { key: 'final-report', label: 'Final Report', icon: React.createElement(FileProtectOutlined), roles: ['STUDENT'] },
  { key: 'evaluation', label: 'Evaluation', icon: React.createElement(TrophyOutlined), roles: ['STUDENT'] },
  { key: 'history', label: 'History', icon: React.createElement(HistoryOutlined), roles: ['STUDENT'] },
];

export const defaultPage: StudentPageKey = 'dashboard';
