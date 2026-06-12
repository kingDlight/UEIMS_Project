import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Upload,
  Building2,
  SendHorizontal,
  FileBarChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

// ============================================================
// DESIGN TOKENS — UEIMS Command Center
// ============================================================
export const cc = {
  // Brand
  brand: '#E67E22',
  brandHover: '#D35400',
  brandActive: '#E67E22',
  brandMuted: 'rgba(230, 126, 34, 0.08)',
  brandSubtle: 'rgba(230, 126, 34, 0.04)',
  brandStrong: '#D35400',

  // Semantic
  success: '#10B981',
  successMuted: 'rgba(16, 185, 129, 0.08)',
  successText: '#059669',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.08)',
  errorText: '#DC2626',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.08)',
  warningText: '#D97706',
  info: '#3B82F6',
  infoMuted: 'rgba(59, 130, 246, 0.08)',
  infoText: '#2563EB',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',

  // Surface
  surface: '#FFFFFF',
  bg: '#F8FAFC',
  neutralBg: '#F1F5F9',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  // Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Shadows
  shadowSm: '0 4px 16px rgba(15,23,42,0.04)',
  shadowMd: '0 8px 24px rgba(15,23,42,0.08)',
  shadowLg: '0 12px 32px rgba(15,23,42,0.12)',
  shadowXl: '0 20px 50px rgba(15,23,42,0.15)',
  shadowBrand: '0 8px 22px rgba(230, 126, 34, 0.22)',
  shadowSuccess: '0 8px 22px rgba(16, 185, 129, 0.22)',
  shadowError: '0 8px 22px rgba(239, 68, 68, 0.22)',
  shadowWarning: '0 8px 22px rgba(245, 158, 11, 0.22)',
  shadowInner: 'inset 0 2px 4px rgba(0,0,0,0.04)',
};

// ============================================================
// MOCK DATA — TM Command Center
// ============================================================
const mockIncidents = [
  { id: 1, name: 'Le Van C', studentId: 'CS-2410032', enterprise: 'FPT Software', severity: 'high', type: 'attendance', daysAgo: 2 },
  { id: 2, name: 'Tran Thi B', studentId: 'SE-2410045', enterprise: 'VinBigData', severity: 'medium', type: 'report', daysAgo: 1 },
];

const mockPendingEnterprises = [
  { id: 1, name: 'VinBigData', daysWaiting: 2, sector: 'Healthcare AI' },
  { id: 2, name: 'FPT Software', daysWaiting: 1, sector: 'Software Outsourcing' },
  { id: 3, name: 'Viettel Solutions', daysWaiting: 1, sector: 'Telecom' },
  { id: 4, name: 'NashTech VN', daysWaiting: 3, sector: 'Software Engineering' },
];

const mockWeeklyReports = {
  week: 23,
  submitted: 3,
  pending: 2,
  late: 3,
  notStarted: 0,
  students: [
    { name: 'Le Van C', daysOverdue: 3, status: 'late' },
    { name: 'Nguyen Van A', daysOverdue: 2, status: 'late' },
    { name: 'Pham Thi D', daysOverdue: 1, status: 'late' },
  ],
};

const mockPipeline = {
  eligible: 4,
  applied: 0,
  interviewed: 0,
  placed: 0,
};

const mockTimelineMilestones = [
  { label: 'OJT Start', date: 'May 20', status: 'completed' },
  { label: 'Mid-Review', date: 'Jul 1', status: 'completed' },
  { label: 'OJT End', date: 'Aug 1', status: 'current' },
  { label: 'Grades Due', date: 'Aug 10', status: 'upcoming' },
  { label: 'Lock', date: 'Aug 15', status: 'upcoming' },
];

const mockAlerts = [
  { id: 1, severity: 'high' as const, title: '4 enterprise registrations pending review', meta: 'FPT Software, VinBigData, and 2 others registered this week' },
  { id: 2, severity: 'medium' as const, title: '2 students at risk of missing OJT deadline', meta: 'Le Van C and Nguyen Van A — 3+ days overdue' },
];

const mockQuickActions = [
  { label: 'Import Students', icon: <Upload size={24} />, description: 'Upload eligible student list via Excel', route: 'students' },
  { label: 'Review Enterprises', icon: <Building2 size={24} />, description: 'Approve or reject enterprise registrations', route: 'enterprises' },
  { label: 'Send Reminders', icon: <SendHorizontal size={24} />, description: 'Send weekly report reminders to students', route: 'incidents' },
  { label: 'View Reports', icon: <FileBarChart size={24} />, description: 'View compliance, grades, and rubrics', route: 'reports' },
];

const mockPassRateData = [
  { name: 'Passed', value: 85, color: cc.success },
  { name: 'Failed', value: 15, color: cc.error },
];

const mockMajorData = [
  { name: 'Software Eng', value: 350, color: cc.brand },
  { name: 'Info Assurance', value: 120, color: cc.info },
  { name: 'Graphic Design', value: 80, color: cc.success },
  { name: 'Biz Admin', value: 200, color: cc.warning },
];

const mockGradeData = [
  { name: 'Excellent', count: 140 },
  { name: 'Good', count: 210 },
  { name: 'Average', count: 85 },
  { name: 'Pass', count: 30 },
  { name: 'Fail', count: 12 },
];

// ============================================================
// COLOR UTILITY — hex-to-rgba for ghost style rendering
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

const CardWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className = '', style, onClick, hoverable = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      animate={{
        y: hovered && hoverable ? -2 : 0,
        boxShadow: hovered && hoverable ? cc.shadowMd : cc.shadowSm,
      }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: cc.surface,
        borderRadius: cc.radiusLg,
        border: `1px solid ${cc.borderSubtle}`,
        boxShadow: cc.shadowSm,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

// ============================================================

const Label: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <span
    className={className}
    style={{
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: cc.textMuted,
      ...style,
    }}
  >
    {children}
  </span>
);

const TrendBadge: React.FC<{ direction: 'up' | 'down' | 'neutral'; value: string; color?: string }> = ({ direction, value, color }) => {
  let iconColor = color || cc.textMuted;
  let Icon = MinusCircle;

  if (!color) {
    if (direction === 'up') iconColor = cc.success;
    else if (direction === 'down') iconColor = cc.error;
  }

  if (direction === 'up') Icon = TrendingUp;
  else if (direction === 'down') Icon = TrendingDown;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
      <Icon size={12} color={iconColor} />
      <span style={{ fontSize: 12, fontWeight: 600, color: iconColor }}>{value}</span>
    </div>
  );
};

const SeverityBadge: React.FC<{ label: string; severity: 'critical' | 'high' | 'medium' | 'low' | 'info' }> = ({ label, severity }) => {
  const config: Record<string, { bg: string; color: string; borderColor: string }> = {
    critical: { bg: hexToRgba(cc.error,   0.06), color: cc.error,   borderColor: hexToRgba(cc.error,   0.25) },
    high:     { bg: hexToRgba(cc.warning, 0.06), color: cc.warning, borderColor: hexToRgba(cc.warning, 0.25) },
    medium:   { bg: hexToRgba(cc.info,    0.06), color: cc.info,    borderColor: hexToRgba(cc.info,    0.25) },
    low:      { bg: hexToRgba(cc.textMuted, 0.06), color: cc.textMuted, borderColor: hexToRgba(cc.textMuted, 0.25) },
    info:     { bg: hexToRgba(cc.info,    0.06), color: cc.info,    borderColor: hexToRgba(cc.info,    0.25) },
  };
  const { bg, color, borderColor } = config[severity] ?? config.info;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: cc.radiusMd,
      backgroundColor: bg,
      border: `1px solid ${borderColor}`,
      color,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
};

const StatusDot: React.FC<{ color: string; pulse?: boolean }> = ({ color, pulse = false }) => (
  <span style={{
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 0 3px ${color}20`,
    animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none',
  }} />
);

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'amber' | 'red' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}> = ({ children, onClick, variant = 'primary', fullWidth = false, size = 'md', icon }) => {
  const variants = {
    primary: { bg: cc.brand, text: '#fff', shadow: cc.shadowBrand },
    amber: { bg: cc.warning, text: '#fff', shadow: cc.shadowWarning },
    red: { bg: cc.error, text: '#fff', shadow: cc.shadowError },
    ghost: { bg: 'transparent', text: cc.brand, shadow: 'none' },
  };
  const { bg, text: textColor, shadow } = variants[variant];
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13 },
    lg: { padding: '11px 20px', fontSize: 14 },
  };
  const { padding, fontSize } = sizes[size];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1, boxShadow: shadow }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 600,
        color: textColor,
        background: bg,
        border: variant === 'ghost' ? `1px solid ${cc.border}` : 'none',
        borderRadius: cc.radiusMd,
        boxShadow: variant === 'ghost' ? 'none' : shadow,
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      {children}
      {icon === false ? null : (icon || <ArrowRight size={size === 'sm' ? 12 : 14} />)}
    </motion.button>
  );
};

const TextLink: React.FC<{ children: React.ReactNode; onClick?: () => void; color?: string }> = ({ children, onClick, color }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ opacity: 0.8, x: 2 }}
    transition={{ duration: 0.15 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      fontWeight: 500,
      color: color || cc.brand,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'Inter, -apple-system, sans-serif',
      borderRadius: cc.radiusMd,
    }}
  >
    {children}
    <ArrowRight size={13} />
  </motion.button>
);

// ============================================================
// SECTION B: SEMESTER CONTEXT BAR
// ============================================================
const SemesterContextBar: React.FC = () => (
  <div className="cc-semester-bar" style={{
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}>
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: cc.brandStrong,
        letterSpacing: '0.04em',
      }}>
        SUMMER 2026
      </span>
      <span style={{ color: cc.border, fontSize: 13 }}>·</span>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        color: cc.success,
        backgroundColor: hexToRgba(cc.success, 0.06),
        border: `1px solid ${hexToRgba(cc.success, 0.25)}`,
        padding: '2px 8px',
        borderRadius: cc.radiusFull,
      }}>
        <StatusDot color={cc.success} />
        ACTIVE
      </span>
      <span style={{ color: cc.border, fontSize: 13 }}>·</span>
      <span style={{ fontSize: 12, color: cc.textSecondary }}>
        OJT Day 38 of 56
      </span>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
    >
      <span style={{
        fontSize: 11,
        color: cc.textMuted,
      }}>
        Semester lock
      </span>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: cc.radiusFull,
        backgroundColor: hexToRgba(cc.error, 0.06),
        border: `1px solid ${hexToRgba(cc.error, 0.25)}`,
        color: cc.error,
        fontSize: 11,
        fontWeight: 600,
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cc.error,
          display: 'inline-block',
        }} />
        {' 18 days remaining'}
      </span>
    </motion.div>
  </div>
);

// ============================================================
// SECTION C: ROW 1 — URGENCY CARDS
// ============================================================
const UrgencyCard: React.FC<{
  title: string;
  value: number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  trendColor?: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  body?: React.ReactNode;
  cta?: React.ReactNode;
  ctaVariant?: 'red' | 'amber' | 'ghost';
  delay?: number;
}> = ({ title, value, trend, trendDirection, trendColor, icon, iconColor, iconBg, body, cta, ctaVariant = 'ghost', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay / 1000, ease: [0.32, 0.72, 0, 1] }}
    style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
  >
    <CardWrapper
      hoverable
      style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: cc.radiusMd,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}>
            {icon}
          </div>
          <Label>{title}</Label>
        </div>
      </div>

      {/* Value + Trend */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 40,
          fontWeight: 700,
          color: cc.textPrimary,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </div>
        <TrendBadge direction={trendDirection} value={trend} color={trendColor} />
      </div>

      {/* Body content */}
      {body && (
        <div style={{
          padding: '12px',
          borderRadius: cc.radiusMd,
          background: cc.borderSubtle,
          marginBottom: 16,
        }}>
          {body}
        </div>
      )}

      {/* Divider */}
      {cta && <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />}

      {/* CTA */}
      {cta && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {cta}
        </div>
      )}
    </CardWrapper>
  </motion.div>
);

const UrgencyCardsRow: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => (
  <div className="cc-grid-2" style={{ marginBottom: 16, alignItems: 'stretch' }}>
    {/* Active Incidents */}
    <UrgencyCard
      title="Active Incidents"
      value={2}
      trend="↑ +1 today"
      trendDirection="up"
      trendColor={cc.error}
      icon={<AlertTriangle size={18} />}
      iconColor={cc.error}
      iconBg={cc.errorMuted}
      delay={0}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockIncidents.map((inc) => (
            <div key={inc.id} className="cc-incident-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot color={inc.severity === 'high' ? cc.error : cc.warning} pulse={inc.severity === 'high'} />
                <span style={{ fontSize: 12, fontWeight: 600, color: cc.textPrimary }}>{inc.name}</span>
                <span style={{ fontSize: 11, color: cc.textMuted }}>({inc.studentId})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: cc.textMuted }}>{inc.enterprise}</span>
                <SeverityBadge label={inc.severity.toUpperCase()} severity={inc.severity === 'high' ? 'high' : 'medium'} />
              </div>
            </div>
          ))}
        </div>
      }
      cta={<CTAButton variant="red" size="sm" icon={null} onClick={() => onNavigate('incidents')}>Handle Now</CTAButton>}
      ctaVariant="red"
    />

    {/* Pending Approvals */}
    <UrgencyCard
      title="Pending Approvals"
      value={4}
      trend="↑ +2 today"
      trendDirection="up"
      trendColor={cc.warning}
      icon={<Clock size={18} />}
      iconColor={cc.warning}
      iconBg={cc.warningMuted}
      delay={100}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {mockPendingEnterprises.slice(0, 2).map((ent) => (
            <div key={ent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot color={cc.warning} />
                <span style={{ fontSize: 12, fontWeight: 500, color: cc.textPrimary }}>{ent.name}</span>
              </div>
              <span style={{ fontSize: 11, color: cc.textMuted }}>{ent.daysWaiting}d</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 4 }}>
            +{mockPendingEnterprises.length - 2} more enterprises waiting
          </div>
        </div>
      }
      cta={<CTAButton variant="amber" size="sm" icon={null} onClick={() => onNavigate('enterprises')}>Review Now</CTAButton>}
      ctaVariant="amber"
    />
  </div>
);

// ============================================================
// SECTION D: WEEKLY REPORTS + PIPELINE
// ============================================================
const ReportStatusChip: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: cc.radiusMd,
    backgroundColor: hexToRgba(color, 0.05),
    border: `1px solid ${hexToRgba(color, 0.15)}`,
    flex: 1,
    minWidth: 0,
  }}>
    <div style={{ color, flexShrink: 0 }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        color,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color, opacity: 0.8, marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  </div>
);

const WeeklyReportsCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { week, submitted, pending, late, notStarted, students } = mockWeeklyReports;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: cc.radiusMd,
              background: `${cc.info}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cc.info,
            }}>
              <FileBarChart size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>Weekly Reports</div>
              <div style={{ fontSize: 12, color: cc.textMuted }}>Week {week} · Jun 2–8</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: cc.radiusFull,
              backgroundColor: hexToRgba(cc.success, 0.06),
              border: `1px solid ${hexToRgba(cc.success, 0.2)}`,
              color: cc.success,
              fontSize: 10,
              fontWeight: 600,
            }}>
              Deadline: Sun 11:59 PM
            </span>
          </div>
        </div>

        {/* 2x2 Status Grid */}
        <div className="cc-grid-4" style={{ marginBottom: 16 }}>
          <ReportStatusChip
            icon={<CheckCircle2 size={16} />}
            label="Submitted"
            value={submitted}
            color={cc.success}
          />
          <ReportStatusChip
            icon={<Clock size={16} />}
            label="Pending"
            value={pending}
            color={cc.info}
          />
          <ReportStatusChip
            icon={<AlertTriangle size={16} />}
            label="Late"
            value={late}
            color={cc.error}
          />
          <ReportStatusChip
            icon={<MinusCircle size={16} />}
            label="Not Started"
            value={notStarted}
            color={cc.textMuted}
          />
        </div>

        {/* Students needing attention */}
        {students.length > 0 && (
          <div style={{
            padding: '12px',
            borderRadius: cc.radiusMd,
            backgroundColor: hexToRgba(cc.error, 0.05),
            marginBottom: 14,
            border: `1px solid ${hexToRgba(cc.error, 0.15)}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: cc.error, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Students needing attention
            </div>
            {students.map((s, i) => (
              <div key={s.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: i < students.length - 1 ? `1px solid ${cc.error}15` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StatusDot color={cc.error} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: cc.textPrimary }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 11, color: cc.error, opacity: 0.8 }}>
                  {s.daysOverdue} days overdue
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: cc.borderSubtle, marginBottom: 14 }} />

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextLink color={cc.brand} onClick={() => onNavigate('reports')}>View all reports</TextLink>
          <CTAButton variant="primary" size="sm" icon={null} onClick={() => onNavigate('incidents')}>Send Warnings ({late})</CTAButton>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

const PlacementPipelineCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { eligible, applied, interviewed, placed } = mockPipeline;
  const total = eligible || 1;
  const stages = [
    { label: 'ELIGIBLE', value: eligible, color: cc.info },
    { label: 'APPLIED', value: applied, color: cc.warning },
    { label: 'INTERVIEWED', value: interviewed, color: cc.brand },
    { label: 'PLACED', value: placed, color: cc.success },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: cc.radiusMd,
            background: `${cc.brand}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cc.brand,
          }}>
            <TrendingUp size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>Placement Pipeline</div>
            <div style={{ fontSize: 12, color: cc.textMuted }}>Summer 2026</div>
          </div>
        </div>

        {/* Funnel */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 16 }}>
          {stages.map((stage, i) => (
            <React.Fragment key={stage.label}>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 4px',
                borderRadius: cc.radiusMd,
                background: `${stage.color}10`,
                border: `1px solid ${stage.color}25`,
                gap: 4,
              }}>
                <span style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: stage.value === 0 ? cc.textMuted : stage.color,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}>
                  {stage.value}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: stage.value === 0 ? cc.textMuted : `${stage.color}cc`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                }}>
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px',
                  color: cc.textMuted,
                }}>
                  <ArrowRight size={12} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6,
          borderRadius: cc.radiusFull,
          background: cc.borderSubtle,
          overflow: 'hidden',
          marginBottom: 14,
        }}>
          <div style={{
            height: '100%',
            width: `${(applied / total) * 100}%`,
            background: cc.brand,
            borderRadius: cc.radiusFull,
            transition: 'width 0.6s ease',
          }} />
        </div>

        {/* Warning Banner */}
        {applied === 0 && (
          <div style={{
            padding: '10px 12px',
            borderRadius: cc.radiusMd,
            background: cc.warningMuted,
            border: `1px solid ${cc.warning}30`,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <AlertTriangle size={14} color={cc.warning} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: cc.warningText }}>No applications yet</div>
              <div style={{ fontSize: 11, color: cc.warningText, opacity: 0.8, marginTop: 2 }}>
                {eligible} eligible students waiting for positions
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: cc.borderSubtle, marginBottom: 14 }} />

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TextLink color={cc.brand} onClick={() => onNavigate('enterprises')}>View Enterprises</TextLink>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

const CompliancePipelineRow: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => (
  <div className="cc-grid-pipeline" style={{ marginBottom: 16, alignItems: 'stretch' }}>
    <WeeklyReportsCard onNavigate={onNavigate} />
    <PlacementPipelineCard onNavigate={onNavigate} />
  </div>
);

// ============================================================
// SECTION E: QUICK ACTIONS
// ============================================================
const QuickActionsRow: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
    style={{ marginBottom: 16 }}
  >
    <div style={{
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: cc.textMuted,
      marginBottom: 10,
      paddingLeft: 2,
    }}>
      Quick Actions
    </div>
    <div className="cc-grid-4" style={{ alignItems: 'stretch' }}>
      {mockQuickActions.map((action, i) => (
        <div key={action.label} style={{ display: 'flex', flexDirection: 'column' }}>
        <motion.div
          onClick={() => action.route && onNavigate(action.route)}
          whileHover={{ y: -3, boxShadow: cc.shadowMd }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: cc.surface,
            borderRadius: cc.radiusLg,
            border: `1px solid ${cc.borderSubtle}`,
            boxShadow: cc.shadowSm,
            padding: '16px 16px 14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle brand tint on hover */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `${cc.brand}04`,
            opacity: 0,
            transition: 'opacity 0.15s',
          }} />

          <div style={{
            width: 40,
            height: 40,
            borderRadius: cc.radiusMd,
            background: `${cc.brand}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cc.brand,
            position: 'relative',
          }}>
            {action.icon}
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: cc.textPrimary,
              marginBottom: 2,
            }}>
              {action.label}
            </div>
            <div style={{
              fontSize: 11,
              color: cc.textMuted,
              lineHeight: 1.4,
            }}>
              {action.description}
            </div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            color: cc.brand,
            opacity: 0.6,
          }}>
            <ArrowRight size={14} />
          </div>
        </motion.div>
        </div>
      ))}
    </div>
  </motion.div>
);

// ============================================================
// SECTION F: TIMELINE
// ============================================================
const TimelineCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
    style={{ display: 'flex', flexDirection: 'column' }}
  >
    <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: cc.radiusMd,
          background: `${cc.info}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: cc.info,
        }}>
          <Calendar size={16} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>Semester Timeline</div>
          <div style={{ fontSize: 12, color: cc.textMuted }}>Summer 2026 · May 20 – Aug 15</div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingBottom: 24 }}>
        {/* Line */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 20,
          right: 20,
          height: 2,
          background: cc.borderSubtle,
          zIndex: 0,
        }} />
        {/* Filled portion (up to current) */}
        {(() => {
          const total = mockTimelineMilestones.length;
          const currentIdx = mockTimelineMilestones.findIndex(m => m.status === 'current');
          const filledPercent = total > 1 ? (currentIdx / (total - 1)) * 100 : 0;
          return (
            <div style={{
              position: 'absolute',
              top: 14,
              left: 20,
              width: `calc(${filledPercent}% - 20px)`,
              height: 2,
              background: `linear-gradient(90deg, ${cc.success}, ${cc.warning})`,
              zIndex: 1,
            }} />
          );
        })()}

        {/* Nodes */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
        }}>
          {mockTimelineMilestones.map((milestone, i) => {
            const isCompleted = milestone.status === 'completed';
            const isCurrent = milestone.status === 'current';
            let nodeColor = cc.textMuted;
            let NodeIcon = MinusCircle;
            let nodeBg = cc.borderSubtle;
            let labelColor = cc.textMuted;

            if (isCompleted) {
              nodeColor = cc.success;
              NodeIcon = CheckCircle2;
              nodeBg = cc.successMuted;
              labelColor = cc.successText;
            } else if (isCurrent) {
              nodeColor = cc.warning;
              NodeIcon = Activity;
              nodeBg = cc.warningMuted;
              labelColor = cc.warningText;
            }

            return (
              <div key={milestone.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: nodeBg,
                    border: `2px solid ${nodeColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? `0 0 0 4px ${cc.warning}20` : 'none',
                  }}>
                    <NodeIcon size={12} color={nodeColor} />
                  </div>
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        border: `2px solid ${cc.warning}`,
                      }}
                    />
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: isCurrent ? 700 : 500,
                    color: labelColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    marginBottom: 2,
                  }}>
                    {milestone.label}
                  </div>
                  <div style={{ fontSize: 10, color: cc.textMuted }}>{milestone.date}</div>
                </div>
                {isCurrent && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 6 }}>
                    <div style={{ width: 1, height: 8, background: cc.warning, marginBottom: 2, opacity: 0.5 }} />
                    <span style={{ fontSize: 11, color: cc.warning, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      ← You are here →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TextLink color={cc.brand} onClick={() => onNavigate('calendar')}>Edit timeline</TextLink>
      </div>
    </CardWrapper>
  </motion.div>
);

const AlertItem: React.FC<{
  severity: 'high' | 'medium' | 'low';
  title: string;
  meta?: string;
  delay?: number;
}> = ({ severity, title, meta, delay = 0 }) => {
  const config = {
    high:   { dot: cc.error,   label: 'HIGH',   labelColor: cc.error   },
    medium: { dot: cc.warning, label: 'MED',    labelColor: cc.warning },
    low:    { dot: cc.info,    label: 'LOW',    labelColor: cc.info    },
  };
  const { dot, label, labelColor } = config[severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        borderRadius: cc.radiusMd,
        backgroundColor: hexToRgba(dot, 0.06),
        border: `1px solid ${hexToRgba(dot, 0.2)}`,
        cursor: 'pointer',
        transition: 'background-color 0.12s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = hexToRgba(dot, 0.1))}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = hexToRgba(dot, 0.06))}
    >
      <div style={{ paddingTop: 2, flexShrink: 0 }}>
        <StatusDot color={dot} pulse={severity === 'high'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: labelColor,
            backgroundColor: hexToRgba(labelColor, 0.08),
            border: `1px solid ${hexToRgba(labelColor, 0.2)}`,
            padding: '2px 7px',
            borderRadius: cc.radiusMd,
            fontFamily: 'Inter, sans-serif',
          }}>
            {label}
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: cc.textPrimary, lineHeight: 1.4, marginBottom: 3 }}>
          {title}
        </div>
        {meta && (
          <div style={{ fontSize: 11, color: cc.textMuted, lineHeight: 1.4 }}>
            {meta}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <ArrowRight size={14} color={cc.textMuted} />
      </div>
    </motion.div>
  );
};

const RecentAlertsCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
    style={{ display: 'flex', flexDirection: 'column' }}
  >
    <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: cc.radiusMd,
            background: `${cc.warning}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cc.warning,
          }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>Recent Alerts</div>
            <div style={{ fontSize: 12, color: cc.textMuted }}>{mockAlerts.length} active alerts</div>
          </div>
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: cc.textMuted,
          background: cc.borderSubtle,
          padding: '2px 8px',
          borderRadius: cc.radiusFull,
        }}>
          LIVE
        </span>
      </div>

      {/* Chart bars replaced later */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {mockAlerts.map((alert, i) => (
          <AlertItem
            key={alert.id}
            severity={alert.severity}
            title={alert.title}
            meta={alert.meta}
            delay={400 + i * 100}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextLink color={cc.brand} onClick={() => onNavigate('incidents')}>See all alerts</TextLink>
        <button
          style={{
            fontSize: 11,
            color: cc.textMuted,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            borderRadius: cc.radiusMd,
          }}
        >
          Mark all as read
        </button>
      </div>
    </CardWrapper>
  </motion.div>
);

// ============================================================
// SECTION G: ANALYTICS (UC-26)
// ============================================================
const AnalyticsRow: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
    style={{ marginBottom: 16 }}
  >
    <div style={{
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: cc.textMuted,
      marginBottom: 10,
      paddingLeft: 2,
    }}>
      General Statistical Dashboard
    </div>
    <div className="cc-grid-3" style={{ alignItems: 'stretch' }}>
      {/* Pass Rate */}
      <CardWrapper style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, marginBottom: 16 }}>Interview Pass Rate</div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={mockPassRateData} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                {mockPassRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: cc.shadowSm }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardWrapper>

      {/* Major Distribution */}
      <CardWrapper style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, marginBottom: 16 }}>Major Distribution</div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={mockMajorData} outerRadius={75} dataKey="value" stroke="none" label={false}>
                {mockMajorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: cc.shadowSm }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardWrapper>

      {/* Grade Distribution */}
      <CardWrapper style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, marginBottom: 16 }}>OJT Grade Distribution</div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockGradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cc.borderSubtle} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: cc.textMuted }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: cc.textMuted }} />
              <RechartsTooltip cursor={{ fill: cc.neutralBg }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: cc.shadowSm }} />
              <Bar dataKey="count" fill={cc.brand} radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardWrapper>
    </div>
  </motion.div>
);

// ============================================================
// MAIN COMMAND CENTER COMPONENT
// ============================================================
export const CommandCenterDashboard: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(`/tm-dashboard/${route}`);
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Main Content */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px 40px',
      }}>
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Semester Context Bar */}
              <SemesterContextBar />

              {/* ROW 1: Urgency Cards */}
              <UrgencyCardsRow onNavigate={handleNavigate} />

              {/* ROW 2: Weekly Reports + Pipeline */}
              <CompliancePipelineRow onNavigate={handleNavigate} />

              {/* ROW 3: Quick Actions */}
              <QuickActionsRow onNavigate={handleNavigate} />

              {/* ROW 4: Analytics (UC-26) */}
              <AnalyticsRow />

              {/* ROW 5: Timeline + Alerts */}
              <div className="cc-grid-2" style={{ alignItems: 'stretch' }}>
                <TimelineCard onNavigate={handleNavigate} />
                <RecentAlertsCard onNavigate={handleNavigate} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyframe for pulsing dot */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .cc-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .cc-grid-pipeline {
          display: grid;
          grid-template-columns: 7fr 5fr;
          gap: 16px;
        }
        .cc-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .cc-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .cc-grid-pipeline {
            grid-template-columns: 1fr;
          }
          .cc-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .cc-grid-2, .cc-grid-3 {
            grid-template-columns: 1fr;
          }
          .cc-grid-4 {
            grid-template-columns: 1fr;
          }
          .cc-semester-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .cc-semester-bar > div {
            flex-wrap: wrap;
          }
          .cc-incident-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .cc-incident-row > div:last-child {
            align-self: flex-start !important;
            margin-top: -4px;
            padding-left: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CommandCenterDashboard;
