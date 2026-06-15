import React from 'react';
import {
  SafetyCertificateOutlined,
  UserOutlined,
  AuditOutlined,
  SettingOutlined,
  BarChartOutlined,
  BellOutlined,
  HomeOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { NavItem } from '@/components/layout/ModernLayout';

// ============================================================
// DESIGN TOKENS — Admin Portal (matches TM CommandCenter palette)
// ============================================================
export const c = {
  brand: '#FF7A30',
  brandHover: '#E86A20',
  brandMuted: 'rgba(255,122,48,0.08)',
  brandSubtle: 'rgba(255,122,48,0.04)',
  brandStrong: '#9B4A10',

  success: '#10B981',
  successMuted: 'rgba(16,185,129,0.08)',
  successText: '#065F46',
  error: '#EF4444',
  errorMuted: 'rgba(239,68,68,0.08)',
  errorText: '#991B1B',
  warning: '#F59E0B',
  warningMuted: 'rgba(245,158,11,0.08)',
  warningText: '#92400E',
  info: '#3B82F6',
  infoMuted: 'rgba(59,130,246,0.08)',
  infoText: '#1E40AF',
  purple: '#8B5CF6',
  purpleMuted: 'rgba(139,92,246,0.08)',

  text: '#1A1A2E',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  surface: '#FFFFFF',
  bg: '#F9FAFB',
  neutralBg: '#F9FAFB',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',

  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,

  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
  shadowBrand: '0 4px 12px rgba(255,122,48,0.25)',
  shadowSuccess: '0 4px 12px rgba(16,185,129,0.25)',
  shadowError: '0 4px 12px rgba(239,68,68,0.25)',
  shadowWarning: '0 4px 12px rgba(245,158,11,0.25)',
};

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: React.createElement(HomeOutlined), roles: ['ADMIN', 'SYSTEM_ADMIN', 'TRAINING_MANAGER', 'ENTERPRISE', 'STUDENT'] },
  { key: 'users', label: 'Users', icon: React.createElement(UserOutlined), roles: ['ADMIN', 'SYSTEM_ADMIN'] },
  { key: 'audit', label: 'Audit Logs', icon: React.createElement(AuditOutlined), roles: ['ADMIN', 'SYSTEM_ADMIN', 'TRAINING_MANAGER'] },
  { key: 'system', label: 'System', icon: React.createElement(SettingOutlined), roles: ['ADMIN', 'SYSTEM_ADMIN'] },
  { key: 'analytics', label: 'Stats', icon: React.createElement(BarChartOutlined), roles: ['ADMIN', 'SYSTEM_ADMIN', 'TRAINING_MANAGER'] },
  { key: 'notifications', label: 'Notices', icon: React.createElement(BellOutlined), roles: ['ADMIN', 'SYSTEM_ADMIN', 'TRAINING_MANAGER', 'ENTERPRISE', 'STUDENT'] },
];
