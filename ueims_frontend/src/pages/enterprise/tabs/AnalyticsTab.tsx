import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Spin, App } from 'antd';
import {
  ArrowRight, Users, CheckCircle2, XCircle, Clock, Calendar,
  Briefcase, TrendingUp, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { ApplicationService } from '@/services/ApplicationService';
import { JobPostService } from '@/services/JobPostService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';

type Application = {
  applicationId: string;
  studentName?: string;
  studentCode?: string;
  jobPostTitle?: string;
  jobPostId?: string;
  status: string;
  createdAt: string;
};

type JobPost = {
  jobPostId: string;
  title: string;
  status?: string;
  enterpriseId?: string;
};

type Assignment = {
  assignmentId: string;
  studentId?: string;
  studentName?: string;
  status?: string;
};

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${className}`}>
    {children}
  </span>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const Bar: React.FC<{ value: number; max: number; colorClass: string; heightClass?: string }> = ({ value, max, colorClass, heightClass = 'h-2' }) => {
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div className={`w-full ${heightClass} bg-slate-100 rounded-full overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  );
};

const StatusPill: React.FC<{ status: string; count: number }> = ({ status, count }) => {
  const map: Record<string, { colorClass: string; bgClass: string; borderClass: string; label: string; icon: React.ReactNode }> = {
    PENDING: { colorClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-500/20', label: 'Pending', icon: <Clock size={12} /> },
    INTERVIEW_SCHEDULED: { colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-500/20', label: 'Interviewing', icon: <Calendar size={12} /> },
    ACCEPTED: { colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-500/20', label: 'Accepted', icon: <CheckCircle2 size={12} /> },
    REJECTED: { colorClass: 'text-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-500/20', label: 'Rejected', icon: <XCircle size={12} /> },
  };
  const s = map[status] ?? { colorClass: 'text-slate-500', bgClass: 'bg-slate-50', borderClass: 'border-slate-500/20', label: status, icon: <Clock size={12} /> };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bgClass} ${s.borderClass} ${s.colorClass} text-[11px] font-bold`}>
      {s.icon} {s.label}: <span className="font-extrabold">{count}</span>
    </div>
  );
};

const AnalyticsTab: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [appsRes, postsRes, assignRes] = await Promise.allSettled([
          ApplicationService.getMyEnterprise(),
          JobPostService.getAll(),
          EnterpriseAssignmentService.getMyEnterpriseAssignments(),
        ]);

        const extract = (r: any) => r?.value?.data?.result ?? r?.value?.data ?? r?.value ?? [];

        if (appsRes.status === 'fulfilled') {
          const arr = extract(appsRes);
          setApplications(Array.isArray(arr) ? arr : []);
        } else {
          message.error('Failed to load applications analytics');
        }
        if (postsRes.status === 'fulfilled') {
          const arr = extract(postsRes);
          setJobPosts(Array.isArray(arr) ? arr : []);
        }
        if (assignRes.status === 'fulfilled') {
          const arr = extract(assignRes);
          setAssignments(Array.isArray(arr) ? arr : []);
        }
      } catch (err) {
        message.error(t('analytics.loadError', 'Unable to load analytics data.'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const myJobPostIds = useMemo(() => new Set(jobPosts.map(j => j.jobPostId)), [jobPosts]);

  const stats = useMemo(() => {
    const mine = applications.filter(a => !a.jobPostId || myJobPostIds.has(a.jobPostId));
    const total = mine.length;
    const pending = mine.filter(a => a.status === 'PENDING').length;
    const interviewing = mine.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
    const accepted = mine.filter(a => a.status === 'ACCEPTED').length;
    const rejected = mine.filter(a => a.status === 'REJECTED').length;
    const passRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const activePosts = jobPosts.filter((j: any) => j.status === 'ACTIVE' || j.isActive === true || j.active === true).length;
    return { total, pending, interviewing, accepted, rejected, passRate, activePosts };
  }, [applications, jobPosts, myJobPostIds]);

  const topJobPosts = useMemo(() => {
    const map: Record<string, { title: string; count: number; accepted: number }> = {};
    applications.forEach(a => {
      if (!a.jobPostId) return;
      if (!map[a.jobPostId]) {
        map[a.jobPostId] = { title: a.jobPostTitle || a.jobPostId, count: 0, accepted: 0 };
      }
      map[a.jobPostId].count += 1;
      if (a.status === 'ACCEPTED') map[a.jobPostId].accepted += 1;
    });
    return Object.entries(map)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [applications]);

  const last7Days = useMemo(() => {
    const days: { label: string; count: number }[] = [];
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
        count,
      });
    }
    return days;
  }, [applications]);

  const last7Max = Math.max(1, ...last7Days.map(d => d.count));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E67E22] to-[#D68910] flex items-center justify-center text-white shadow-[0_8px_22px_rgba(230,126,34,0.22)]">
          <BarChart3 size={20} />
        </div>
        <div>
          <div className="text-[22px] font-extrabold text-slate-900 leading-[1.1]">
            {t('analytics.title', 'Recruitment Analytics')}
          </div>
          <div className="text-[12.5px] text-slate-500 mt-1">
            {t('analytics.subtitle', 'Insights into your hiring pipeline and student engagement')}
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Applicants', value: stats.total, colorClass: 'text-blue-500', bgClass: 'bg-blue-50', icon: <Users size={18} /> },
          { label: 'Active Job Posts', value: stats.activePosts, colorClass: 'text-[#E67E22]', bgClass: 'bg-[#E67E22]/10', icon: <Briefcase size={18} /> },
          { label: 'Pass Rate', value: `${stats.passRate}%`, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', icon: <TrendingUp size={18} /> },
          { label: 'Assigned Students', value: assignments.length, colorClass: 'text-purple-500', bgClass: 'bg-purple-50', icon: <CheckCircle2 size={18} /> },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-3.5">
                <div className={`w-10 h-10 rounded-xl ${k.bgClass} ${k.colorClass} flex items-center justify-center`}>
                  {k.icon}
                </div>
                <span className={`text-[10px] font-bold ${k.colorClass} px-2 py-0.5 rounded-full ${k.bgClass}`}>
                  {k.label.toUpperCase()}
                </span>
              </div>
              <div className="text-[30px] font-extrabold text-slate-900 leading-none tabular-nums">
                {k.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-5">
        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Label>{t('analytics.statusDistribution', 'Status Distribution')}</Label>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                <PieIcon size={13} /> {stats.total} total
              </span>
            </div>
            {stats.total === 0 ? (
              <div className="py-8 text-center text-slate-500 text-[13px]">
                {t('analytics.noData', 'No application data yet')}
              </div>
            ) : (
              <>
                <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-100 gap-0.5 mb-4">
                  {[
                    { label: 'Pending', value: stats.pending, bgClass: 'bg-amber-500' },
                    { label: 'Interviewing', value: stats.interviewing, bgClass: 'bg-blue-500' },
                    { label: 'Accepted', value: stats.accepted, bgClass: 'bg-emerald-500' },
                    { label: 'Rejected', value: stats.rejected, bgClass: 'bg-red-500' },
                  ].map((seg) => (
                    <motion.div
                      key={seg.label}
                      initial={{ flex: 0 }}
                      animate={{ flex: seg.value || 0.001 }}
                      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                      className={`${seg.bgClass} rounded-[2px]`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <StatusPill status="PENDING" count={stats.pending} />
                  <StatusPill status="INTERVIEW_SCHEDULED" count={stats.interviewing} />
                  <StatusPill status="ACCEPTED" count={stats.accepted} />
                  <StatusPill status="REJECTED" count={stats.rejected} />
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* Last 7 Days */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Label>{t('analytics.last7Days', 'New Applications (Last 7 Days)')}</Label>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                <TrendingUp size={13} /> {last7Days.reduce((s, d) => s + d.count, 0)} total
              </span>
            </div>
            <div className="flex items-end gap-2.5 h-[140px] px-1">
              {last7Days.map((d, i) => {
                const h = (d.count / last7Max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-[11px] font-bold text-slate-900">{d.count}</div>
                    <div className="w-full h-[110px] flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(h, 3)}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                        className={`w-full rounded-t-md rounded-b-sm ${d.count > 0 ? 'bg-gradient-to-b from-[#E67E22] to-[#D68910]' : 'bg-slate-100'}`}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">{d.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Job Posts */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Label>{t('analytics.topJobPosts', 'Top Job Posts by Applicants')}</Label>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
              <Briefcase size={13} /> {topJobPosts.length} posts
            </span>
          </div>
          {topJobPosts.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-[13px]">
              {t('analytics.noJobPosts', 'No job post data available yet')}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {topJobPosts.map((jp, i) => {
                const max = topJobPosts[0]?.count || 1;
                return (
                  <div key={jp.id} className="grid grid-cols-[24px_1fr_60px_60px] gap-3 items-center">
                    <div className="text-[12px] font-extrabold text-[#E67E22]">#{i + 1}</div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-slate-900 mb-1.5">{jp.title}</div>
                      <Bar value={jp.count} max={max} colorClass="bg-[#E67E22]" />
                    </div>
                    <div className="text-[12px] text-right">
                      <div className="font-extrabold text-slate-900">{jp.count}</div>
                      <div className="text-[10px] text-slate-500">applicants</div>
                    </div>
                    <div className="text-[12px] text-right">
                      <div className="font-extrabold text-emerald-500">{jp.accepted}</div>
                      <div className="text-[10px] text-slate-500">accepted</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;
