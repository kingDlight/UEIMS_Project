import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Users,
  UserCheck,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Briefcase,
  Clock,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { Spin, message } from 'antd';
import { ApplicationService } from '@/services/ApplicationService';
import { c } from '../constants';

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

// ============================================================
// SHARED COMPONENTS (mirrors StudentDashboardTab)
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
        boxShadow: hovered && hoverable ? c.shadowMd : c.shadowSm,
      }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: c.radiusLg,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadowSm,
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
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: c.textMuted, ...style,
  }}>
    {children}
  </span>
);

const TrendBadge: React.FC<{ direction: 'up' | 'down' | 'neutral'; value: string; color?: string }> = ({ direction, value, color }) => {
  let iconColor = color || c.textMuted;
  let Icon = MinusCircle;
  if (!color) {
    if (direction === 'up') iconColor = c.success;
    else if (direction === 'down') iconColor = c.error;
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
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color,
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
    primary: { bg: c.brand, text: '#fff', shadow: c.shadowBrand },
    amber: { bg: c.warning, text: '#fff', shadow: '0 8px 22px rgba(245,158,11,0.22)' },
    red: { bg: c.error, text: '#fff', shadow: '0 8px 22px rgba(239,68,68,0.22)' },
    success: { bg: c.success, text: '#fff', shadow: '0 8px 22px rgba(16,185,129,0.22)' },
    ghost: { bg: 'transparent', text: c.brand, shadow: 'none' },
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
        display: 'inline-flex', alignItems: 'center', gap: 6, padding, fontSize,
        fontWeight: 600, color: disabled ? c.textMuted : textColor,
        background: disabled ? c.borderSubtle : bg,
        border: variant === 'ghost' ? `1px solid ${c.border}` : 'none',
        borderRadius: c.radiusMd,
        boxShadow: disabled ? 'none' : (variant === 'ghost' ? 'none' : shadow),
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: 'auto', justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      {children}
      {icon === false ? null : (icon || <ArrowRight size={size === 'sm' ? 12 : 14} />)}
    </motion.button>
  );
};

const StatChip: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string }> = ({ icon, label, value, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: c.radiusMd, backgroundColor: hexToRgba(color, 0.05),
    border: `1px solid ${hexToRgba(color, 0.15)}`, flex: 1, minWidth: 0,
  }}>
    <div style={{ color, flexShrink: 0 }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 10, color, opacity: 0.8, marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  </div>
);

// ============================================================
// TYPES
// ============================================================
interface ApplicationItem {
  applicationId: string;
  studentName: string;
  studentCode: string;
  studentEmail: string;
  jobPostTitle: string;
  status: string;
  interviewDate?: string;
  createdAt: string;
}

interface DashboardStats {
  totalApplicants: number;
  pending: number;
  interviewing: number;
  accepted: number;
  rejected: number;
}

// ============================================================
// SECTION: ENTERPRISE CONTEXT BAR
// ============================================================
const EnterpriseContextBar: React.FC<{ companyName: string }> = ({ companyName }) => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: c.brand, letterSpacing: '0.04em' }}>{companyName.toUpperCase()}</span>
        <span style={{ color: c.border, fontSize: 13 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: c.success, backgroundColor: hexToRgba(c.success, 0.06), border: `1px solid ${hexToRgba(c.success, 0.25)}`, padding: '2px 8px', borderRadius: c.radiusFull }}>
          <StatusDot color={c.success} />
          {t('enterprise.active', 'ENTERPRISE')}
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 11, color: c.textMuted }}>{t('enterprise.portal', 'Enterprise Portal')}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: c.radiusFull, backgroundColor: hexToRgba(c.brand, 0.06), border: `1px solid ${hexToRgba(c.brand, 0.25)}`, color: c.brand, fontSize: 11, fontWeight: 600 }}>
          <StatusDot color={c.brand} />
          {t('enterprise.hiring', 'HIRING MODE')}
        </span>
      </motion.div>
    </div>
  );
};

// ============================================================
// SECTION: KPI CARDS ROW
// ============================================================
const KPICardsRow: React.FC<{ stats: DashboardStats; onNavigate: (route: string) => void }> = ({ stats, onNavigate }) => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
      {[
        { label: 'Total', value: stats.totalApplicants, color: c.info, icon: <Users size={18} />, trend: 'up' as const, trendValue: '+3 this week', onClick: () => onNavigate('applicants') },
        { label: 'Pending', value: stats.pending, color: c.warning, icon: <Clock size={18} />, trend: 'neutral' as const, trendValue: 'Awaiting review', onClick: () => onNavigate('applicants') },
        { label: 'Interviewing', value: stats.interviewing, color: c.info, icon: <Calendar size={18} />, trend: 'up' as const, trendValue: '+2 scheduled', onClick: () => onNavigate('applicants') },
        { label: 'Accepted', value: stats.accepted, color: c.success, icon: <CheckCircle2 size={18} />, trend: 'up' as const, trendValue: `${stats.rejected} rejected`, onClick: () => onNavigate('evaluation') },
      ].map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
        >
          <CardWrapper hoverable onClick={card.onClick} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: c.radiusMd, background: hexToRgba(card.color, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ padding: '2px 8px', borderRadius: c.radiusFull, background: hexToRgba(card.color, 0.08), border: `1px solid ${hexToRgba(card.color, 0.15)}`, fontSize: 11, fontWeight: 700, color: card.color }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.text, lineHeight: 1, marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{card.value}</div>
            <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 4 }}>{card.trendValue}</div>
            <TrendBadge direction={card.trend} value={card.trendValue} color={card.color} />
          </CardWrapper>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// SECTION: PIPELINE SUMMARY
// ============================================================
const PipelineSummary: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const { t } = useTranslation();
  const total = stats.totalApplicants || 1;
  const pipeline = [
    { label: 'Pending', value: stats.pending, color: c.warning },
    { label: 'Interviewing', value: stats.interviewing, color: c.info },
    { label: 'Accepted', value: stats.accepted, color: c.success },
    { label: 'Rejected', value: stats.rejected, color: c.error },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 20 }}
    >
      <CardWrapper style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Label>{t('enterprise.hiringPipeline', 'Hiring Pipeline')}</Label>
          <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{total} {t('enterprise.totalApplicants', 'Total Applicants')}</span>
        </div>
        <div style={{ display: 'flex', height: 10, borderRadius: c.radiusFull, overflow: 'hidden', background: c.borderSubtle, gap: 3 }}>
          {pipeline.map((col) => (
            <div
              key={col.label}
              style={{
                flex: col.value || 0.01,
                background: col.value > 0 ? col.color : 'transparent',
                borderRadius: c.radiusFull,
                transition: 'flex 0.6s ease',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
          {pipeline.map((col) => (
            <div key={col.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: c.textMuted }}>{col.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{col.value}</span>
              <span style={{ fontSize: 11, color: c.textMuted }}>({total > 0 ? Math.round((col.value / total) * 100) : 0}%)</span>
            </div>
          ))}
        </div>
      </CardWrapper>
    </motion.div>
  );
};

// ============================================================
// SECTION: RECENT ACTIVITY
// ============================================================
const RecentActivity: React.FC<{ applications: ApplicationItem[] }> = ({ applications }) => {
  const { t } = useTranslation();
  const recent = applications.slice(0, 5);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Applied', color: c.warning, icon: <Clock size={13} /> };
      case 'INTERVIEW_SCHEDULED': return { label: 'Interview Set', color: c.info, icon: <Calendar size={13} /> };
      case 'ACCEPTED': return { label: 'Accepted', color: c.success, icon: <CheckCircle2 size={13} /> };
      case 'REJECTED': return { label: 'Rejected', color: c.error, icon: <AlertTriangle size={13} /> };
      default: return { label: status, color: c.textMuted, icon: <Clock size={13} /> };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 20 }}
    >
      <CardWrapper style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Label>{t('enterprise.recentApplications', 'Recent Applications')}</Label>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: c.textMuted, fontSize: 13 }}>
            {t('enterprise.noApplications', 'No applications yet')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recent.map((app, i) => {
              const status = getStatusInfo(app.status);
              const daysAgo = Math.floor((Date.now() - new Date(app.createdAt).getTime()) / 86400000);
              return (
                <motion.div
                  key={app.applicationId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, background: hexToRgba(c.brand, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.brand, fontSize: 13, fontWeight: 800 }}>
                      {app.studentName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{app.studentName}</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>{app.jobPostTitle}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: c.radiusFull, background: hexToRgba(status.color, 0.08), border: `1px solid ${hexToRgba(status.color, 0.2)}`, color: status.color, fontSize: 11, fontWeight: 600 }}>
                      {status.icon}
                      {status.label}
                    </div>
                    <span style={{ fontSize: 11, color: c.textMuted }}>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardWrapper>
    </motion.div>
  );
};

// ============================================================
// SECTION: QUICK ACTIONS
// ============================================================
const QuickActions: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 20 }}
    >
      <CardWrapper style={{ padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <Label>{t('enterprise.quickActions', 'Quick Actions')}</Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: t('enterprise.viewKanban', 'Applicant Kanban'), icon: <Users size={18} />, variant: 'primary' as const, target: 'applicants' },
            { label: t('enterprise.manageEvaluations', 'Manage Evaluations'), icon: <Star size={18} />, variant: 'ghost' as const, target: 'evaluation' },
            { label: t('enterprise.viewReports', 'View Reports'), icon: <Briefcase size={18} />, variant: 'ghost' as const, target: 'reports' },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(action.target)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                padding: '20px 16px', borderRadius: c.radiusLg, cursor: 'pointer',
                background: action.variant === 'primary' ? c.brand : c.bgLight,
                color: action.variant === 'primary' ? '#fff' : c.text,
                border: action.variant === 'ghost' ? `1px solid ${c.border}` : 'none',
                boxShadow: action.variant === 'primary' ? c.shadowBrand : c.shadowSm,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: c.radiusMd, background: action.variant === 'primary' ? 'rgba(255,255,255,0.15)' : hexToRgba(c.brand, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.variant === 'primary' ? '#fff' : c.brand }}>
                {action.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </CardWrapper>
    </motion.div>
  );
};

// ============================================================
// MAIN DASHBOARD TAB
// ============================================================
export const EnterpriseDashboardTab: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalApplicants: 0, pending: 0, interviewing: 0, accepted: 0, rejected: 0 });
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ApplicationService.getMyEnterprise();
        const data: any[] = res.data?.result ?? res.data ?? [];

        if (data.length > 0) {
          const mapped: ApplicationItem[] = data.map((item: any) => ({
            applicationId: item.applicationId ?? item.id,
            studentName: item.studentName ?? 'Student',
            studentCode: item.studentCode ?? '—',
            studentEmail: item.studentEmail ?? '',
            jobPostTitle: item.jobPostTitle ?? item.job?.title ?? 'Intern',
            status: item.status ?? 'PENDING',
            interviewDate: item.interviewDate,
            createdAt: item.createdAt ?? new Date().toISOString(),
          }));
          setApplications(mapped);

          const total = mapped.length;
          const pending = mapped.filter(a => a.status === 'PENDING').length;
          const interviewing = mapped.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
          const accepted = mapped.filter(a => a.status === 'ACCEPTED').length;
          const rejected = mapped.filter(a => a.status === 'REJECTED').length;
          setStats({ totalApplicants: total, pending, interviewing, accepted, rejected });
        }
      } catch (err) {
        message.error(t('enterprise.fetchError', 'Failed to load dashboard data'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNavigate = (route: string) => {
    navigate(`/enterprise-dashboard/${route}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <EnterpriseContextBar companyName="Enterprise Portal" />

      <KPICardsRow stats={stats} onNavigate={handleNavigate} />
      <PipelineSummary stats={stats} />
      <RecentActivity applications={applications} />
      <QuickActions onNavigate={handleNavigate} />
    </div>
  );
};
