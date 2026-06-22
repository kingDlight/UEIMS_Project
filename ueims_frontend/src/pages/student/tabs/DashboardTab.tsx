import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  BookOpen,
  Briefcase,
  Star,
  Mail,
} from 'lucide-react';
import { Spin } from 'antd';
import { StudentDashboardService, type StudentDashboardStats } from '@/services/StudentDashboardService';
import { OjtStatusService, type OjtStatusResponse } from '@/services/OjtStatusService';
import { OjtStatusBadge } from '../components/OjtStatusBadge';

export interface DashboardTabProps {
  currentSemester: number;
  hasActivePlacement?: boolean;
}

// ============================================================
// DESIGN TOKENS — Student Command Center (matching TM style)
// ============================================================
const cc = {
  brand: '#E67E22',
  brandHover: '#D35400',
  brandMuted: 'rgba(230, 126, 34, 0.08)',
  brandSubtle: 'rgba(230, 126, 34, 0.04)',

  success: '#10B981',
  successMuted: 'rgba(16, 185, 129, 0.08)',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.08)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.08)',
  info: '#3B82F6',
  infoMuted: 'rgba(59, 130, 246, 0.08)',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',

  surface: '#FFFFFF',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusFull: 9999,

  shadowSm: '0 4px 16px rgba(15,23,42,0.04)',
  shadowMd: '0 8px 24px rgba(15,23,42,0.08)',
  shadowLg: '0 12px 32px rgba(15,23,42,0.12)',
  shadowBrand: '0 8px 22px rgba(230, 126, 34, 0.22)',
  shadowSuccess: '0 8px 22px rgba(16, 185, 129, 0.22)',
  shadowError: '0 8px 22px rgba(239, 68, 68, 0.22)',
  shadowWarning: '0 8px 22px rgba(245, 158, 11, 0.22)',
};

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
  style?: React.CSSProperties;
  hoverable?: boolean;
  onClick?: () => void;
}> = ({ children, style, hoverable = false, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      animate={{
        y: hovered && hoverable ? -2 : 0,
        boxShadow: hovered && hoverable ? cc.shadowMd : cc.shadowSm,
      }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        backgroundColor: '#FFFFFF',
        opacity: 1,
        borderRadius: cc.radiusLg,
        border: `1px solid ${cc.border}`,
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

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: cc.textMuted,
    ...style,
  }}>
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
  variant?: 'primary' | 'amber' | 'red' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', icon, disabled = false }) => {
  const variants: Record<string, { bg: string; text: string; shadow: string }> = {
    primary: { bg: cc.brand, text: '#fff', shadow: cc.shadowBrand },
    amber: { bg: cc.warning, text: '#fff', shadow: cc.shadowWarning },
    red: { bg: cc.error, text: '#fff', shadow: cc.shadowError },
    success: { bg: cc.success, text: '#fff', shadow: cc.shadowSuccess },
    ghost: { bg: 'transparent', text: cc.brand, shadow: 'none' },
  };
  const { bg, text: textColor, shadow } = variants[variant];
  const sizes: Record<string, { padding: string; fontSize: number }> = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13 },
    lg: { padding: '11px 20px', fontSize: 14 },
  };
  const { padding, fontSize } = sizes[size];
  return (
    <motion.button
      onClick={onClick}
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 600,
        color: disabled ? cc.textMuted : textColor,
        background: disabled ? cc.borderSubtle : bg,
        border: variant === 'ghost' ? `1px solid ${cc.border}` : 'none',
        borderRadius: cc.radiusMd,
        boxShadow: disabled ? 'none' : (variant === 'ghost' ? 'none' : shadow),
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: 'auto',
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

const StatChip: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string }> = ({ icon, label, value, color }) => (
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
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 10, color, opacity: 0.8, marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  </div>
);

// ============================================================
// SECTION: SEMESTER CONTEXT BAR
// ============================================================
const SemesterContextBar: React.FC<{ stats: StudentDashboardStats; ojtStatus: OjtStatusResponse | null }> = ({ stats, ojtStatus }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <div style={{
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
        <span style={{ fontSize: 13, fontWeight: 600, color: cc.brand, letterSpacing: '0.04em' }}>
          {stats.semesterName?.toUpperCase() || 'SEMESTER'}
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
          {t('active', 'ACTIVE')}
        </span>
        <span style={{ color: cc.border, fontSize: 13 }}>·</span>
        <span style={{ fontSize: 12, color: cc.textSecondary }}>
          {t('daysRemaining', '{{count}} days remaining', { count: stats.daysRemaining })}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 11, color: cc.textMuted }}>{t('statusLabel', 'Status')}</span>
        {ojtStatus ? (
          <OjtStatusBadge
            status={ojtStatus.ojtStatus}
            label={ojtStatus.statusLabel}
            color={ojtStatus.statusColor}
            isUrgent={ojtStatus.isUrgent}
          />
        ) : (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            borderRadius: cc.radiusFull,
            backgroundColor: hexToRgba(cc.brand, 0.06),
            border: `1px solid ${hexToRgba(cc.brand, 0.25)}`,
            color: cc.brand,
            fontSize: 11,
            fontWeight: 600,
          }}>
            <StatusDot color={cc.brand} />
            {t('ojtInProgress', 'OJT IN PROGRESS')}
          </span>
        )}
      </motion.div>
    </div>
  );
};

const WelcomeCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{ marginBottom: 16 }}
    >
      <CardWrapper style={{ padding: 24, display: 'flex', flexDirection: 'column', backgroundColor: '#FFF8F2', opacity: 1, border: '1px solid #FFE0C2', borderLeft: `4px solid ${cc.brand}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusFull, background: cc.brandMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.brand }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary }}>{t('welcomeUeims', 'Welcome to UEIMS')}</div>
            <div style={{ fontSize: 13, color: cc.textSecondary, marginTop: 4 }}>{t('semesterIntro', 'Semester preparation and internship search starts here.')}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: cc.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
          {t('semester1to4Intro', 'You can browse the job board and prepare your profile while your study schedule is updated.')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CTAButton variant="primary" size="md" icon={false} onClick={() => onNavigate('jobs')}>
            {t('goToJobBoard', 'Go to Job Board')}
          </CTAButton>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

const NoPlacementAlert: React.FC<{
  enterpriseName?: string;
  onNavigate: (route: string) => void;
  riskReason?: string | null;
  contactEmail?: string | null;
  contactName?: string | null;
  daysUntilDeadline?: number | null;
}> = ({ enterpriseName, onNavigate, riskReason, contactEmail, contactName, daysUntilDeadline }) => {
  const { t } = useTranslation(['studentDashboard']);
  const isUrgent = true;

  const handleContactSupport = () => {
    if (contactEmail) {
      const subject = encodeURIComponent('[UEIMS] Yêu cầu hỗ trợ OJT');
      window.location.href = `mailto:${contactEmail}?subject=${subject}`;
    } else {
      window.location.href = 'mailto:training-office@ueims.edu.vn?subject=[UEIMS] Yêu cầu hỗ trợ OJT';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{ marginBottom: 16 }}
    >
      <CardWrapper style={{
        padding: 22,
        border: `1px solid ${cc.warning}`,
        background: hexToRgba(cc.warning, 0.04),
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertTriangle size={26} color={cc.warning} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary, marginBottom: 8 }}>
              {t('noActivePlacementHeading', 'No active placement found')}
            </div>
            <div style={{ fontSize: 14, color: cc.textSecondary, lineHeight: 1.7, marginBottom: 10 }}>
              {riskReason || (
                enterpriseName
                  ? t('noActivePlacementMessageWithEnterprise', 'You are not currently assigned to an internship with {{enterprise}}. Please visit the Job Board to apply.', { enterprise: enterpriseName })
                  : t('noActivePlacementMessage', 'You are not currently assigned to any internship. Please visit the Job Board to apply.')
              )}
            </div>
            {daysUntilDeadline !== null && daysUntilDeadline !== undefined && daysUntilDeadline <= 30 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: cc.warning,
                background: hexToRgba(cc.warning, 0.08),
                border: `1px solid ${hexToRgba(cc.warning, 0.25)}`,
                padding: '3px 10px', borderRadius: cc.radiusFull,
                marginBottom: 14,
              }}>
                <Clock size={12} />
                Còn {daysUntilDeadline} ngày đến hạn kết thúc kỳ
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <CTAButton variant="primary" size="md" icon={false} onClick={() => onNavigate('jobs')}>
                {t('visitJobBoard', 'Visit Job Board')}
              </CTAButton>
              <CTAButton variant="ghost" size="md" icon={<Mail size={13} />} onClick={handleContactSupport}>
                {contactName ? `Liên hệ ${contactName}` : t('contactSupport', 'Contact Support')}
              </CTAButton>
            </div>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

// ============================================================
// SECTION: KPI URGENCY CARDS
// ============================================================
const UrgencyCardsRow: React.FC<{ stats: StudentDashboardStats; onNavigate: (route: string) => void }> = ({ stats, onNavigate }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
      {/* Applications Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0, ease: [0.32, 0.72, 0, 1] }}
      >
        <CardWrapper hoverable style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#EFF6FF', opacity: 1, border: '1px solid #BFDBFE', borderLeft: `4px solid ${cc.info}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, background: cc.infoMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
                <Briefcase size={18} />
              </div>
              <Label>{t('applications', 'Applications')}</Label>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: cc.textPrimary, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {stats.applications}
            </div>
            <TrendBadge direction="neutral" value={t('jobApplicationsTrend', 'Job applications')} />
          </div>
          <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" size="sm" icon={false} onClick={() => onNavigate('jobs')}>{t('browseJobs', 'Browse Jobs')}</CTAButton>
          </div>
        </CardWrapper>
      </motion.div>

      {/* Interviews Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
      >
        <CardWrapper hoverable style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFBEB', opacity: 1, border: '1px solid #FDE68A', borderLeft: `4px solid ${cc.warning}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, background: cc.warningMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.warning }}>
                <Calendar size={18} />
              </div>
              <Label>{t('interviews', 'Interviews')}</Label>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: cc.textPrimary, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {stats.interviews}
            </div>
            <TrendBadge
              direction={stats.interviews > 0 ? 'up' : 'neutral'}
              value={stats.interviews > 0 ? t('scheduledInterviewsTrend', 'Scheduled interviews') : t('noInterviewsTrend', 'No interviews yet')}
            />
          </div>
          <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" size="sm" icon={false} onClick={() => onNavigate('schedule')}>{t('viewSchedule', 'View Schedule')}</CTAButton>
          </div>
        </CardWrapper>
      </motion.div>
    </div>
  );
};

// ============================================================
// SECTION: REPORT STATUS + TRAINING PROGRESS
// ============================================================
const ReportPipelineRow: React.FC<{ stats: StudentDashboardStats; onNavigate: (route: string) => void }> = ({ stats, onNavigate }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
      {/* Weekly Reports Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
      >
        <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#EFF6FF', opacity: 1, border: '1px solid #BFDBFE', borderLeft: `4px solid ${cc.info}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.info}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
                <FileText size={16} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>{t('weeklyReports', 'Weekly Reports')}</div>
                <div style={{ fontSize: 12, color: cc.textMuted }}>{stats.semesterName || t('thisSemester', 'This semester')}</div>
              </div>
            </div>
            <span style={{ padding: '2px 8px', borderRadius: cc.radiusFull, backgroundColor: hexToRgba(cc.warning, 0.06), border: `1px solid ${hexToRgba(cc.warning, 0.2)}`, color: cc.warning, fontSize: 10, fontWeight: 600 }}>
              {t('reportDeadline', 'Deadline: Sun 11:59 PM')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            <StatChip icon={<CheckCircle2 size={16} />} label={t('submitted', 'Submitted')} value={stats.reports} color={cc.success} />
            <StatChip icon={<Clock size={16} />} label={t('pending', 'Pending')} value={1} color={cc.warning} />
            <StatChip icon={<AlertTriangle size={16} />} label={t('late', 'Late')} value={0} color={cc.error} />
            <StatChip icon={<BookOpen size={16} />} label={t('totalWeeks', 'Total Weeks')} value={stats.daysRemaining > 0 ? Math.max(1, 12 - stats.reports) : '-'} color={cc.info} />
          </div>

          <div style={{ height: 1, background: cc.borderSubtle, marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextLink color={cc.brand} onClick={() => onNavigate('reports')}>{t('viewAllReports', 'View all reports')}</TextLink>
            <CTAButton variant="primary" size="sm" icon={false} onClick={() => onNavigate('reports')}>{t('submitReport', 'Submit Report')}</CTAButton>
          </div>
        </CardWrapper>
      </motion.div>

      {/* Training Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
      >
        <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFF8F2', opacity: 1, border: '1px solid #FFE0C2', borderLeft: `4px solid ${cc.brand}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.brand}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.brand }}>
              <BookOpen size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>{t('trainingProgress', 'Training Progress')}</div>
              <div style={{ fontSize: 12, color: cc.textMuted }}>{stats.semesterName || t('ojtPhase', 'OJT Phase')}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
              {[
                { label: t('week1_4', 'WEEK 1-4'), color: cc.success, flex: 4 },
                { label: t('week5_8', 'WEEK 5-8'), color: cc.info, flex: 4 },
                { label: t('week9_12', 'WEEK 9-12'), color: cc.warning, flex: stats.daysRemaining > 0 ? 4 : 0 },
              ].map((stage, i) => (
                <div key={stage.label} style={{
                  flex: stage.flex,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 4px',
                  borderRadius: cc.radiusMd,
                  background: stage.flex > 0 ? `${stage.color}10` : 'transparent',
                  border: `1px solid ${stage.flex > 0 ? `${stage.color}25` : 'transparent'}`,
                  gap: 4,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 6, borderRadius: cc.radiusFull, background: cc.borderSubtle, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(5, (stats.reports / 12) * 100))}%`,
              background: cc.brand,
              borderRadius: cc.radiusFull,
              transition: 'width 0.6s ease',
            }} />
          </div>

          <div style={{ height: 1, background: cc.borderSubtle, marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <TextLink color={cc.brand} onClick={() => onNavigate('training-plan')}>{t('viewTrainingPlan', 'View Training Plan')}</TextLink>
          </div>
        </CardWrapper>
      </motion.div>
    </div>
  );
};

// ============================================================
// SECTION: QUICK ACTIONS
// ============================================================
const QuickActionsRow: React.FC<{
  onNavigate: (route: string) => void;
  actions: Array<{ label: string; description: string; icon: React.ReactNode; route: string }>;
}> = ({ onNavigate, actions }) => {
  const { t } = useTranslation(['studentDashboard']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
      style={{ marginBottom: 16 }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: cc.textMuted, marginBottom: 10, paddingLeft: 2 }}>
        {t('quickActions', 'Quick Actions')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'stretch' }}>
        {actions.map((action) => (
          <div key={action.label} style={{ display: 'flex', flexDirection: 'column' }}>
            <motion.div
              onClick={() => action.route && onNavigate(action.route)}
              whileHover={{ y: -3, boxShadow: cc.shadowMd }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              style={{
                backgroundColor: '#FFFFFF',
                opacity: 1,
                borderRadius: cc.radiusLg,
                border: `1px solid ${cc.border}`,
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
              <div style={{ width: 40, height: 40, borderRadius: cc.radiusMd, background: `${cc.brand}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.brand, position: 'relative' }}>
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: 11, color: cc.textMuted, lineHeight: 1.4 }}>{action.description}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, color: cc.brand, opacity: 0.6 }}>
                <ArrowRight size={14} />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================
// SECTION: RIGHT COLUMN — UPCOMING & ACTIVITY
// ============================================================
const UpcomingCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}
    >
      <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.info}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
            <Calendar size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>{t('upcomingEvents', 'Upcoming Events')}</div>
            <div style={{ fontSize: 12, color: cc.textMuted }}>{t('yourSchedule', 'Your schedule')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {[
            { title: t('weeklyReportDeadline', 'Weekly Report Deadline'), meta: t('sundayDeadline', 'Sunday, 11:59 PM'), tone: cc.warning, icon: <Clock size={14} /> },
            { title: t('midReviewMeeting', 'Mid-Review Meeting'), meta: t('nextWeek', 'Next Week'), tone: cc.info, icon: <Calendar size={14} /> },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', borderRadius: cc.radiusMd,
              background: hexToRgba(item.tone, 0.06),
              border: `1px solid ${hexToRgba(item.tone, 0.2)}`,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>{item.title}</div>
                <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>{item.icon} {item.meta}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CTAButton variant="ghost" size="sm" icon={false} onClick={() => onNavigate('schedule')}>{t('viewCalendar', 'View Calendar')}</CTAButton>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

const RecentActivityCard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <CardWrapper style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.success}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.success }}>
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>{t('recentActivity', 'Recent Activity')}</div>
            <div style={{ fontSize: 12, color: cc.textMuted }}>{t('latestUpdates', 'Latest updates')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {[
            { title: t('appSubmitted', 'Application submitted to TechCorp'), meta: '2 hours ago', tone: cc.info },
            { title: t('reportApproved', 'Weekly report W22 approved'), meta: 'Yesterday', tone: cc.success },
            { title: t('interviewScheduled', 'Interview scheduled for Jul 15'), meta: '3 days ago', tone: cc.warning },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: cc.radiusMd, background: cc.borderSubtle }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>{item.title}</div>
                <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 2 }}>{item.meta}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ height: 1, background: cc.borderSubtle, marginTop: 'auto', marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TextLink color={cc.brand} onClick={() => onNavigate('dashboard')}>{t('viewAllHistory', 'View All History')}</TextLink>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

// ============================================================
// SECTION: EVALUATION OVERVIEW
// ============================================================
const EvaluationRow: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation(['studentDashboard']);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
      style={{ marginBottom: 16 }}
    >
      <CardWrapper style={{ padding: 20, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFBEB', opacity: 1, border: '1px solid #FDE68A', borderLeft: `4px solid ${cc.warning}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.warning}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.warning }}>
              <Star size={16} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>{t('myEvaluation', 'My Evaluation')}</div>
              <div style={{ fontSize: 12, color: cc.textMuted }}>{t('trackGrade', 'Track your internship grade')}</div>
            </div>
          </div>
          <CTAButton variant="ghost" size="sm" icon={false} onClick={() => onNavigate('evaluation')}>{t('viewDetails', 'View Details')}</CTAButton>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: t('attitude', 'Attitude (20%)'), score: '—', color: cc.info },
            { label: t('professionalism', 'Professionalism (40%)'), score: '—', color: cc.brand },
            { label: t('softSkills', 'Soft Skills (20%)'), score: '—', color: cc.success },
            { label: t('progress', 'Progress (20%)'), score: '—', color: cc.warning },
          ].map((item) => (
            <div key={item.label} style={{
              padding: '12px 14px', borderRadius: cc.radiusMd,
              background: hexToRgba(item.color, 0.05),
              border: `1px solid ${hexToRgba(item.color, 0.15)}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>{item.score}</div>
              <div style={{ fontSize: 10, color: item.color, opacity: 0.8, marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, height: 6, borderRadius: cc.radiusFull, background: cc.borderSubtle, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '0%', background: cc.textMuted, borderRadius: cc.radiusFull, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 6, textAlign: 'right' }}>{t('gradeInfo', 'Grade will be available after OJT completion')}</div>
      </CardWrapper>
    </motion.div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const StudentDashboardTab: React.FC<DashboardTabProps> = ({ currentSemester: propSemester, hasActivePlacement: propPlacement }) => {
  const { t } = useTranslation(['studentDashboard']);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ojtStatus, setOjtStatus] = useState<OjtStatusResponse | null>(null);
  const [stats, setStats] = useState<StudentDashboardStats>({
    applications: 0,
    interviews: 0,
    reports: 0,
    daysRemaining: 0,
    semesterName: '—',
    semesterStatus: 'N/A',
    currentSemester: 5,
    hasActivePlacement: false,
    enterpriseName: '',
    userProfile: null,
    loggedHours: 0,
    applicationStatusRates: [],
    upNextInterviews: [],
    recentActivities: [],
  });
  const navigate = useNavigate();

  // Prefer the semester/placement passed from parent (source of truth).
  // Fall back to stats if not provided (for backward compatibility).
  const currentSemester = propSemester ?? stats.currentSemester ?? 5;
  const hasActivePlacement = propPlacement ?? stats.hasActivePlacement ?? false;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, ojtStatusData] = await Promise.allSettled([
          StudentDashboardService.getStats(),
          OjtStatusService.getMyOjtStatus(),
        ]);
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        }
        if (ojtStatusData.status === 'fulfilled') {
          setOjtStatus(ojtStatusData.value);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleNavigate = (route: string) => {
    navigate(`/student/${route}`);
  };

  const isSemester1to4 = currentSemester >= 1 && currentSemester <= 4;
  const isSemester5 = currentSemester === 5;
  const isSemester6 = currentSemester === 6;
  const isSemester7to9 = currentSemester >= 7 && currentSemester <= 9;
  const showUpcoming = isSemester5 || (isSemester6 && hasActivePlacement);
  const showRecentActivity = isSemester5 || (isSemester6 && hasActivePlacement);

  const quickActions = (() => {
    const actions = [] as Array<{ label: string; description: string; icon: React.ReactNode; route: string }>;

    if (isSemester1to4) {
      actions.push({
        label: t('browseJobs', 'Browse Jobs'),
        description: t('browseJobsDesc', 'Find and apply for internships'),
        icon: <Briefcase size={24} />,
        route: 'jobs',
      });
      return actions;
    }

    if (isSemester5) {
      actions.push({
        label: t('browseJobs', 'Browse Jobs'),
        description: t('browseJobsDesc', 'Find and apply for internships'),
        icon: <Briefcase size={24} />,
        route: 'jobs',
      });
      actions.push({
        label: t('mySchedule', 'My Schedule'),
        description: t('myScheduleDesc', 'View upcoming interviews'),
        icon: <Calendar size={24} />,
        route: 'schedule',
      });
      return actions;
    }

    if (isSemester6) {
      if (!hasActivePlacement) {
        actions.push({
          label: t('browseJobs', 'Browse Jobs'),
          description: t('browseJobsDesc', 'Find and apply for internships'),
          icon: <Briefcase size={24} />,
          route: 'jobs',
        });
        actions.push({
          label: t('mySchedule', 'My Schedule'),
          description: t('myScheduleDesc', 'View upcoming interviews'),
          icon: <Calendar size={24} />,
          route: 'schedule',
        });
      } else {
        actions.push({
          label: t('submitReport', 'Submit Report'),
          description: t('submitReportDesc', 'Submit your weekly progress report'),
          icon: <Upload size={24} />,
          route: 'reports',
        });
        actions.push({
          label: t('mySchedule', 'My Schedule'),
          description: t('myScheduleDesc', 'View upcoming interviews'),
          icon: <Calendar size={24} />,
          route: 'schedule',
        });
        actions.push({
          label: t('browseJobs', 'Browse Jobs'),
          description: t('browseJobsDesc', 'Find and apply for internships'),
          icon: <Briefcase size={24} />,
          route: 'jobs',
        });
      }
      return actions;
    }

    if (isSemester7to9) {
      actions.push({
        label: t('sendFeedback', 'Send Feedback'),
        description: t('sendFeedbackDesc', 'Rate your enterprise experience'),
        icon: <Star size={24} />,
        route: 'feedback',
      });
      return actions;
    }

    return [
      {
        label: t('browseJobs', 'Browse Jobs'),
        description: t('browseJobsDesc', 'Find and apply for internships'),
        icon: <Briefcase size={24} />,
        route: 'jobs',
      },
    ];
  })();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
      <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <SemesterContextBar stats={stats} ojtStatus={ojtStatus} />

              {/* PRIMARY SEMESTER CARDS (Full Width) */}
              <div style={{ marginBottom: 24 }}>
                {isSemester1to4 && <WelcomeCard onNavigate={handleNavigate} />}
                {(isSemester5 || (isSemester6 && !hasActivePlacement)) && <UrgencyCardsRow stats={stats} onNavigate={handleNavigate} />}
                {isSemester6 && hasActivePlacement && <ReportPipelineRow stats={stats} onNavigate={handleNavigate} />}
                {isSemester7to9 && <EvaluationRow onNavigate={handleNavigate} />}

                {/* Alert for AT_RISK or BLOCKED — show regardless of placement status */}
                {ojtStatus && (ojtStatus.ojtStatus === 'AT_RISK' || ojtStatus.ojtStatus === 'BLOCKED') && (
                  <NoPlacementAlert
                    enterpriseName={stats.enterpriseName}
                    onNavigate={handleNavigate}
                    riskReason={ojtStatus.riskReason}
                    contactEmail={ojtStatus.contactSupportEmail}
                    contactName={ojtStatus.contactSupportName}
                    daysUntilDeadline={ojtStatus.daysUntilDeadline}
                  />
                )}
              </div>

              {/* QUICK ACTIONS ROW (Full Width) */}
              <div style={{ marginBottom: 24 }}>
                <QuickActionsRow onNavigate={handleNavigate} actions={quickActions} />
            </div>

              {/* SPLIT SCREEN WORKSPACE GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 24 }}>
                {/* Left Column (Main content) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {showRecentActivity && <RecentActivityCard onNavigate={handleNavigate} />}
                </div>

                {/* Right Column (Sidebar content) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {showUpcoming && <UpcomingCard onNavigate={handleNavigate} />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 7fr 3fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="grid-template-columns: 7fr 5fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
