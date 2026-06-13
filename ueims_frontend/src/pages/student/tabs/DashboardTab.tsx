import React, { useEffect, useState } from 'react';
import { CalendarOutlined, TrophyOutlined, FileTextOutlined, SnippetsOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Spin, Skeleton } from 'antd';
import { motion, animate } from 'framer-motion';
import { cc, hexToRgba } from '../constants';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { AnimatedStatCard } from '../components/shared/AnimatedStatCard';
import { Sparkline } from '../components/charts/Sparkline';
import { AreaChart } from '../components/charts/AreaChart';
import { useNavigate } from 'react-router-dom';
import { StudentDashboardService, type StudentDashboardStats } from '@/services/StudentDashboardService';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1.2, onUpdate: v => setDisplayValue(Math.round(v)) });
    return () => controls.stop();
  }, [value]);
  return <>{displayValue.toLocaleString()}</>;
};

export const StudentDashboardTab: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentDashboardStats>({
    applications: 0, interviews: 0, reports: 0, daysRemaining: 0, semesterName: '—', semesterStatus: 'N/A',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await StudentDashboardService.getStats();
        setStats(data);
      } catch {
        // fallback: keep zero values
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const sparklineData = [12, 19, 15, 22, 18, 25, 20];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, fontFamily: 'Inter, sans-serif' }}>
        <style>{`
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
          .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: stretch; }
          @media (max-width: 1024px) {
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
            .bottom-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 640px) {
            .kpi-grid { grid-template-columns: 1fr; }
          }
        `}</style>
        
        {/* Skeleton Hero Card */}
        <div style={{ padding: '28px 30px', borderRadius: 28, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
          <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 2, width: ['40%', '30%'] }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: 100, height: 68, borderRadius: 16, background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton.Button active shape="round" block style={{ height: 32, width: 60 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton KPI Grid */}
        <div className="kpi-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ padding: 20, borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Skeleton.Avatar active shape="square" size="small" />
                <Skeleton.Button active size="small" shape="round" style={{ width: 60 }} />
              </div>
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
            </div>
          ))}
        </div>

        {/* Skeleton Bottom Grid */}
        <div className="bottom-grid">
          <div style={{ padding: 24, borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
             <Skeleton active title={{ width: '30%' }} paragraph={{ rows: 4 }} />
          </div>
          <div style={{ padding: 24, borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)' }}>
             <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 3 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
        .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: stretch; }
        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO CARD */}
      <div style={{
        position: 'relative',
        padding: '28px 30px',
        borderRadius: 28,
        background: 'linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,244,236,.92) 48%, rgba(255,250,246,.96) 100%)',
        border: '1px solid rgba(230, 126, 34,.12)',
        boxShadow: '0 20px 50px rgba(15,23,42,.10), 0 8px 22px rgba(230, 126, 34,.10)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top right, rgba(230, 126, 34,.14), transparent 30%), radial-gradient(circle at 20% 20%, rgba(255,138,90,.10), transparent 25%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'linear-gradient(180deg, #E67E22, #E67E22, #F39C12)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(233,101,0,.08)', color: cc.primaryDark, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                <CalendarOutlined /> {stats.semesterName || 'Semester'}
              </div>
              <h1 style={{ fontSize: 34, lineHeight: 1.06, fontWeight: 900, color: cc.text, margin: 0, letterSpacing: '-1.2px' }}>Your internship journey, at a glance.</h1>
              <p style={{ fontSize: 14.5, color: cc.textMuted, marginTop: 10, maxWidth: 720, lineHeight: 1.7 }}>
                {stats.applications} applications, {stats.interviews} interviews scheduled, {stats.reports} reports submitted this semester.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: '10px 14px', borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }}>
                <div style={{ fontSize: 11, color: cc.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Applications</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: cc.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.applications} /></div>
              </motion.div>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: '10px 14px', borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }}>
                <div style={{ fontSize: 11, color: cc.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Interviews</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: cc.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.interviews} /></div>
              </motion.div>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: '10px 14px', borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }}>
                <div style={{ fontSize: 11, color: cc.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Reports</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: cc.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.reports} /></div>
              </motion.div>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: '10px 14px', borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }}>
                <div style={{ fontSize: 11, color: cc.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Days Left</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: cc.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.daysRemaining} /></div>
              </motion.div>
            </div>
          </div>
          <div style={{ flex: '0 1 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: 16, borderRadius: 20, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: cc.textMuted, fontWeight: 700 }}>Progress</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: cc.text, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>68%</div>
                  <div style={{ fontSize: 12, color: cc.success, fontWeight: 700, marginTop: 4 }}>On track</div>
                </div>
                <div style={{ width: 62, height: 62, borderRadius: 18, background: `linear-gradient(135deg, ${cc.primary}26, ${cc.primaryDark}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrophyOutlined style={{ fontSize: 22, color: cc.primary }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}><Sparkline data={sparklineData} color={cc.primary} width={260} height={42} /></div>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }}>
                <div>
                  <div style={{ fontSize: 12, color: cc.textMuted, fontWeight: 700 }}>Status</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: cc.success, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>Active</div>
                </div>
                <div style={{ fontSize: 12, color: cc.success, marginTop: 4, fontWeight: 600 }}>Internship running</div>
              </motion.div>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }}>
                <div>
                  <div style={{ fontSize: 12, color: cc.textMuted, fontWeight: 700 }}>Reports Due</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: cc.warning, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>1</div>
                </div>
                <div style={{ fontSize: 12, color: cc.warning, marginTop: 4, fontWeight: 600 }}>This week</div>
              </motion.div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/student-dashboard/reports')} style={{ padding: '11px 16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #FF662C, #FF824D, #FF9B73)', color: '#fff', fontWeight: 800, boxShadow: '0 12px 28px rgba(233,101,0,.22)', cursor: 'pointer' }}>Submit Report</button>
              <button onClick={() => navigate('/student-dashboard/jobs')} style={{ padding: '11px 16px', borderRadius: 16, border: `1.5px solid ${cc.primary}`, background: '#fff', color: cc.primary, fontWeight: 800, boxShadow: '0 8px 18px rgba(15,23,42,.05)', cursor: 'pointer' }}>Browse Jobs</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI STAT CARDS */}
      <div className="kpi-grid">
        <AnimatedStatCard label="Applications" value={stats.applications} icon={<FileTextOutlined style={{ fontSize: 20 }} />} color={cc.info} trend="Total" insight="Job applications sent" sparkline={[1, 2, 1, 3, 2, 3, 3]} delay={100} />
        <AnimatedStatCard label="Interviews" value={stats.interviews} icon={<CalendarOutlined style={{ fontSize: 20 }} />} color={cc.warning} trend="Scheduled" insight="Upcoming interviews" sparkline={[0, 0, 1, 1, 0, 1, 1]} delay={200} />
        <AnimatedStatCard label="Reports Submitted" value={stats.reports} icon={<SnippetsOutlined style={{ fontSize: 20 }} />} color={cc.success} trend="This semester" insight="Weekly reports completed" sparkline={[0, 1, 2, 2, 3, 4, 4]} delay={300} />
        <AnimatedStatCard label="Days Remaining" value={stats.daysRemaining} icon={<ClockCircleOutlined style={{ fontSize: 20 }} />} color={cc.primary} trend="Until end" insight="OJT duration" sparkline={[90, 85, 80, 75, 70, 65, 60]} delay={400} />
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-grid">
        <NeuSurface style={{ padding: 24, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out .3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: cc.text, margin: 0 }}>Report Progress</h2>
              <span style={{ fontSize: 12, color: cc.textMuted }}>Weekly submission trend</span>
            </div>
            <SmallPill color={cc.success} glow>Live tracking</SmallPill>
          </div>
          <div style={{ height: 170 }}><AreaChart data={[0, 1, 2, 2, 3, 4, 4]} color={cc.primary} /></div>
        </NeuSurface>

        <NeuSurface style={{ padding: 24, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out .4s', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: cc.text, margin: 0 }}>Recent Activity</h2>
            <SmallPill color={cc.warning}>Live</SmallPill>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {[
              { title: 'Application submitted to TechCorp', meta: '2 hours ago', tone: cc.info },
              { title: 'Weekly report W22 approved', meta: 'Yesterday', tone: cc.success },
              { title: 'Interview scheduled for Jul 15', meta: '3 days ago', tone: cc.warning },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ x: 2, transition: { duration: 0.15 } }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)', cursor: 'pointer' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: cc.text }}>{item.title}</div>
                  <div style={{ fontSize: 11.5, color: cc.textMuted, marginTop: 3 }}>{item.meta}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </NeuSurface>
      </div>
    </div>
  );
};
