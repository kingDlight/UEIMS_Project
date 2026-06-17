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
import { c } from '../constants';

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

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: c.textMuted, ...style,
  }}>
    {children}
  </span>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: c.radiusLg, border: `1px solid ${c.border}`,
    boxShadow: c.shadowSm, padding: 20, ...style,
  }}>
    {children}
  </div>
);

const Bar: React.FC<{ value: number; max: number; color: string; height?: number }> = ({ value, max, color, height = 8 }) => {
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div style={{ width: '100%', height, background: c.borderSubtle, borderRadius: c.radiusFull, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        style={{ height: '100%', background: color, borderRadius: c.radiusFull }}
      />
    </div>
  );
};

const StatusPill: React.FC<{ status: string; count: number }> = ({ status, count }) => {
  const map: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    PENDING: { color: c.warning, label: 'Pending', icon: <Clock size={12} /> },
    INTERVIEW_SCHEDULED: { color: c.info, label: 'Interviewing', icon: <Calendar size={12} /> },
    ACCEPTED: { color: c.success, label: 'Accepted', icon: <CheckCircle2 size={12} /> },
    REJECTED: { color: c.error, label: 'Rejected', icon: <XCircle size={12} /> },
  };
  const s = map[status] ?? { color: c.textMuted, label: status, icon: <Clock size={12} /> };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: c.radiusFull, background: `${s.color}14`, border: `1px solid ${s.color}33`, color: s.color, fontSize: 11, fontWeight: 700 }}>
      {s.icon} {s.label}: <span style={{ fontWeight: 800 }}>{count}</span>
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: c.radiusMd,
          background: `linear-gradient(135deg, ${c.brand}, ${c.brandHover})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: c.shadowBrand
        }}>
          <BarChart3 size={20} />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: c.text, lineHeight: 1.1 }}>
            {t('analytics.title', 'Recruitment Analytics')}
          </div>
          <div style={{ fontSize: 12.5, color: c.textMuted, marginTop: 4 }}>
            {t('analytics.subtitle', 'Insights into your hiring pipeline and student engagement')}
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Applicants', value: stats.total, color: c.info, icon: <Users size={18} /> },
          { label: 'Active Job Posts', value: stats.activePosts, color: c.brand, icon: <Briefcase size={18} /> },
          { label: 'Pass Rate', value: `${stats.passRate}%`, color: c.success, icon: <TrendingUp size={18} /> },
          { label: 'Assigned Students', value: assignments.length, color: '#8B5CF6', icon: <CheckCircle2 size={18} /> },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: c.radiusMd,
                  background: `${k.color}14`, color: k.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {k.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: k.color, padding: '2px 8px', borderRadius: c.radiusFull, background: `${k.color}14` }}>
                  {k.label.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {k.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Label>{t('analytics.statusDistribution', 'Status Distribution')}</Label>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted }}>
                <PieIcon size={13} /> {stats.total} total
              </span>
            </div>
            {stats.total === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: c.textMuted, fontSize: 13 }}>
                {t('analytics.noData', 'No application data yet')}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', height: 14, borderRadius: c.radiusFull, overflow: 'hidden', background: c.borderSubtle, gap: 2, marginBottom: 16 }}>
                  {[
                    { label: 'Pending', value: stats.pending, color: c.warning },
                    { label: 'Interviewing', value: stats.interviewing, color: c.info },
                    { label: 'Accepted', value: stats.accepted, color: c.success },
                    { label: 'Rejected', value: stats.rejected, color: c.error },
                  ].map((seg) => (
                    <motion.div
                      key={seg.label}
                      initial={{ flex: 0 }}
                      animate={{ flex: seg.value || 0.001 }}
                      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                      style={{ background: seg.color, borderRadius: 2 }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Label>{t('analytics.last7Days', 'New Applications (Last 7 Days)')}</Label>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted }}>
                <TrendingUp size={13} /> {last7Days.reduce((s, d) => s + d.count, 0)} total
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, padding: '0 4px' }}>
              {last7Days.map((d, i) => {
                const h = (d.count / last7Max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.text }}>{d.count}</div>
                    <div style={{ width: '100%', height: 110, display: 'flex', alignItems: 'flex-end' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(h, 3)}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                        style={{
                          width: '100%',
                          background: d.count > 0 ? `linear-gradient(180deg, ${c.brand}, ${c.brandHover})` : c.borderSubtle,
                          borderRadius: '6px 6px 2px 2px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: c.textMuted, fontWeight: 600 }}>{d.label}</div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Label>{t('analytics.topJobPosts', 'Top Job Posts by Applicants')}</Label>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted }}>
              <Briefcase size={13} /> {topJobPosts.length} posts
            </span>
          </div>
          {topJobPosts.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: c.textMuted, fontSize: 13 }}>
              {t('analytics.noJobPosts', 'No job post data available yet')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topJobPosts.map((jp, i) => {
                const max = topJobPosts[0]?.count || 1;
                return (
                  <div key={jp.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 60px 60px', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: c.brand }}>#{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: c.text, marginBottom: 6 }}>{jp.title}</div>
                      <Bar value={jp.count} max={max} color={c.brand} />
                    </div>
                    <div style={{ fontSize: 12, textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: c.text }}>{jp.count}</div>
                      <div style={{ fontSize: 10, color: c.textMuted }}>applicants</div>
                    </div>
                    <div style={{ fontSize: 12, textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: c.success }}>{jp.accepted}</div>
                      <div style={{ fontSize: 10, color: c.textMuted }}>accepted</div>
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
