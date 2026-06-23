import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users,
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
import { Spin, App } from 'antd';
import { ApplicationService } from '@/services/ApplicationService';

// ============================================================
// SHARED COMPONENTS
// ============================================================
const CardWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', hoverable = false, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? { y: -2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' } : {}}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
    {children}
  </span>
);

const TrendBadge: React.FC<{ direction: 'up' | 'down' | 'neutral'; value: string; colorClass?: string }> = ({ direction, value, colorClass }) => {
  let iconColorClass = colorClass || 'text-slate-500';
  let Icon = MinusCircle;
  if (!colorClass) {
    if (direction === 'up') iconColorClass = 'text-emerald-500';
    else if (direction === 'down') iconColorClass = 'text-red-500';
  }
  if (direction === 'up') Icon = TrendingUp;
  else if (direction === 'down') Icon = TrendingDown;
  return (
    <div className={`flex items-center gap-1 mt-1.5 ${iconColorClass}`}>
      <Icon size={12} />
      <span className="text-[12px] font-semibold">{value}</span>
    </div>
  );
};

const StatusDot: React.FC<{ colorClass: string; pulse?: boolean }> = ({ colorClass, pulse = false }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${colorClass} ${pulse ? 'animate-pulse' : ''}`} style={{ boxShadow: pulse ? 'none' : '0 0 0 3px currentColor20' }} />
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
    <div className="max-w-[1200px] mx-auto px-6 mb-6 flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center gap-2.5"
      >
        <span className="text-[13px] font-semibold text-[#E67E22] tracking-wide">{companyName.toUpperCase()}</span>
        <span className="text-slate-200 text-[13px]">·</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-500 bg-emerald-50 border border-emerald-500/25 px-2 py-0.5 rounded-full">
          <StatusDot colorClass="bg-emerald-500" />
          {t('enterprise.active', 'ENTERPRISE')}
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center gap-2.5"
      >
        <span className="text-[11px] text-slate-500">{t('enterprise.portal', 'Enterprise Portal')}</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/25 text-[#E67E22] text-[11px] font-semibold">
          <StatusDot colorClass="bg-[#E67E22]" />
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
  return (
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-4 gap-4 mb-5">
      {[
        { label: 'Total', value: stats.totalApplicants, colorClasses: { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500/15' }, icon: <Users size={18} />, trend: 'up' as const, trendValue: '+3 this week', onClick: () => onNavigate('applicants') },
        { label: 'Pending', value: stats.pending, colorClasses: { text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-500/15' }, icon: <Clock size={18} />, trend: 'neutral' as const, trendValue: 'Awaiting review', onClick: () => onNavigate('applicants') },
        { label: 'Interviewing', value: stats.interviewing, colorClasses: { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500/15' }, icon: <Calendar size={18} />, trend: 'up' as const, trendValue: '+2 scheduled', onClick: () => onNavigate('applicants') },
        { label: 'Accepted', value: stats.accepted, colorClasses: { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-500/15' }, icon: <CheckCircle2 size={18} />, trend: 'up' as const, trendValue: `${stats.rejected} rejected`, onClick: () => onNavigate('evaluation') },
      ].map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
        >
          <CardWrapper hoverable onClick={card.onClick} className="p-5">
            <div className="flex items-start justify-between mb-3.5">
              <div className={`w-[42px] h-[42px] rounded-xl ${card.colorClasses.bg} flex items-center justify-center ${card.colorClasses.text}`}>
                {card.icon}
              </div>
              <span className={`px-2 py-0.5 rounded-full ${card.colorClasses.bg} border ${card.colorClasses.border} text-[11px] font-bold ${card.colorClasses.text}`}>
                {card.label}
              </span>
            </div>
            <div className="text-[32px] font-extrabold text-slate-900 leading-none mb-1.5 tabular-nums">{card.value}</div>
            <div className="text-[12px] text-slate-500 mb-1">{card.trendValue}</div>
            <TrendBadge direction={card.trend} value={card.trendValue} colorClass={card.colorClasses.text} />
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
    { label: 'Pending', value: stats.pending, colorClass: 'bg-amber-500', textClass: 'text-amber-500' },
    { label: 'Interviewing', value: stats.interviewing, colorClass: 'bg-blue-500', textClass: 'text-blue-500' },
    { label: 'Accepted', value: stats.accepted, colorClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
    { label: 'Rejected', value: stats.rejected, colorClass: 'bg-red-500', textClass: 'text-red-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="max-w-[1200px] mx-auto px-6 mb-5"
    >
      <CardWrapper className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Label>{t('enterprise.hiringPipeline', 'Hiring Pipeline')}</Label>
          <span className="text-[13px] font-bold text-slate-900">{total} {t('enterprise.totalApplicants', 'Total Applicants')}</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 gap-[3px]">
          {pipeline.map((col) => (
            <div
              key={col.label}
              className={`rounded-full transition-all duration-600 ease-in-out ${col.value > 0 ? col.colorClass : 'bg-transparent'}`}
              style={{ flex: col.value || 0.01 }}
            />
          ))}
        </div>
        <div className="flex gap-5 mt-3.5 flex-wrap">
          {pipeline.map((col) => (
            <div key={col.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full inline-block ${col.colorClass}`} />
              <span className="text-[12px] text-slate-500">{col.label}</span>
              <span className="text-[12px] font-bold text-slate-900">{col.value}</span>
              <span className="text-[11px] text-slate-500">({total > 0 ? Math.round((col.value / total) * 100) : 0}%)</span>
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
      case 'PENDING': return { label: 'Applied', colorClasses: 'text-amber-500 bg-amber-50 border-amber-500/20', icon: <Clock size={13} /> };
      case 'INTERVIEW_SCHEDULED': return { label: 'Interview Set', colorClasses: 'text-blue-500 bg-blue-50 border-blue-500/20', icon: <Calendar size={13} /> };
      case 'ACCEPTED': return { label: 'Accepted', colorClasses: 'text-emerald-500 bg-emerald-50 border-emerald-500/20', icon: <CheckCircle2 size={13} /> };
      case 'REJECTED': return { label: 'Rejected', colorClasses: 'text-red-500 bg-red-50 border-red-500/20', icon: <AlertTriangle size={13} /> };
      default: return { label: status, colorClasses: 'text-slate-500 bg-slate-50 border-slate-500/20', icon: <Clock size={13} /> };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="max-w-[1200px] mx-auto px-6 mb-5"
    >
      <CardWrapper className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Label>{t('enterprise.recentApplications', 'Recent Applications')}</Label>
        </div>
        {recent.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-[13px]">
            {t('enterprise.noApplications', 'No applications yet')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((app, i) => {
              const status = getStatusInfo(app.status);
              const daysAgo = Math.floor((Date.now() - new Date(app.createdAt).getTime()) / 86400000);
              return (
                <motion.div
                  key={app.applicationId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] text-[13px] font-extrabold">
                      {app.studentName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] text-slate-500">{app.jobPostTitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${status.colorClasses} text-[11px] font-semibold`}>
                      {status.icon}
                      {status.label}
                    </div>
                    <span className="text-[11px] text-slate-500">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
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
      className="max-w-[1200px] mx-auto px-6 mb-5"
    >
      <CardWrapper className="p-5">
        <div className="mb-4">
          <Label>{t('enterprise.quickActions', 'Quick Actions')}</Label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('enterprise.viewKanban', 'Applicant Kanban'), icon: <Users size={18} />, variant: 'primary' as const, target: 'applicants' },
            { label: t('enterprise.manageEvaluations', 'Manage Evaluations'), icon: <Star size={18} />, variant: 'ghost' as const, target: 'evaluation' },
            { label: t('enterprise.viewReports', 'View Reports'), icon: <Briefcase size={18} />, variant: 'ghost' as const, target: 'reports' },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(action.target)}
              className={`flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl cursor-pointer font-sans transition-all
                ${action.variant === 'primary' ? 'bg-[#E67E22] text-white shadow-[0_8px_22px_rgba(230,126,34,0.22)]' : 'bg-slate-50 text-slate-900 border border-slate-200 shadow-sm'}
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${action.variant === 'primary' ? 'bg-white/15 text-white' : 'bg-[#E67E22]/10 text-[#E67E22]'}
              `}>
                {action.icon}
              </div>
              <span className="text-[12px] font-bold text-center">{action.label}</span>
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
  const { message } = App.useApp();
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
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <EnterpriseContextBar companyName="Enterprise Portal" />

      <KPICardsRow stats={stats} onNavigate={handleNavigate} />
      <PipelineSummary stats={stats} />
      <RecentActivity applications={applications} />
      <QuickActions onNavigate={handleNavigate} />
    </div>
  );
};
