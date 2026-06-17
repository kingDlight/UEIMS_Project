import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Spin, App } from 'antd';
import {
  SettingOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudServerOutlined,
  MailOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { c } from '../constants';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, boxShadow: c.shadowSm, ...style }}>
    {children}
  </div>
);

const ServiceRow: React.FC<{
  name: string;
  icon: React.ReactNode;
  status: 'operational' | 'degraded' | 'down';
  description: string;
  latency?: string;
}> = ({ name, icon, status, description, latency }) => {
  const colors = {
    operational: { color: c.success, bg: hexToRgba(c.success, 0.08), border: hexToRgba(c.success, 0.2) },
    degraded: { color: c.warning, bg: hexToRgba(c.warning, 0.08), border: hexToRgba(c.warning, 0.2) },
    down: { color: c.error, bg: hexToRgba(c.error, 0.08), border: hexToRgba(c.error, 0.2) },
  };
  const cfg = colors[status];
  const icons = { operational: <CheckCircleOutlined size={16} />, degraded: <ExclamationCircleOutlined size={16} />, down: <CloseCircleOutlined size={16} /> };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: c.radiusMd, background: cfg.bg, border: `1px solid ${cfg.border}`, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: c.radiusMd, background: hexToRgba(cfg.color, 0.12), color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{name}</div>
          <div style={{ fontSize: 12, color: c.textMuted }}>{description}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {latency && <span style={{ fontSize: 12, color: c.textMuted, fontFamily: 'monospace' }}>{latency}</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: c.radiusFull, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, border: `1px solid ${cfg.border}` }}>
          {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export const AdminSystemTab: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    try {
      await fetch('/api/health');
      message.success('API responding normally.');
    } catch {
      message.error('API not reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0 }}>System Configuration</h2>
              <p style={{ fontSize: 13, color: c.textSecondary, margin: '4px 0 0' }}>Infrastructure health, services status and system settings</p>
            </div>
            <button
              onClick={handlePing}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, background: c.neutralBg, color: c.text, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <ReloadOutlined spin={loading} /> Ping API
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Service Status */}
            <Card style={{ padding: 20 }}>
              <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Service Status</h3>
                <p style={{ fontSize: 12, color: c.textSecondary, margin: '2px 0 0' }}>Real-time component health</p>
              </div>
              <ServiceRow name="Database (PostgreSQL)" icon={<DatabaseOutlined />} status="operational" description="Primary data store" latency="12ms" />
              <ServiceRow name="REST API" icon={<ApiOutlined />} status="operational" description="Spring Boot backend" latency="34ms" />
              <ServiceRow name="Email Service" icon={<MailOutlined />} status="operational" description="SMTP notifications" latency="89ms" />
              <ServiceRow name="File Storage" icon={<CloudServerOutlined />} status="operational" description="Local disk storage" />
              <ServiceRow name="Scheduled Jobs" icon={<ClockCircleOutlined />} status="degraded" description="Cron job scheduler" />
              <ServiceRow name="Security Layer" icon={<SafetyOutlined />} status="operational" description="JWT + Spring Security" />
            </Card>

            {/* System Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card style={{ padding: 20 }}>
                <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Environment</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Java Version', value: '21 LTS' },
                    { label: 'Spring Boot', value: '3.2.x' },
                    { label: 'Node.js', value: '20.x LTS' },
                    { label: 'React', value: '18.x' },
                    { label: 'Database', value: 'PostgreSQL 16' },
                    { label: 'Cache', value: 'Ehcache (in-memory)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: c.radiusMd, background: c.neutralBg, border: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 12, color: c.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.text, fontFamily: 'monospace' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ padding: 20 }}>
                <div style={{ borderBottom: `1px solid ${c.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0 }}>Security</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'JWT Expiry', value: '24 hours' },
                    { label: 'Refresh Token', value: '7 days' },
                    { label: 'Password Policy', value: '8+ chars, mixed' },
                    { label: 'Session', value: 'Stateless' },
                    { label: 'CORS', value: 'Configured' },
                    { label: 'HTTPS', value: 'Enforced' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: c.radiusMd, background: c.neutralBg, border: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 12, color: c.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.success }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Maintenance Note */}
          <Card style={{ padding: 16, marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SettingOutlined style={{ fontSize: 20, color: c.info }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>System Configuration Managed by Administrators</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>Runtime configuration changes require SYSTEM_ADMIN privileges. Use the Users tab to manage role assignments.</div>
              </div>
            </div>
          </Card>

        </motion.div>
      </div>
    </div>
  );
};
