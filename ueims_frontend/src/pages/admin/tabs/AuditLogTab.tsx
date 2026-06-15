import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Spin, App, DatePicker, Button } from 'antd';
import {
  AuditOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { AdminService } from '@/services/AdminService';
import { c } from '../constants';

const { RangePicker } = DatePicker;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ACTION_COLORS: Record<string, { color: string; bg: string }> = {
  CREATE: { color: c.success, bg: hexToRgba(c.success, 0.1) },
  UPDATE: { color: c.info, bg: hexToRgba(c.info, 0.1) },
  DELETE: { color: c.error, bg: hexToRgba(c.error, 0.1) },
  LOGIN: { color: c.brand, bg: hexToRgba(c.brand, 0.1) },
  LOGOUT: { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) },
  APPROVE: { color: c.success, bg: hexToRgba(c.success, 0.1) },
  REJECT: { color: c.error, bg: hexToRgba(c.error, 0.1) },
  ASSIGN: { color: c.purple, bg: hexToRgba(c.purple, 0.1) },
  REVOKE: { color: c.warning, bg: hexToRgba(c.warning, 0.1) },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <PlusOutlined size={12} />,
  UPDATE: <EditOutlined size={12} />,
  DELETE: <DeleteOutlined size={12} />,
  LOGIN: <UserOutlined size={12} />,
  LOGOUT: <UserOutlined size={12} />,
  APPROVE: <AuditOutlined size={12} />,
  REJECT: <AuditOutlined size={12} />,
  ASSIGN: <ApiOutlined size={12} />,
  REVOKE: <ApiOutlined size={12} />,
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, boxShadow: c.shadowSm, ...style }}>
    {children}
  </div>
);

export const AuditLogTab: React.FC = () => {
  const { message } = App.useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const pageSize = 15;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchTerm ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesDate = (!dateRange[0] && !dateRange[1]) ||
        (!dateRange[0] || new Date(log.timestamp) >= new Date(dateRange[0])) &&
        (!dateRange[1] || new Date(log.timestamp) <= new Date(dateRange[1]));
      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, searchTerm, actionFilter, dateRange]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, actionFilter, dateRange]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await AdminService.exportAuditLogs(dateRange[0] ?? undefined, dateRange[1] ?? undefined);
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Audit logs exported successfully.');
    } catch (err) {
      message.error('Failed to export audit logs.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header */}
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0 }}>Audit Logs</h2>
              <p style={{ fontSize: 13, color: c.textSecondary, margin: '4px 0 0' }}>Complete system activity history and action trail</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<ReloadOutlined />} onClick={fetchLogs}>Refresh</Button>
              <Button icon={<DownloadOutlined />} type="primary" loading={exporting} onClick={handleExport} style={{ background: c.brand, borderColor: c.brand }}>
                Export Excel
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card style={{ padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
                <input
                  type="text"
                  placeholder="Search user, action, entity..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', color: c.text }}
                />
              </div>
              <select
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 12px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', color: c.text, minWidth: 140, background: '#fff' }}
              >
                <option value="ALL">All Actions</option>
                {Object.keys(ACTION_COLORS).map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <RangePicker
                onChange={(dates, dateStrings) => {
                  setDateRange([dateStrings[0] || null, dateStrings[1] || null]);
                  setCurrentPage(1);
                }}
                style={{ borderRadius: c.radiusMd }}
              />
              <span style={{ fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap' }}>
                {filteredLogs.length} entries
              </span>
            </div>
          </Card>

          {/* Log Table */}
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: c.neutralBg, borderBottom: `1px solid ${c.border}` }}>
                    {['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textMuted, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: c.textMuted, fontSize: 13 }}>No audit entries match your filters</td>
                    </tr>
                  ) : paginatedLogs.map((log, idx) => {
                    const actionCfg = ACTION_COLORS[log.action] || { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) };
                    return (
                      <tr key={log.id ?? idx} style={{ borderBottom: idx < paginatedLogs.length - 1 ? `1px solid ${c.borderSubtle}` : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: c.text, fontWeight: 600 }}>{log.userEmail || 'System'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: c.radiusMd, fontSize: 11, fontWeight: 700, background: actionCfg.bg, color: actionCfg.color }}>
                            {ACTION_ICONS[log.action] || <AuditOutlined size={12} />}
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: c.textSecondary }}>{log.entityType || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: c.textMuted, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                          {log.details || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: c.textMuted, fontFamily: 'monospace' }}>{log.ipAddress || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredLogs.length > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16, borderTop: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {Array.from({ length: Math.ceil(filteredLogs.length / pageSize) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: 36, height: 36, borderRadius: c.radiusMd,
                        border: `1px solid ${currentPage === page ? c.brand : c.border}`,
                        background: currentPage === page ? c.brand : 'transparent',
                        color: currentPage === page ? '#fff' : c.textSecondary,
                        fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

        </motion.div>
      </div>
    </div>
  );
};
