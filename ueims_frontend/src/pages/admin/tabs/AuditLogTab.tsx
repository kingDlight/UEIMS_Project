import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Spin,
  App,
  DatePicker,
  Button,
  Input,
  Select,
  Empty,
  Pagination,
} from 'antd';
import {
  AuditOutlined,
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UserOutlined,
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  FilterOutlined,
  GlobalOutlined,
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
  CREATE: <PlusOutlined />,
  UPDATE: <EditOutlined />,
  DELETE: <DeleteOutlined />,
  LOGIN: <UserOutlined />,
  LOGOUT: <UserOutlined />,
  APPROVE: <AuditOutlined />,
  REJECT: <AuditOutlined />,
  ASSIGN: <ApiOutlined />,
  REVOKE: <ApiOutlined />,
};

export const AuditLogTab: React.FC = () => {
  const { message } = App.useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const pageSize = 9; // Mirrors JobPostManagementTab & UsersTab

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      const matchesSearch = !searchTerm ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesDate = (!dateRange[0] && !dateRange[1]) ||
        (!dateRange[0] || new Date(log.timestamp) >= new Date(dateRange[0])) &&
        (!dateRange[1] || new Date(log.timestamp) <= new Date(dateRange[1] + 'T23:59:59'));
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
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to export audit logs.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px' }}>Audit Logs</h2>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Complete system activity history and action trail</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<ReloadOutlined />} onClick={fetchLogs} style={{ borderRadius: c.radiusMd }}>Refresh</Button>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              loading={exporting}
              onClick={handleExport}
              style={{ background: c.brand, borderColor: c.brand, borderRadius: c.radiusMd, fontWeight: 700 }}
            >
              Export Excel
            </Button>
          </div>
        </motion.div>

        {/* SEARCH + FILTERS */}
        {logs.length > 0 && (
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center',
            background: c.surface, padding: 12, borderRadius: c.radiusMd,
            border: `1px solid ${c.border}`,
          }}>
            <Input
              placeholder="Search user, action, entity, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              prefix={<SearchOutlined style={{ color: c.textMuted }} />}
              style={{ flex: 1, borderRadius: c.radiusMd }}
            />
            <Select
              value={actionFilter}
              onChange={setActionFilter}
              style={{ width: 170 }}
              options={[
                { value: 'ALL', label: 'All actions' },
                ...Object.keys(ACTION_COLORS).map(a => ({ value: a, label: a })),
              ]}
            />
            <RangePicker
              onChange={(dates, dateStrings) => {
                setDateRange([dateStrings[0] || null, dateStrings[1] || null]);
                setCurrentPage(1);
              }}
              style={{ borderRadius: c.radiusMd }}
            />
            <span style={{ fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap' }}>
              {filteredLogs.length} of {logs.length}
            </span>
          </div>
        )}

        {/* LIST */}
        {logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, padding: 60 }}
          >
            <Empty
              image={<AuditOutlined style={{ fontSize: 48, color: c.textMuted }} />}
              description={
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No audit entries yet</div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>System activity will appear here once actions are performed</div>
                </div>
              }
            />
          </motion.div>
        ) : filteredLogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, padding: 60 }}
          >
            <Empty
              image={<FilterOutlined style={{ fontSize: 48, color: c.textMuted }} />}
              description={
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No matching entries</div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>Try adjusting the search, action, or date range</div>
                </div>
              }
            />
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              <AnimatePresence>
                {paginatedLogs.map((log: any, i) => {
                  const actionType = (log.action || '').split('_').pop() || log.action;
                  const actionCfg = ACTION_COLORS[actionType] || { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) };
                  const actionIcon = ACTION_ICONS[actionType] || <AuditOutlined />;
                  return (
                    <motion.div
                      key={log.id ?? i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      style={{
                        background: c.surface, borderRadius: c.radiusLg,
                        border: `1px solid ${c.border}`, boxShadow: c.shadowSm,
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      }}
                    >
                      {/* Card header */}
                      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: c.radiusMd,
                            background: actionCfg.bg, color: actionCfg.color,
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            border: `1px solid ${hexToRgba(actionCfg.color, 0.25)}`,
                          }}>
                            {actionIcon} {log.action}
                          </span>
                          <span style={{ fontSize: 11, color: c.textMuted, whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: hexToRgba(c.brand, 0.12), color: c.brand,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700,
                          }}>
                            <UserOutlined />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.userEmail || 'System'}
                            </div>
                            {log.entityType && (
                              <div style={{ fontSize: 11, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {log.entityType}{log.entityId ? ` · ${String(log.entityId).slice(0, 8)}…` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {log.details && (
                          <div style={{ fontSize: 12, color: c.textSecondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {log.details}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: c.textMuted, fontFamily: 'monospace' }}>
                          <GlobalOutlined style={{ color: c.brand }} />
                          <span>{log.ipAddress || '—'}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredLogs.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} entries`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
