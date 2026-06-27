import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Briefcase,
  TrendingUp,
  Activity,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { App } from 'antd';
import { ApplicationService } from '@/services/ApplicationService';

// ============================================================
// DESIGN TOKENS — UEIMS Enterprise Dashboard
// (aligned with CommandCenterDashboard for consistency)
// ============================================================
export const cc = {
  brand: '#FF7A30',
  brandHover: '#E86A20',
  brandMuted: '#FFF3E8',
  brandSubtle: '#FFF8F0',
  brandStrong: '#9B4A10',

  success: '#10B981',
  successMuted: '#D1FAE5',
  successText: '#065F46',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  errorText: '#991B1B',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  warningText: '#92400E',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  infoText: '#1E40AF',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',

  surface: '#FFFFFF',
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
  shadowBrand: '0 4px 12px rgba(255,122,48,0.25)',
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
const CardWrapper: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, style, onClick, hoverable = false }) => {
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
        backgroundColor: cc.surface,
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
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: cc.textMuted,
      ...style,
    }}
  >
    {children}
  </span>
);

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

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: `1px solid ${cc.border}`,
        borderRadius: `${cc.radiusMd}px`,
        padding: '8px 12px',
        boxShadow: cc.shadowMd,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, margin: '0 0 4px', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((pld: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: pld.color || pld.fill }} />
            <span style={{ fontSize: 12.5, color: cc.textPrimary, fontWeight: 600 }}>
              {pld.name}: {pld.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================
// TYPES
// ============================================================
interface ApplicationItem {
  applicationId: string;
  studentName: string;
  studentCode: string;
  studentEmail: string;
  jobPostTitle: string;
  jobPostId?: string;
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
// SECTION: HEADER
// ============================================================
const DashboardHeader: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      backgroundColor: cc.surface,
      borderRadius: cc.radiusLg,
      border: `1px solid ${cc.border}`,
      boxShadow: cc.shadowSm,
      padding: '16px 24px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
    }}
  >
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
        Enterprise Dashboard
      </h1>
      <p style={{ fontSize: 13, color: cc.textSecondary, margin: '4px 0 0' }}>
        Monitor your recruitment pipeline, applicant status, and job post performance
      </p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: cc.radiusFull,
        backgroundColor: hexToRgba(cc.brand, 0.1),
        border: `1px solid ${hexToRgba(cc.brand, 0.3)}`,
        color: cc.brand,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        <StatusDot color={cc.brand} pulse />
        Hiring Mode
      </span>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: cc.radiusFull,
        backgroundColor: hexToRgba(cc.success, 0.1),
        border: `1px solid ${hexToRgba(cc.success, 0.3)}`,
        color: cc.success,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        <StatusDot color={cc.success} pulse />
        Active
      </span>
    </div>
  </motion.div>
);

// ============================================================
// SECTION: KPI CARDS ROW (3 cards)
// ============================================================
const KPICardsRow: React.FC<{
  stats: DashboardStats;
  passRate: number;
  activePosts: number;
  onNavigate: (route: string) => void;
}> = ({ stats, passRate, activePosts, onNavigate }) => {
  const cards = [
    {
      label: 'Total Applicants',
      value: stats.totalApplicants,
      color: cc.info,
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: <Users size={20} />,
      desc: `${stats.totalApplicants} total received`,
      route: 'applicants',
    },
    {
      label: 'Pass Rate',
      value: `${passRate}%`,
      color: cc.brand,
      bg: '#FFF8F0',
      border: '#FED7AA',
      icon: <TrendingUp size={20} />,
      desc: `${stats.accepted} of ${stats.totalApplicants} applicants`,
      route: 'applicants',
    },
    {
      label: 'Active Job Posts',
      value: activePosts,
      color: cc.success,
      bg: '#F0FDF4',
      border: '#BBF7D0',
      icon: <Briefcase size={20} />,
      desc: 'Currently accepting applications',
      route: 'job-posts',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
      marginBottom: 24,
    }} className="ed-kpi-grid">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <CardWrapper hoverable onClick={() => onNavigate(card.route)} style={{
            padding: 18,
            borderLeft: `4px solid ${card.color}`,
            backgroundColor: card.bg,
            border: `1px solid ${card.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Label>{card.label}</Label>
                <div style={{ fontSize: 28, fontWeight: 800, color: cc.textPrimary, marginTop: 4, letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 4 }}>
                  {card.desc}
                </div>
              </div>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: cc.radiusMd,
                backgroundColor: hexToRgba(card.color, 0.16),
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
            </div>
          </CardWrapper>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// SECTION: HIRING FUNNEL (Status Distribution)
// ============================================================
const HiringFunnel: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const stages = [
    { label: 'PENDING', value: stats.pending, color: cc.warning, desc: 'Awaiting review' },
    { label: 'INTERVIEWING', value: stats.interviewing, color: cc.info, desc: 'In interview' },
    { label: 'ACCEPTED', value: stats.accepted, color: cc.success, desc: 'Hired' },
    { label: 'REJECTED', value: stats.rejected, color: cc.error, desc: 'Not selected' },
  ];
  const total = stats.totalApplicants || 1;
  const placementRate = Math.round((stats.accepted / total) * 100);

  return (
    <CardWrapper style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Label>Hiring Pipeline</Label>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: '4px 0 0' }}>
            Recruitment funnel
          </h3>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: cc.radiusFull,
          backgroundColor: hexToRgba(cc.success, 0.1),
          border: `1px solid ${hexToRgba(cc.success, 0.3)}`,
          color: cc.success,
          fontSize: 11,
          fontWeight: 700,
        }}>
          <Activity size={12} />
          {placementRate}% acceptance
        </span>
      </div>

      {stats.totalApplicants === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: cc.textMuted, fontSize: 13 }}>
          No application data yet
        </div>
      ) : (
        <>
          <div className="ed-funnel" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {stages.map((stage, i) => (
              <React.Fragment key={stage.label}>
                <div style={{
                  flex: 1,
                  padding: '16px 12px',
                  borderRadius: cc.radiusLg,
                  background: hexToRgba(stage.color, 0.12),
                  border: `1px solid ${hexToRgba(stage.color, 0.4)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: stage.color }}>{stage.value}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: stage.color, marginTop: 4, letterSpacing: '0.05em' }}>
                    {stage.label}
                  </span>
                  <span style={{ fontSize: 10, color: cc.textPrimary, fontWeight: 500, marginTop: 2, textAlign: 'center' }}>
                    {stage.desc}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: cc.textSecondary }}>
                    <ChevronRight size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: cc.textSecondary, marginBottom: 4 }}>
            <span>Placement progress</span>
            <span style={{ fontWeight: 700, color: cc.success }}>{placementRate}%</span>
          </div>
          <div style={{ height: 6, borderRadius: cc.radiusFull, backgroundColor: cc.borderSubtle, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${placementRate}%` }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              style={{ height: '100%', backgroundColor: cc.success, borderRadius: cc.radiusFull }}
            />
          </div>
        </>
      )}
    </CardWrapper>
  );
};

// ============================================================
// SECTION: LAST 7 DAYS (Recharts BarChart)
// ============================================================
const Last7DaysChart: React.FC<{ applications: ApplicationItem[] }> = ({ applications }) => {
  const data = useMemo(() => {
    const days: { label: string; date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = applications.filter(a => {
        const t = new Date(a.createdAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        date: d.toLocaleDateString(),
        count,
      });
    }
    return days;
  }, [applications]);

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <CardWrapper style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Label>New Applications</Label>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: '4px 0 0' }}>
            Last 7 days
          </h3>
        </div>
        <span style={{ fontSize: 12, color: cc.textSecondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={13} />
          {total} total
        </span>
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cc.borderSubtle} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: cc.textSecondary }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: cc.textSecondary }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF8F0' }} />
            <Bar dataKey="count" name="Applicants" fill={cc.brand} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};

// ============================================================
// SECTION: TOP JOB POSTS
// ============================================================
const TopJobPosts: React.FC<{ applications: ApplicationItem[] }> = ({ applications }) => {
  const top = useMemo(() => {
    const map: Record<string, { title: string; count: number; accepted: number }> = {};
    applications.forEach(a => {
      const key = a.jobPostTitle || 'Other';
      if (!map[key]) map[key] = { title: key, count: 0, accepted: 0 };
      map[key].count += 1;
      if (a.status === 'ACCEPTED') map[key].accepted += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [applications]);

  if (top.length === 0) {
    return (
      <CardWrapper style={{ padding: 20 }}>
        <Label>Top Job Posts</Label>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: '4px 0 16px' }}>
          By applicant volume
        </h3>
        <div style={{ padding: '32px 0', textAlign: 'center', color: cc.textMuted, fontSize: 13 }}>
          No job post data available yet
        </div>
      </CardWrapper>
    );
  }

  const max = top[0]?.count || 1;

  return (
    <CardWrapper style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Label>Top Job Posts</Label>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: '4px 0 0' }}>
            By applicant volume
          </h3>
        </div>
        <span style={{ fontSize: 12, color: cc.textSecondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={13} />
          {top.length} posts
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {top.map((jp, i) => (
          <div key={jp.title} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 80px', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: cc.brand }}>#{i + 1}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: cc.textPrimary, marginBottom: 6 }}>
                {jp.title}
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: cc.radiusFull, backgroundColor: cc.borderSubtle, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(jp.count / max) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                  style={{ height: '100%', backgroundColor: cc.brand, borderRadius: cc.radiusFull }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, fontSize: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: cc.textPrimary }}>{jp.count}</div>
                <div style={{ fontSize: 10, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  applicants
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: cc.success }}>{jp.accepted}</div>
                <div style={{ fontSize: 10, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  accepted
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
};

// ============================================================
// SECTION: RECENT ACTIVITY
// ============================================================
const RecentActivity: React.FC<{ applications: ApplicationItem[] }> = ({ applications }) => {
  const recent = applications.slice(0, 5);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Applied', color: cc.warning, bg: hexToRgba(cc.warning, 0.12), border: hexToRgba(cc.warning, 0.4) };
      case 'INTERVIEW_SCHEDULED': return { label: 'Interview Set', color: cc.info, bg: hexToRgba(cc.info, 0.12), border: hexToRgba(cc.info, 0.4) };
      case 'ACCEPTED': return { label: 'Accepted', color: cc.success, bg: hexToRgba(cc.success, 0.12), border: hexToRgba(cc.success, 0.4) };
      case 'REJECTED': return { label: 'Rejected', color: cc.error, bg: hexToRgba(cc.error, 0.12), border: hexToRgba(cc.error, 0.4) };
      default: return { label: status, color: cc.textMuted, bg: hexToRgba(cc.textMuted, 0.12), border: hexToRgba(cc.textMuted, 0.4) };
    }
  };

  return (
    <CardWrapper style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <Label>Recent Activity</Label>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: '4px 0 0' }}>
          Latest applications
        </h3>
      </div>
      {recent.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: cc.textMuted, fontSize: 13 }}>
          No applications yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recent.map((app, i) => {
            const status = getStatusInfo(app.status);
            const daysAgo = Math.floor((Date.now() - new Date(app.createdAt).getTime()) / 86400000);
            return (
              <motion.div
                key={app.applicationId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: cc.radiusMd,
                  backgroundColor: cc.neutralBg,
                  border: `1px solid ${cc.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: cc.radiusMd,
                    backgroundColor: hexToRgba(cc.brand, 0.12),
                    color: cc.brand,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                  }}>
                    {app.studentName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary }}>
                      {app.studentName}
                    </div>
                    <div style={{ fontSize: 11, color: cc.textSecondary, marginTop: 2 }}>
                      {app.jobPostTitle}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: cc.radiusFull,
                    backgroundColor: status.bg,
                    border: `1px solid ${status.border}`,
                    color: status.color,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {status.label}
                  </span>
                  <span style={{ fontSize: 11, color: cc.textMuted, fontWeight: 500, minWidth: 50, textAlign: 'right' }}>
                    {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </CardWrapper>
  );
};

// ============================================================
// MAIN DASHBOARD TAB
// ============================================================
export const EnterpriseDashboardTab: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalApplicants: 0, pending: 0, interviewing: 0, accepted: 0, rejected: 0 });
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ApplicationService.getMyEnterprise();
        const data: any[] = res.data?.result ?? res.data ?? [];

        if (data.length >= 0) {
          const mapped: ApplicationItem[] = data.map((item: any) => ({
            applicationId: item.applicationId ?? item.id,
            studentName: item.studentName ?? 'Student',
            studentCode: item.studentCode ?? '—',
            studentEmail: item.studentEmail ?? '',
            jobPostTitle: item.jobPostTitle ?? item.job?.title ?? 'Intern',
            jobPostId: item.jobPostId ?? item.job?.jobPostId,
            status: item.status ?? 'PENDING',
            interviewDate: item.interviewDate,
            createdAt: item.createdAt ?? new Date().toISOString(),
          }));
          setApplications(mapped);

          const total = mapped.length;
          const pending = mapped.filter(a => a.status === 'PENDING' || a.status === 'SCREENING_PASSED' || a.status === 'SCREENING_REJECTED').length;
          const interviewing = mapped.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
          const accepted = mapped.filter(a => a.status === 'ACCEPTED').length;
          const rejected = mapped.filter(a => a.status === 'REJECTED' || a.status === 'WITHDRAWN').length;
          setStats({ totalApplicants: total, pending, interviewing, accepted, rejected });
        }
      } catch (err) {
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Refetch when other tabs (Kanban, Interview) change an application status.
    const onStatusUpdated = () => fetchData();
    window.addEventListener('application-status-updated', onStatusUpdated);

    // Also refetch when the window regains focus.
    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('application-status-updated', onStatusUpdated);
      window.removeEventListener('focus', onFocus);
    };
  }, [message]);

  const passRate = useMemo(
    () => stats.totalApplicants > 0 ? Math.round((stats.accepted / stats.totalApplicants) * 100) : 0,
    [stats.totalApplicants, stats.accepted],
  );

  // Derive active job posts from distinct jobPostId in current applications
  // (we don't fetch job posts to keep dashboard load fast).
  const activePosts = useMemo(() => {
    const ids = new Set<string>();
    applications.forEach(a => {
      if (a.jobPostId) ids.add(a.jobPostId);
    });
    return ids.size;
  }, [applications]);

  const handleNavigate = (route: string) => {
    navigate(`/enterprise-dashboard/${route}`);
  };

  if (loading) {
    return (
      <div style={{
        padding: 80,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
        <RefreshCw size={32} className="animate-spin" color={cc.brand} />
        <div style={{ color: cc.textSecondary, fontSize: 14, fontWeight: 500 }}>
          Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1240,
      margin: '0 auto',
      padding: '24px 20px 40px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <DashboardHeader />

      <KPICardsRow
        stats={stats}
        passRate={passRate}
        activePosts={activePosts}
        onNavigate={handleNavigate}
      />

      {/* Split workspace: left = funnel + last 7 days, right = top job posts + recent activity */}
      <div className="ed-workspace" style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <HiringFunnel stats={stats} />
          <Last7DaysChart applications={applications} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <TopJobPosts applications={applications} />
          <RecentActivity applications={applications} />
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        @media (max-width: 1024px) {
          .ed-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ed-workspace { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .ed-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};