import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Spin } from 'antd';
import {
  TrophyOutlined,
  UsersOutlined,
  BankOutlined,
  TeamOutlined,
  TrendingUp,
  ClockCircleOutlined,
  FileTextOutlined,
  AlertTriangleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { AdminService } from '@/services/AdminService';
import { c } from '../constants';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, boxShadow: c.shadowSm, ...style }}
  >
    {children}
  </motion.div>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; description?: string }> = ({ label, value, icon, color, description }) => (
  <Card style={{ padding: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textMuted }}>{label}</span>
        <div style={{ fontSize: 28, fontWeight: 800, color: c.text, marginTop: 4 }}>{value}</div>
        {description && <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>{description}</div>}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, background: hexToRgba(color, 0.12), color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
    </div>
  </Card>
);

export const AdminStatsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AdminService.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Stats load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  const p = stats?.pipeline ?? {};

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0 }}>Analytics Overview</h2>
            <p style={{ fontSize: 13, color: c.textSecondary, margin: '4px 0 0' }}>System-wide statistics and performance metrics</p>
          </div>

          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Students" value={stats?.totalStudents ?? 0} icon={<UsersOutlined />} color={c.info} />
            <StatCard label="Enterprises" value={stats?.totalEnterprises ?? 0} icon={<BankOutlined />} color={c.success} description={`${stats?.pendingEnterprises?.length ?? 0} pending`} />
            <StatCard label="Pending Approvals" value={stats?.pendingEnterprises?.length ?? 0} icon={<ClockCircleOutlined />} color={c.warning} />
            <StatCard label="Active Incidents" value={stats?.activeIncidents?.length ?? 0} icon={<AlertTriangleOutlined />} color={c.error} />
          </div>

          {/* Pipeline Funnel */}
          <Card style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Placement Pipeline</h3>
              <p style={{ fontSize: 12, color: c.textSecondary, margin: '2px 0 0' }}>Student progression through the internship pipeline</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Eligible', value: p.eligible ?? 0, color: c.info },
                { label: 'Applied', value: p.applied ?? 0, color: c.warning },
                { label: 'Interviewed', value: p.interviewed ?? 0, color: c.brand },
                { label: 'Placed', value: p.placed ?? 0, color: c.success },
              ].map((stage, i) => (
                <div key={stage.label} style={{ textAlign: 'center', padding: '20px 12px', borderRadius: c.radiusLg, background: hexToRgba(stage.color, 0.08), border: `1px solid ${hexToRgba(stage.color, 0.25)}` }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: stage.color }}>{stage.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{stage.label}</div>
                  {i > 0 && (
                    <ArrowRightOutlined style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', color: c.textMuted, fontSize: 16 }} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Reports + Attention */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Weekly Reports</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Submitted', value: stats?.weeklyReports?.submitted ?? 0, color: c.success },
                  { label: 'Pending', value: stats?.weeklyReports?.pending ?? 0, color: c.info },
                  { label: 'Late', value: stats?.weeklyReports?.late ?? 0, color: c.error },
                  { label: 'Not Started', value: stats?.weeklyReports?.notStarted ?? 0, color: c.textMuted },
                ].map(item => (
                  <div key={item.label} style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: hexToRgba(item.color, 0.08), border: `1px solid ${hexToRgba(item.color, 0.2) }`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{item.label}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Attention Required</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats?.pendingEnterprises?.length > 0 && (
                  <div style={{ padding: '10px 12px', borderRadius: c.radiusMd, background: hexToRgba(c.warning, 0.08), border: `1px solid ${hexToRgba(c.warning, 0.2)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Pending Enterprises</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: c.warning }}>{stats.pendingEnterprises.length}</span>
                  </div>
                )}
                {stats?.activeIncidents?.length > 0 && (
                  <div style={{ padding: '10px 12px', borderRadius: c.radiusMd, background: hexToRgba(c.error, 0.08), border: `1px solid ${hexToRgba(c.error, 0.2)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Active Incidents</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: c.error }}>{stats.activeIncidents.length}</span>
                  </div>
                )}
                {(!stats?.pendingEnterprises?.length && !stats?.activeIncidents?.length) && (
                  <div style={{ textAlign: 'center', padding: 20, color: c.textMuted, fontSize: 13 }}>
                    All systems running normally
                  </div>
                )}
              </div>
            </Card>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
