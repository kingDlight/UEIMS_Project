import React, { useEffect, useState } from 'react';
import { BackgroundEffects } from '../../home/components/BackgroundEffects';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { BankOutlined, ClockCircleOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { Typography, Spin } from 'antd';

import { c } from '../constants';

import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber';
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const displayValue = useAnimatedNumber(value, 1200);
  return <>{displayValue.toLocaleString()}</>;
};

import { dashboardAlerts, enterpriseApprovals, heroSparklineData, kpiSparklineA, kpiSparklineB, kpiSparklineC, kpiSparklineD, weeklyReportData } from '../data';
import type { PageKey } from '../types';
const AreaChart = React.lazy(() => import('../components/charts/AreaChart').then(m => ({ default: m.AreaChart })));
const Sparkline = React.lazy(() => import('../components/charts/Sparkline').then(m => ({ default: m.Sparkline })));
import { FallbackLoader } from '../../../components/FallbackLoader';
import { AnimatedStatCard } from '../components/shared/AnimatedStatCard';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { DashboardService } from '@/services/DashboardService';
import { SemesterService } from '@/services/SemesterService';


const { Text } = Typography;

export const DashboardTab: React.FC<{ animationDelay?: number; onNavigate?: (page: PageKey) => void }> = ({ animationDelay = 0, onNavigate }) => {
  useScrollAnimation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInterns: 0,
    atRisk: 0,
    enterprises: 0,
    reportsThisWeek: 0,
  });
  const [currentSemesterCode, setCurrentSemesterCode] = useState('N/A');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const activeSemester = await SemesterService.getActiveSemester();
      if (activeSemester) {
        setCurrentSemesterCode(activeSemester.semesterCode);
        const data = await DashboardService.getStatisticsBySemester(activeSemester.semesterId);
        setStats({
          totalStudents: data.totalEligible || 0,
          activeInterns: data.totalOjt || 0,
          atRisk: data.totalCancelled || 0,
          enterprises: data.totalApplications || 0,
          reportsThisWeek: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard statistics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const pendingApprovals = enterpriseApprovals.filter((enterprise) => enterprise.status === 'Pending review').length;
  const spotlightRef = React.useRef<HTMLDivElement>(null);
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.setProperty('--mouse-x', `${x}px`);
    spotlightRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out' }}>
      <BackgroundEffects isDark={false} />
      <style>{`
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
        .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: stretch; }
        .mini-cards-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 14px; align-items: stretch; }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
          .mini-cards-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .mini-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {/* HERO CARD */}
      <div
        style={{
          position: 'relative',
          padding: '28px 30px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(255,255,255,.75) 0%, rgba(255,244,236,.7) 48%, rgba(255,250,246,.8) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(230, 126, 34,.12)',
          boxShadow: '0 20px 50px rgba(15,23,42,.10), 0 8px 22px rgba(230, 126, 34,.10)',
          overflow: 'hidden',
        }}
      >
        <div ref={spotlightRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at var(--mouse-x, 100%) var(--mouse-y, 0%), rgba(230, 126, 34,.14), transparent 30%), radial-gradient(circle at 20% 20%, rgba(255,138,90,.10), transparent 25%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'linear-gradient(180deg, #E67E22, #E67E22, #F39C12)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(230, 126, 34,.08)', color: c.primaryDark, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                Current Semester: {currentSemesterCode}
              </div>
              <h1 style={{ fontSize: 34, lineHeight: 1.06, fontWeight: 900, color: c.text, margin: 0, letterSpacing: '-1.2px' }}>Internship operations at a glance.</h1>
              <p style={{ fontSize: 14.5, color: c.textMuted, marginTop: 10, maxWidth: 720, lineHeight: 1.7 }}>
                {stats.totalStudents.toLocaleString()} eligible students, {stats.enterprises} enterprise applications, and live progress for Training Manager supervision.
              </p>
            </div>
            {/* 3 hero mini-cards — equal height row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <div style={{ padding: '10px 14px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }} className="hover-lift">
                <div style={{ fontSize: 11, color: c.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Students</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: c.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.totalStudents} /></div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }} className="hover-lift">
                <div style={{ fontSize: 11, color: c.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Applications</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: c.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.enterprises} /></div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 68 }} className="hover-lift">
                <div style={{ fontSize: 11, color: c.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>OJT Active</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: c.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.activeInterns} /></div>
              </div>
            </div>
          </div>
          <div style={{ flex: '0 1 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 20, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)' }} className="hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: c.textMuted, fontWeight: 700 }}>Review Approvals</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: c.text, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={pendingApprovals} /></div>
                  <div style={{ fontSize: 12, color: c.warning, fontWeight: 700, marginTop: 4 }}>Enterprise registrations pending</div>
                </div>
                <div style={{ width: 62, height: 62, borderRadius: 18, background: 'linear-gradient(135deg, rgba(230, 126, 34,.16), rgba(255,138,90,.10))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BankOutlined style={{ fontSize: 22, color: c.primary }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <React.Suspense fallback={<FallbackLoader minHeight="42px" size={24} />}>
                  <Sparkline data={heroSparklineData} color={c.primary} width={260} height={42} />
                </React.Suspense>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
              <div style={{ padding: 14, borderRadius: 18, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }} className="hover-lift">
                <div>
                  <div style={{ fontSize: 12, color: c.textMuted, fontWeight: 700 }}>Pending</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: c.text, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={pendingApprovals} /></div>
                </div>
                <div style={{ fontSize: 12, color: c.primaryDark, marginTop: 4, fontWeight: 600 }}>Review now</div>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }} className="hover-lift">
                <div>
                  <div style={{ fontSize: 12, color: c.textMuted, fontWeight: 700 }}>Cancelled</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: c.danger, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={stats.atRisk} /></div>
                </div>
                <div style={{ fontSize: 12, color: c.danger, marginTop: 4, fontWeight: 600 }}>Cancelled OJT</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate?.('enterprises')} style={{ padding: '11px 16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #E67E22, #E67E22, #F39C12)', color: '#fff', fontWeight: 800, boxShadow: '0 12px 28px rgba(230, 126, 34,.22)', cursor: 'pointer' }}>Review Approvals</button>
              <button onClick={() => onNavigate?.('incidents')} style={{ padding: '11px 16px', borderRadius: 16, border: 'none', background: '#fff1f2', color: c.danger, fontWeight: 800, boxShadow: '0 8px 18px rgba(15,23,42,.05)', cursor: 'pointer' }}>Escalate now</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI STAT CARDS — equal height via alignItems: stretch */}
      <div className="kpi-grid">
        <AnimatedStatCard label="Total Eligible" value={stats.totalStudents} icon={<UserOutlined />} color={c.primary} trend="Live total" insight="All internship-eligible records" sparkline={kpiSparklineA} delay={100 + animationDelay} />
        <AnimatedStatCard label="Total Applications" value={stats.enterprises} icon={<BankOutlined />} color={c.info} trend="Job Applications" insight="Total CVs applied" sparkline={kpiSparklineB} delay={200 + animationDelay} />
        <AnimatedStatCard label="OJT Students" value={stats.activeInterns} icon={<ClockCircleOutlined />} color={c.success} trend="Active" insight="Students currently in OJT" sparkline={kpiSparklineC} delay={300 + animationDelay} />
        <AnimatedStatCard label="Cancelled OJT" value={stats.atRisk} icon={<WarningOutlined />} color={c.danger} trend="Failed" insight="Cancelled or Failed OJT" sparkline={kpiSparklineD} delay={400 + animationDelay} />
      </div>

      {/* BOTTOM ROW: Weekly Reports + Recent Alerts — equal height */}
      <div className="bottom-grid">
        <NeuSurface style={{ padding: 24, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out .3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>Weekly Reports</h2>
              <Text style={{ fontSize: 12, color: c.textMuted }}>Submitted vs pending by day</Text>
            </div>
            <SmallPill color={c.success} glow>Live tracking</SmallPill>
          </div>
          <div style={{ height: 170 }}>
            <React.Suspense fallback={<FallbackLoader minHeight="170px" />}>
              <AreaChart data={weeklyReportData.map((d) => d.submitted)} color={c.primary} />
            </React.Suspense>
          </div>
          {/* 5 mini-cards — equal height via alignItems: stretch + minHeight */}
          <div className="mini-cards-grid">
            {weeklyReportData.map((day) => (
              <div key={day.day} style={{ padding: '10px 12px', borderRadius: 14, background: c.bgLight, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 72 }} className="hover-lift">
                <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700 }}>{day.day}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: c.text, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}><AnimatedNumber value={day.submitted} /></div>
                <div style={{ fontSize: 11, color: c.primaryDark, fontWeight: 700, marginTop: 4 }}><AnimatedNumber value={day.pending} /> pending</div>
              </div>
            ))}
          </div>
        </NeuSurface>

        <NeuSurface style={{ padding: 24, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out .4s', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>Recent Alerts</h2>
            <SmallPill color={c.warning}>Live</SmallPill>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {dashboardAlerts.map((item) => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: c.text }}>{item.title}</div>
                  <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </NeuSurface>
      </div>
    </div>
  );
};
