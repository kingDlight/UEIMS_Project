import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Spin } from 'antd';
import {
  TeamOutlined,
  BankOutlined,
  AuditOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
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

const Card: React.FC<{
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
      animate={{ y: hovered && hoverable ? -2 : 0, boxShadow: hovered && hoverable ? c.shadowMd : c.shadowSm }}
      transition={{ duration: 0.15 }}
      style={{
        backgroundColor: c.surface,
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

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textMuted }}>
    {children}
  </span>
);

const AuditTrailTable: React.FC<{ logs: any[] }> = ({ logs }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 160px', gap: 8, padding: '6px 8px', borderBottom: `1px solid ${c.borderSubtle}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: c.textMuted }}>User</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: c.textMuted }}>Action</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: c.textMuted }}>Entity</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: c.textMuted }}>Timestamp</span>
      </div>
      {logs.map((log, idx) => (
        <div key={log.id ?? idx} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 160px', gap: 8, padding: '10px 8px', borderBottom: idx < logs.length - 1 ? `1px solid ${c.borderSubtle}` : 'none' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.userEmail || 'System'}</span>
          <span style={{ fontSize: 12, color: c.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action}</span>
          <span style={{ fontSize: 12, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.entityType}</span>
          <span style={{ fontSize: 11, color: c.textMuted }}>{new Date(log.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [roleChartData, setRoleChartData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryData, logsData] = await Promise.allSettled([
          AdminService.getAdminStats(),
          AdminService.getAuditLogs({ size: 10 }),
        ]);

        if (summaryData.status === 'fulfilled') {
          setStats(summaryData.value);
        }
        if (logsData.status === 'fulfilled') {
          const logs = Array.isArray(logsData.value)
            ? logsData.value
            : (logsData.value as any)?.result ?? [];
          setRecentLogs(logs.slice(0, 8));
        }

        // Build role distribution from summary
        if (summaryData.status === 'fulfilled') {
          const s = summaryData.value as any;
          setRoleChartData([
            { role: 'Students', count: s.totalStudents ?? 0, fill: c.info },
            { role: 'Enterprises', count: s.totalEnterprises ?? 0, fill: c.success },
            { role: 'Training Mgrs', count: s.totalTrainers ?? 0, fill: c.warning },
            { role: 'Admins', count: s.totalAdmins ?? 1, fill: c.brand },
          ]);
        }
      } catch (err) {
        console.error('Admin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div style={{
            backgroundColor: c.surface,
            borderRadius: c.radiusLg,
            border: `1px solid ${c.border}`,
            boxShadow: c.shadowSm,
            padding: '16px 24px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: 0, letterSpacing: '-0.02em' }}>
                Admin Command Center
              </h1>
              <p style={{ fontSize: 13, color: c.textSecondary, margin: '4px 0 0' }}>
                System overview, user management and audit trail
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 700,
                color: c.success, backgroundColor: hexToRgba(c.success, 0.08),
                padding: '4px 10px', borderRadius: c.radiusFull,
                border: `1px solid ${hexToRgba(c.success, 0.2)}`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.success, boxShadow: `0 0 0 3px ${c.success}20`, animation: 'pulse-dot 2s ease-in-out infinite' }} />
                System Online
              </span>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <Card style={{ padding: 18, borderLeft: `4px solid ${c.info}`, backgroundColor: hexToRgba(c.info, 0.04) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Label>Total Users</Label>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c.text, marginTop: 4 }}>
                    {stats?.totalUsers ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>All roles combined</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, backgroundColor: hexToRgba(c.info, 0.16), color: c.info, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TeamOutlined />
                </div>
              </div>
            </Card>

            <Card style={{ padding: 18, borderLeft: `4px solid ${c.success}`, backgroundColor: hexToRgba(c.success, 0.04) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Label>Enterprises</Label>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c.text, marginTop: 4 }}>
                    {stats?.totalEnterprises ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
                    {stats?.pendingEnterprises?.length ?? 0} pending approval
                  </div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, backgroundColor: hexToRgba(c.success, 0.16), color: c.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BankOutlined size={20} />
                </div>
              </div>
            </Card>

            <Card style={{ padding: 18, borderLeft: `4px solid ${c.warning}`, backgroundColor: hexToRgba(c.warning, 0.04) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Label>Active Incidents</Label>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c.text, marginTop: 4 }}>
                    {stats?.activeIncidents?.length ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>Require attention</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, backgroundColor: hexToRgba(c.warning, 0.16), color: c.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WarningOutlined size={20} />
                </div>
              </div>
            </Card>

            <Card style={{ padding: 18, borderLeft: `4px solid ${c.brand}`, backgroundColor: hexToRgba(c.brand, 0.04) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Label>Audit Entries</Label>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c.text, marginTop: 4 }}>
                    {recentLogs.length}+
                  </div>
                  <div style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>Recent system logs</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, backgroundColor: hexToRgba(c.brand, 0.16), color: c.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AuditOutlined size={20} />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

            {/* Role Distribution */}
            <Card style={{ padding: 20 }}>
              <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>User Role Distribution</h3>
                <p style={{ fontSize: 12, color: c.textSecondary, margin: '2px 0 0' }}>Total accounts by role</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roleChartData.map(item => (
                  <div key={item.role} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.text, width: 110 }}>{item.role}</span>
                    <div style={{ flex: 1, height: 28, borderRadius: c.radiusMd, background: hexToRgba(item.fill, 0.1), border: `1px solid ${hexToRgba(item.fill, 0.25)}`, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (item.count / Math.max(...roleChartData.map(r => r.count || 1))) * 100)}%`,
                        background: item.fill,
                        borderRadius: c.radiusMd,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 10,
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Health */}
            <Card style={{ padding: 20 }}>
              <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>System Health</h3>
                <p style={{ fontSize: 12, color: c.textSecondary, margin: '2px 0 0' }}>Runtime status overview</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Database', status: 'Connected', icon: <CheckCircleOutlined size={16} />, color: c.success },
                  { label: 'Email Service', status: 'Operational', icon: <CheckCircleOutlined size={16} />, color: c.success },
                  { label: 'File Storage', status: 'Available', icon: <CheckCircleOutlined size={16} />, color: c.success },
                  { label: 'API Gateway', status: 'Active', icon: <ThunderboltOutlined />, color: c.info },
                  { label: 'Scheduled Jobs', status: 'Running', icon: <ClockCircleOutlined size={16} />, color: c.warning },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: c.radiusMd, background: c.neutralBg, border: `1px solid ${c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Audit Trail */}
          <Card style={{ padding: 20 }}>
            <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Recent Audit Trail</h3>
                <p style={{ fontSize: 12, color: c.textSecondary, margin: '2px 0 0' }}>Latest system activities</p>
              </div>
              <a href="/admin/audit" style={{ fontSize: 13, fontWeight: 600, color: c.brand, textDecoration: 'none' }}>View all →</a>
            </div>
            {recentLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: c.textMuted, fontSize: 13 }}>No audit entries yet</div>
            ) : (
              <AuditTrailTable logs={recentLogs} />
            )}
          </Card>

        </motion.div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1024px) {
          .admin-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
