import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, message, Skeleton } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { StudentDashboardService } from '@/services/StudentDashboardService';
import type { StudentDashboardStats } from '@/services/StudentDashboardService';
import { StudentProfileService } from '@/services/StudentProfileService';
import { AreaChart } from '@/pages/training-manager/components/charts/AreaChart';
import { Sparkline } from '@/pages/training-manager/components/charts/Sparkline';
import { AnimatedStatCard } from '../components/shared/AnimatedStatCard';
import { FallbackLoader } from '@/components/FallbackLoader';
import { NeuSurface } from '../components/shared/NeuSurface';
import { cc } from '../constants';

const { Text } = Typography;

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const displayValue = useAnimatedNumber(value, 1200);
  return <>{displayValue.toLocaleString()}</>;
};

export const StudentDashboardTab: React.FC<{ animationDelay?: number }> = ({ animationDelay = 0 }) => {
  useScrollAnimation();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const response = await StudentDashboardService.getStats();
        if (response.data && response.data.result) {
          setStats(response.data.result);
        }
        
        // Fetch profile to get full name
        const profileRes = await StudentProfileService.getMyProfile();
        if (profileRes.data && profileRes.data.result) {
          setFullName(profileRes.data.result.fullName || '');
        }
      } catch (err: any) {
        console.error('Failed to load student dashboard statistics', err);
        if (err?.response?.data?.code === 1006) {
          setError('Vui lòng đổi mật khẩu mặc định trước khi truy cập Dashboard.');
        } else {
          setError('Không thể tải dữ liệu Dashboard. Vui lòng kiểm tra lại quyền truy cập hoặc đăng nhập lại.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const spotlightRef = React.useRef<HTMLDivElement>(null);
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.setProperty('--mouse-x', `${x}px`);
    spotlightRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  if (loading) {
    return <FallbackLoader text="Preparing your dashboard..." />;
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <WarningOutlined style={{ fontSize: 48, color: '#F59E0B' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.text }}>{error}</h2>
        <button onClick={() => navigate('/change-password')} style={{ padding: '10px 24px', borderRadius: 12, background: cc.primary, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Đi tới Đổi mật khẩu
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out' }}>
      <style>{`
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
        .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: stretch; }
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(15,23,42,.08); }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      
      {/* HERO CARD (Styled like Training Manager Dashboard) */}
      <div
        ref={spotlightRef}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          padding: '28px 30px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #ffffff 0%, #fff4ec 48%, #fffaf6 100%)',
          border: '1px solid rgba(230, 126, 34,.12)',
          boxShadow: '0 20px 50px rgba(15,23,42,.06), 0 8px 22px rgba(230, 126, 34,.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at var(--mouse-x, 100%) var(--mouse-y, 0%), rgba(230, 126, 34,.10), transparent 30%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'linear-gradient(180deg, #E67E22, #E67E22, #F39C12)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(230, 126, 34,.08)', color: cc.primaryDark, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                My Internship Process
              </div>
              <h1 style={{ fontSize: 32, lineHeight: 1.06, fontWeight: 900, color: cc.text, margin: 0, letterSpacing: '-0.8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Welcome back, {fullName || 'Student'}
              </h1>
              <p style={{ fontSize: 14.5, color: cc.textMuted, marginTop: 10, maxWidth: 600, lineHeight: 1.7 }}>
                Stay on top of your internship goals. You have submitted {stats.reportsThisWeek} reports this week and have {stats.upNextInterviews.length} upcoming interviews. Keep up the good work!
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <button onClick={() => navigate('/student/reports')} className="hover-lift" style={{ padding: '11px 20px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #FF662C, #FF824D, #FF9B73)', color: '#fff', fontWeight: 800, boxShadow: '0 8px 20px rgba(233,101,0,.22)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined /> Submit Report
              </button>
              <button onClick={() => navigate('/student/jobs')} className="hover-lift" style={{ padding: '11px 20px', borderRadius: 16, border: `1.5px solid rgba(230, 126, 34, 0.4)`, background: '#fff', color: cc.primary, fontWeight: 800, boxShadow: '0 4px 12px rgba(15,23,42,.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined /> Browse Jobs
              </button>
            </div>
          </div>
          
          <div style={{ flex: '0 1 300px', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
             <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
               <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                 <CheckCircleOutlined />
               </div>
               <div>
                 <div style={{ fontSize: 12, color: cc.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Applications</div>
                 <div style={{ fontSize: 20, fontWeight: 800, color: cc.text }}><AnimatedNumber value={stats.activeApplications} /></div>
               </div>
             </div>
             <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(226,232,240,.95)', boxShadow: '0 4px 18px rgba(15,23,42,.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
               <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                 <CalendarOutlined />
               </div>
               <div>
                 <div style={{ fontSize: 12, color: cc.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Interviews</div>
                 <div style={{ fontSize: 20, fontWeight: 800, color: cc.text }}><AnimatedNumber value={stats.upNextInterviews.length} /></div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">
        <AnimatedStatCard
          icon={<FileTextOutlined />}
          label="Total Applications"
          value={stats.activeApplications}
          trend={{ value: 12, label: 'from last semester', isPositive: true }}
          color={cc.primary}
        />
        <AnimatedStatCard
          icon={<CalendarOutlined />}
          label="Upcoming Interviews"
          value={stats.upNextInterviews.length}
          trend={{ value: 2, label: 'this week', isPositive: true }}
          color="#3B82F6"
        />
        <AnimatedStatCard
          icon={<CheckCircleOutlined />}
          label="Reports Submitted"
          value={stats.reportsThisWeek}
          trend={{ value: stats.reportsThisWeek >= 1 ? 100 : 0, label: 'weekly goal', isPositive: stats.reportsThisWeek >= 1 }}
          color="#10B981"
        />
        <AnimatedStatCard
          icon={<WarningOutlined />}
          label="Pending Tasks"
          value={stats.recentActivities.length}
          trend={{ value: 0, label: 'needs action', isPositive: false }}
          color="#F59E0B"
        />
      </div>

      <div className="bottom-grid">
        {/* CHARTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <NeuSurface style={{ padding: 24, flex: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: cc.text }}>Application Activity</h3>
                <Text type="secondary" style={{ fontSize: 13 }}>Your application volume over the semester</Text>
              </div>
            </div>
            <div style={{ height: 260 }}>
              <AreaChart data={[]} color={cc.primary} />
            </div>
          </NeuSurface>
        </div>

        {/* SIDE PANEL: RECENT ACTIVITY */}
        <NeuSurface style={{ padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,.02)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: cc.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ color: cc.primary }} /> Recent Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 5).map((activity, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cc.primary, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: cc.text }}>{activity.title}</div>
                    <div style={{ fontSize: 12, color: cc.textMuted, marginTop: 2 }}>{activity.description}</div>
                    <div style={{ fontSize: 11, color: cc.textLight, marginTop: 4 }}>{activity.timestamp}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: cc.textLight, marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: cc.textMuted }}>No recent activities</div>
              </div>
            )}
          </div>
          
          <button onClick={() => navigate('/student/applications')} style={{ width: '100%', marginTop: 20, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, color: cc.text, fontWeight: 600, cursor: 'pointer' }} className="hover-lift">
            View All History
          </button>
        </NeuSurface>
      </div>
    </div>
  );
};
