import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Spin,
  App,
  DatePicker,
  Button,
  Input,
  Select,
  Empty,
  Pagination,
  Modal,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  ApiOutlined,
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { RequestLogService, type RequestLogEntry, type HttpMethod } from '@/services/RequestLogService';
import { useRequestLogStream } from '@/hooks/useRequestLogStream';
import { c } from '../constants';

const { RangePicker } = DatePicker;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const METHOD_COLORS: Record<string, { color: string; bg: string }> = {
  GET:    { color: c.success, bg: hexToRgba(c.success, 0.1) },
  POST:   { color: c.brand,   bg: hexToRgba(c.brand, 0.1) },
  PUT:    { color: c.info,    bg: hexToRgba(c.info, 0.1) },
  PATCH:  { color: c.purple,  bg: hexToRgba(c.purple, 0.1) },
  DELETE: { color: c.error,   bg: hexToRgba(c.error, 0.1) },
};

const STATUS_COLORS: Record<string, string> = {
  '2': c.success,
  '3': c.warning,
  '4': c.error,
  '5': c.error,
};

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return c.success;
  if (status >= 300 && status < 400) return c.warning;
  if (status >= 400 && status < 500) return c.error;
  if (status >= 500) return c.error;
  return c.textMuted;
}

const METHOD_OPTIONS = [
  { value: '', label: 'All methods' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];

export const RequestLogTab: React.FC = () => {
  const { message } = App.useApp();

  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [investigateModal, setInvestigateModal] = useState(false);
  const [investigateUserId, setInvestigateUserId] = useState<string | null>(null);
  const [investigateLogs, setInvestigateLogs] = useState<RequestLogEntry[]>([]);
  const [investigateLoading, setInvestigateLoading] = useState(false);
  const [investigateTotal, setInvestigateTotal] = useState(0);
  const [investigatePage, setInvestigatePage] = useState(1);

  // Live-stream state — entries that arrived via WebSocket but couldn't be
  // prepended (because a filter is active or the user is paginated away
  // from page 1). Surfaced as a "X new logs" badge.
  const [pendingNew, setPendingNew] = useState(0);
  const { status: streamStatus, onLog } = useRequestLogStream();

  // Are we in a state where incoming live logs can be prepended directly?
  const canLivePrepend =
    currentPage === 1 &&
    pageSize === 20 &&
    !searchTerm &&
    !methodFilter &&
    !dateRange[0] &&
    !dateRange[1];

  useEffect(() => {
    const off = onLog((entry) => {
      if (canLivePrepend) {
        setLogs((prev) => {
          if (prev.some((e) => e.id === entry.id)) return prev;
          return [entry, ...prev].slice(0, pageSize);
        });
        setTotal((t) => t + 1);
      } else {
        setPendingNew((n) => n + 1);
      }
    });
    return off;
  }, [onLog, canLivePrepend, pageSize]);

  const fetchLogs = async (page = currentPage) => {
    setLoading(true);
    try {
      const data: any = await RequestLogService.getLogs({
        endpoint: searchTerm || undefined,
        method: (methodFilter as HttpMethod) || undefined,
        startDate: dateRange[0] ?? undefined,
        endDate: dateRange[1] ?? undefined,
        page: page - 1,
        size: pageSize,
      });

      if (data?.content) {
        setLogs(data.content);
        setTotal(data.totalElements ?? 0);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotal(data.length);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load request logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [currentPage, pageSize, searchTerm, methodFilter, dateRange]);

  // Whenever the visible query changes, drain the "new logs" backlog so it
  // doesn't linger after the user has already navigated.
  useEffect(() => { setPendingNew(0); }, [currentPage, searchTerm, methodFilter, dateRange]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await RequestLogService.exportCsv({
        endpoint: searchTerm || undefined,
        method: (methodFilter as HttpMethod) || undefined,
        startDate: dateRange[0] ?? undefined,
        endDate: dateRange[1] ?? undefined,
      });
      const url = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `request_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Request logs exported successfully.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to export request logs.');
    } finally {
      setExporting(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const removed = await RequestLogService.clearAll();
      setLogs([]);
      setTotal(0);
      setPendingNew(0);
      message.success(`Cleared ${Number(removed).toLocaleString()} request log entries.`);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to clear request logs.');
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  };

  const handleInvestigate = async (userId: string) => {
    setInvestigateUserId(userId);
    setInvestigateModal(true);
    setInvestigatePage(1);
  };

  const fetchInvestigateLogs = async (page = investigatePage) => {
    if (!investigateUserId) return;
    setInvestigateLoading(true);
    try {
      const data: any = await RequestLogService.getLogsByUser(investigateUserId, page - 1, 20);
      if (data?.content) {
        setInvestigateLogs(data.content);
        setInvestigateTotal(data.totalElements ?? 0);
      } else if (Array.isArray(data)) {
        setInvestigateLogs(data);
        setInvestigateTotal(data.length);
      }
    } catch (err: any) {
      message.error('Failed to load user request history.');
    } finally {
      setInvestigateLoading(false);
    }
  };

  useEffect(() => {
    if (investigateModal) fetchInvestigateLogs();
  }, [investigateModal, investigatePage, investigateUserId]);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 170,
      render: (ts: string) => (
        <span style={{ fontSize: 12, color: c.textSecondary, fontFamily: 'monospace' }}>
          {new Date(ts).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 200,
      render: (email: string, record: RequestLogEntry) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: hexToRgba(c.brand, 0.12), color: c.brand,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            <UserOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            {email ? (
              <Tooltip title={`User ID: ${record.userId}`}>
                <a
                  onClick={(e) => { e.preventDefault(); handleInvestigate(record.userId!); }}
                  style={{ fontSize: 12, fontWeight: 600, color: c.brand, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {email}
                </a>
              </Tooltip>
            ) : (
              <span style={{ fontSize: 12, color: c.textMuted }}>Anonymous</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 90,
      render: (method: string) => {
        const cfg = METHOD_COLORS[method] || { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) };
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 8px', borderRadius: 4,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700,
            border: `1px solid ${hexToRgba(cfg.color, 0.25)}`,
          }}>
            {method}
          </span>
        );
      },
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (endpoint: string) => (
        <span style={{
          fontSize: 12, fontFamily: 'monospace',
          color: c.text, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', display: 'block', maxWidth: 400,
        }} title={endpoint}>
          {endpoint}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 80,
      render: (status: number) => {
        if (!status) return <span style={{ color: c.textMuted }}>—</span>;
        const color = getStatusColor(status);
        return (
          <Tag
            style={{
              background: hexToRgba(color, 0.1),
              color: color,
              border: `1px solid ${hexToRgba(color, 0.3)}`,
              fontWeight: 700,
              fontSize: 11,
              borderRadius: 4,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Time',
      dataIndex: 'responseTimeMs',
      key: 'responseTimeMs',
      width: 80,
      render: (ms: number) => {
        if (!ms) return <span style={{ color: c.textMuted }}>—</span>;
        const color = ms > 1000 ? c.error : ms > 500 ? c.warning : c.success;
        return (
          <Tooltip title="Response time">
            <span style={{
              fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color,
            }}>
              {ms}ms
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip: string) => (
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: c.textSecondary }}>
          {ip || '—'}
        </span>
      ),
    },
  ];

  const investigateColumns = columns.filter(col =>
    ['timestamp', 'method', 'endpoint', 'statusCode', 'responseTimeMs'].includes(col.key as string)
  );

  if (loading && logs.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, flexWrap: 'wrap', gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px' }}>
                Request Logs
              </h2>
              <LiveStatusBadge status={streamStatus} />
            </div>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>
              HTTP request activity — auto-purged after 7 days
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchLogs()}
              style={{ borderRadius: c.radiusMd }}
            >
              Refresh
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={total === 0 && logs.length === 0}
              loading={clearing}
              onClick={() => setConfirmClear(true)}
              style={{ borderRadius: c.radiusMd }}
            >
              Clear all
            </Button>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              loading={exporting}
              onClick={handleExport}
              style={{
                background: c.brand, borderColor: c.brand,
                borderRadius: c.radiusMd, fontWeight: 700,
              }}
            >
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* FILTER BAR */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center',
          background: c.surface, padding: 12, borderRadius: c.radiusMd,
          border: `1px solid ${c.border}`, flexWrap: 'wrap',
        }}>
          <Input
            placeholder="Search endpoint..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            allowClear
            prefix={<SearchOutlined style={{ color: c.textMuted }} />}
            style={{ flex: 1, minWidth: 200, borderRadius: c.radiusMd }}
          />
          <Select
            value={methodFilter}
            onChange={(v) => { setMethodFilter(v); setCurrentPage(1); }}
            style={{ width: 140 }}
            options={METHOD_OPTIONS}
          />
          <RangePicker
            onChange={(dates, dateStrings) => {
              setDateRange([dateStrings[0] || null, dateStrings[1] || null]);
              setCurrentPage(1);
            }}
            style={{ borderRadius: c.radiusMd }}
          />
          {pendingNew > 0 ? (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setPendingNew(0);
                setSearchTerm(''); setMethodFilter(''); setDateRange([null, null]);
                setCurrentPage(1);
              }}
              style={{
                background: c.brand, borderColor: c.brand,
                borderRadius: c.radiusMd, fontWeight: 700,
              }}
            >
              {pendingNew} new {pendingNew === 1 ? 'log' : 'logs'}
            </Button>
          ) : null}
          <span style={{ fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap' }}>
            {total.toLocaleString()} entries
          </span>
        </div>

        {/* TABLE */}
        {logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              background: c.surface, borderRadius: c.radiusLg,
              border: `1px solid ${c.border}`, padding: 60,
            }}
          >
            <Empty
              image={<ApiOutlined style={{ fontSize: 48, color: c.textMuted }} />}
              description={
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>
                    No request logs yet
                  </div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>
                    HTTP activity will appear here once users interact with the system
                  </div>
                </div>
              }
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              background: c.surface, borderRadius: c.radiusLg,
              border: `1px solid ${c.border}`, overflow: 'hidden',
            }}>
              <Table
                dataSource={logs}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="middle"
                scroll={{ x: 900 }}
                style={{ fontSize: 13 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={(p, ps) => {
                  setCurrentPage(p);
                  if (ps !== pageSize) setPageSize(ps ?? 20);
                }}
                showSizeChanger
                showTotal={(t, range) => `${range[0]}-${range[1]} of ${t.toLocaleString()}`}
                pageSizeOptions={['10', '20', '50', '100']}
              />
            </div>
          </motion.div>
        )}

        {/* INVESTIGATE MODAL */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined style={{ color: c.brand }} />
              <span>Request history: {investigateUserId}</span>
            </div>
          }
          open={investigateModal}
          onCancel={() => setInvestigateModal(false)}
          footer={null}
          width={900}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ padding: '16px 24px' }}>
            <Table
              dataSource={investigateLogs}
              columns={investigateColumns}
              rowKey="id"
              loading={investigateLoading}
              pagination={false}
              size="small"
              scroll={{ x: 700 }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Pagination
                current={investigatePage}
                pageSize={20}
                total={investigateTotal}
                onChange={(p) => setInvestigatePage(p)}
                showTotal={(t, range) => `${range[0]}-${range[1]} of ${t}`}
                size="small"
              />
            </div>
          </div>
        </Modal>

        {/* CLEAR CONFIRMATION */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DeleteOutlined style={{ color: c.error }} />
              <span>Clear all request logs</span>
            </div>
          }
          open={confirmClear}
          onCancel={() => !clearing && setConfirmClear(false)}
          confirmLoading={clearing}
          okText="Yes, clear all"
          okButtonProps={{ danger: true }}
          cancelButtonProps={{ disabled: clearing }}
          onOk={handleClear}
        >
          <p style={{ margin: '8px 0 4px', fontSize: 14, color: c.text }}>
            This will permanently delete <b>{total.toLocaleString()}</b> request log
            {total === 1 ? '' : 's'} from the database.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: c.textMuted }}>
            Future requests will be logged again as usual. This action cannot be undone.
          </p>
        </Modal>

      </div>
    </div>
  );
};

const LiveStatusBadge: React.FC<{ status: 'connecting' | 'open' | 'closed' | 'error' }> = ({ status }) => {
  if (status === 'open') {
    return (
      <span
        title="Live stream connected — new logs appear in real time"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 999,
          background: hexToRgba(c.success, 0.12), color: c.success,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: c.success,
          boxShadow: `0 0 0 4px ${hexToRgba(c.success, 0.25)}`,
        }} />
        LIVE
      </span>
    );
  }
  if (status === 'connecting') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 999,
        background: hexToRgba(c.warning, 0.12), color: c.warning,
        fontSize: 11, fontWeight: 700,
      }}>
        <SyncOutlined spin style={{ fontSize: 11 }} /> CONNECTING
      </span>
    );
  }
  return (
    <Tooltip title="Live stream unavailable — press Refresh to reload manually">
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 999,
        background: hexToRgba(c.error, 0.10), color: c.error,
        fontSize: 11, fontWeight: 700,
      }}>
        {status === 'error' ? <DisconnectOutlined style={{ fontSize: 11 }} /> : <WifiOutlined style={{ fontSize: 11 }} />}
        OFFLINE
      </span>
    </Tooltip>
  );
};
