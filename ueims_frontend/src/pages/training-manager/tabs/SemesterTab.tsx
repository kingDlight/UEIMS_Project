import React, { useState, useCallback, useEffect } from 'react';
import { Table, Modal, Form, DatePicker, Input, Button, Popconfirm, App, Select } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import {
  Plus,
  CalendarDays,
  Clock,
  Pencil,
  Star,
  Power,
} from 'lucide-react';
import dayjs from 'dayjs';
import { SemesterService } from '@/services/SemesterService';

// ============================================================
// COLOR UTILITY
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// DESIGN TOKENS — matches OJTTab Command Center aesthetic
// ============================================================
const cc = {
  brand: '#FF7A30',
  brandHover: '#E86A20',
  brandMuted: '#FFF3E8',
  brandSubtle: '#FFF8F0',
  success: '#10B981',
  successMuted: '#D1FAE5',
  successText: '#065F46',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  warningText: '#92400E',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  infoText: '#1E40AF',
  purple: '#8B5CF6',
  purpleMuted: '#EDE9FE',
  neutral: '#6B7280',
  neutralMuted: '#F3F4F6',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: 'rgba(255, 255, 255, 0.72)',
  neutralBg: '#F9FAFB',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,
  shadowSm: '0 1px 3px rgba(0,0,0,.08)',
};

// ============================================================
// TYPES
// ============================================================
type SemesterStatus = 'Current' | 'Upcoming' | 'Completed';

interface SemesterRecord {
  id: string;
  name: string;
  semesterCode: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  status: SemesterStatus;
  originalStatus: string;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
const HeaderBadge: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({
  children,
  align = 'left',
}) => (
  <span
    style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: cc.textMuted,
      display: 'block',
      textAlign: align,
    }}
  >
    {children}
  </span>
);

interface StatusBadgeProps {
  status: SemesterStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { message } = App.useApp();
  const config: Record<SemesterStatus, { bg: string; border: string; color: string; dot: string; label: string }> = {
    Current: {
      bg: cc.successMuted,
      border: hexToRgba(cc.success, 0.4),
      color: cc.successText,
      dot: cc.success,
      label: 'Current',
    },
    Upcoming: {
      bg: cc.brandMuted,
      border: hexToRgba(cc.brand, 0.4),
      color: cc.warningText,
      dot: cc.brand,
      label: 'Upcoming',
    },
    Completed: {
      bg: cc.neutralMuted,
      border: cc.border,
      color: cc.neutral,
      dot: cc.neutral,
      label: 'Completed',
    },
  };

  const cfg = config[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const SemesterTab: React.FC = () => {
  const { message } = App.useApp();
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<SemesterRecord | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [isMobile, setIsMobile] = useState(false);

  const [tableParams, setTableParams] = useState<{
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }>({});
  
  const fetchSemesters = useCallback(async (params?: { status?: string; sortBy?: string; sortDir?: string }) => {
    try {
      const data = await SemesterService.getAllSemesters(params?.status, params?.sortBy, params?.sortDir);
      const mapped: SemesterRecord[] = data.map((s) => {
        const start = dayjs(s.startDate);
        const end = dayjs(s.endDate);
        const durationWeeks = Math.round(end.diff(start, 'day', true) / 7);
        
        let status: SemesterStatus = 'Completed';
        if (s.status === 'ACTIVE') status = 'Current';
        else if (s.status === 'DRAFT' || s.status === 'OPEN') {
           status = dayjs(s.endDate).isBefore(dayjs(), 'day') ? 'Completed' : 'Upcoming';
        }
        else if (s.status === 'LOCKED' || s.status === 'CLOSED') status = 'Completed';
        
        return {
          id: s.semesterId,
          name: s.name,
          semesterCode: s.semesterCode,
          startDate: s.startDate,
          endDate: s.endDate,
          durationWeeks: Math.max(1, durationWeeks),
          status,
          originalStatus: s.status,
        };
      });
      setSemesters(mapped);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch semesters');
    }
  }, [message]);

  useEffect(() => {
    void fetchSemesters(tableParams);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSetCurrent = useCallback(async (record: SemesterRecord) => {
    try {
      // Backend state machine: DRAFT -> OPEN -> ACTIVE. If the semester is
      // still DRAFT, promote it to OPEN first so the activate call succeeds.
      if (record.status === 'Upcoming') {
        try {
          await SemesterService.openSemester(record.id);
        } catch (openErr) {
          // Already OPEN / not in DRAFT — ignore and try activate.
          console.debug('openSemester skipped:', openErr);
        }
      }
      await SemesterService.activateSemester(record.id);
      message.success({ content: `"${record.name}" is now set as Current semester.`, duration: 2.5 });
      void fetchSemesters();
    } catch (err) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to set current semester';
      message.error(msg);
    }
  }, [fetchSemesters]);

  const handleCloseSemester = useCallback(async (record: SemesterRecord) => {
    try {
      await SemesterService.closeSemester(record.id);
      message.success({ content: `"${record.name}" has been closed.`, duration: 2.5 });
      void fetchSemesters();
    } catch (err) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to close semester';
      message.error(msg);
    }
  }, [fetchSemesters]);

  const handleEditTimeline = useCallback((record: SemesterRecord) => {
    setSelectedSemester(record);
    editForm.setFieldsValue({
      name: record.name,
      semesterCode: record.semesterCode,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setIsEditModalOpen(true);
  }, [editForm]);

  const handleEditSave = useCallback(async () => {
    try {
      const values = await editForm.validateFields();
      const [start, end] = values.dateRange ?? [];
      if (!start || !end) {
        message.error('Please pick a start and end date.');
        return;
      }
      if (!selectedSemester) return;
      await SemesterService.updateSemester(selectedSemester.id, {
        semesterCode: values.semesterCode,
        name: values.name,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
      });
      message.success({ content: `Timeline for "${values.name}" updated successfully.`, duration: 2.5 });
      setIsEditModalOpen(false);
      editForm.resetFields();
      void fetchSemesters();
    } catch (err: unknown) {
      // Ant Design form validation errors have errorFields — skip toast for those
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update semester. The dates may be locked because the semester is Active or Closed.';
      message.error({ content: msg, duration: 4 });
    }
  }, [editForm, selectedSemester, fetchSemesters]);

  const handleCreateSemester = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange ?? [];
      if (!start || !end) {
        message.error('Please pick a start and end date.');
        return;
      }
      const payload = {
        semesterCode: values.semesterCode,
        name: values.name,
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: dayjs(end).format('YYYY-MM-DD'),
        weeklyReportDeadlineDay: values.weeklyDeadline ?? 'SUNDAY',
        weeklyReportDeadlineTime: '23:59',
        status: 'DRAFT',
      };
      const created = await SemesterService.createSemester(payload);
      message.success({ content: `Semester "${created.name}" created successfully.`, duration: 2.5 });
      setIsModalOpen(false);
      form.resetFields();
      void fetchSemesters();
    } catch (err) {
      console.error(err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to create semester';
      message.error(msg);
    }
  }, [form, fetchSemesters]);

  const formatDate = (dateStr: string) => dayjs(dateStr).format('MMM D, YYYY');

  const getWeeksText = (weeks: number) =>
    weeks === 1 ? '1 week' : `${weeks} weeks`;

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const cellBase: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    verticalAlign: 'middle',
  };

  const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  };

  const columns: ColumnsType<SemesterRecord> = [
    {
      title: <HeaderBadge>Semester</HeaderBadge>,
      dataIndex: 'name',
      key: 'name',
      fixed: isMobile ? undefined : 'left',
      align: 'left' as const,
      width: 190,
      render: (name: string, record: SemesterRecord) => {
        const getIconStyles = (status: SemesterStatus) => {
          if (status === 'Current') return { bg: cc.successMuted, color: cc.success };
          if (status === 'Upcoming') return { bg: cc.brandMuted, color: cc.brand };
          return { bg: cc.neutralMuted, color: cc.neutral };
        };
        const iconStyles = getIconStyles(record.status);

        return (
        <div style={row}>
          {/* Calendar icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: iconStyles.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarDays size={16} color={iconStyles.color} />
          </div>
          {/* Name + code */}
          <div style={{ minWidth: 0, marginLeft: 10 }}>
            <div style={{ ...cellBase, fontSize: 13, fontWeight: 600, color: cc.textPrimary, lineHeight: 1.3 }}>
              {name}
            </div>
            {/* unified pill: [code · MAJOR] */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 3, padding: '2px 7px 2px 6px',
              background: '#F3F4F6', border: '1px solid #E5E7EB',
              borderRadius: 4,
            }}>
              <span style={{
                fontFamily: "'Fira Code', 'Courier New', monospace",
                fontSize: 9.5, color: '#6B7280',
                letterSpacing: '-0.01em',
              }}>
                {record.semesterCode}
              </span>
            </div>
          </div>
        </div>
        );
      },
    },
    {
      title: <HeaderBadge>Start Date</HeaderBadge>,
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: true,
      align: 'left' as const,
      width: 140,
      render: (date: string) => (
        <div style={row}>
          <span
            style={{
              ...cellBase,
              fontSize: 12,
              color: cc.textSecondary,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.01em',
            }}
          >
            {formatDate(date)}
          </span>
        </div>
      ),
    },
    {
      title: <HeaderBadge>End Date</HeaderBadge>,
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: true,
      align: 'left' as const,
      width: 140,
      render: (date: string) => (
        <div style={row}>
          <span
            style={{
              ...cellBase,
              fontSize: 12,
              color: cc.textSecondary,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.01em',
            }}
          >
            {formatDate(date)}
          </span>
        </div>
      ),
    },
    {
      title: <HeaderBadge>Duration</HeaderBadge>,
      key: 'duration',
      align: 'left' as const,
      width: 110,
      render: (_: unknown, record: SemesterRecord) => (
        <div style={row}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 6,
              background: cc.neutralMuted,
              border: `1px solid ${cc.border}`,
            }}
          >
            <Clock size={11} color={cc.neutral} />
            <span style={{
              ...cellBase,
              fontSize: 11,
              fontWeight: 600,
              color: cc.textSecondary,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {getWeeksText(record.durationWeeks)}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: <HeaderBadge align="right">Status</HeaderBadge>,
      dataIndex: 'originalStatus',
      key: 'status',
      filters: [
        { text: 'DRAFT', value: 'DRAFT' },
        { text: 'OPEN', value: 'OPEN' },
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'CLOSED', value: 'CLOSED' },
        { text: 'LOCKED', value: 'LOCKED' },
      ],
      filterMultiple: false,
      align: 'right' as const,
      width: 115,
      render: (_: unknown, record: SemesterRecord) => (
        <div style={{ ...row, justifyContent: 'flex-end' }}>
          <StatusBadge status={record.status} />
        </div>
      ),
    },
    {
      title: <HeaderBadge align="right">Actions</HeaderBadge>,
      key: 'actions',
      fixed: isMobile ? undefined : 'right',
      align: 'right' as const,
      width: 210,
      render: (_: unknown, record: SemesterRecord) => (
        <div style={{ ...row, justifyContent: 'flex-end', gap: 8 }}>
          {/* Edit Timeline — always visible unless LOCKED */}
          <button
            onClick={() => {
              if (record.originalStatus !== 'LOCKED') handleEditTimeline(record);
            }}
            disabled={record.originalStatus === 'LOCKED'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: cc.radiusMd,
              border: `1.5px solid ${cc.border}`,
              background: record.originalStatus === 'LOCKED' ? cc.neutralMuted : 'transparent',
              color: record.originalStatus === 'LOCKED' ? cc.textMuted : cc.textSecondary,
              fontSize: 11.5,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: record.originalStatus === 'LOCKED' ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
              opacity: record.originalStatus === 'LOCKED' ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (record.originalStatus === 'LOCKED') return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = cc.brand;
              b.style.color = cc.brand;
              b.style.background = cc.brandMuted;
              b.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              if (record.originalStatus === 'LOCKED') return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = cc.border;
              b.style.color = cc.textSecondary;
              b.style.background = 'transparent';
              b.style.transform = 'translateY(0)';
            }}
          >
            <Pencil size={11} />
            Edit Timeline
          </button>

          {/* Set as Current — only for Upcoming (DRAFT/OPEN) */}
          {record.status === 'Upcoming' && (
            <Popconfirm
              title={`Set "${record.name}" as Current?`}
              description="The current active semester will be moved to Completed."
              onConfirm={() => handleSetCurrent(record)}
              okText="Set Current"
              cancelText="Cancel"
              okButtonProps={{ style: { borderRadius: cc.radiusMd, fontWeight: 600 } }}
              cancelButtonProps={{ style: { borderRadius: cc.radiusMd } }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  borderRadius: cc.radiusMd,
                  border: 'none',
                  background: 'transparent',
                  color: cc.textMuted,
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.color = cc.brand;
                  b.style.background = cc.brandMuted;
                  b.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.color = cc.textMuted;
                  b.style.background = 'transparent';
                  b.style.transform = 'translateY(0)';
                }}
              >
                <Star size={11} />
                Set as Current
              </button>
            </Popconfirm>
          )}

          {record.status === 'Current' && (
            <Popconfirm
              title={`Close "${record.name}"?`}
              description="This will close the semester and stop all active processes."
              onConfirm={() => handleCloseSemester(record)}
              okText="Close Semester"
              cancelText="Cancel"
              okButtonProps={{ danger: true, style: { borderRadius: cc.radiusMd, fontWeight: 600 } }}
              cancelButtonProps={{ style: { borderRadius: cc.radiusMd } }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  borderRadius: cc.radiusMd,
                  border: `1.5px solid ${cc.error}`,
                  background: 'transparent',
                  color: cc.error,
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.color = '#fff';
                  b.style.background = cc.error;
                  b.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.color = cc.error;
                  b.style.background = 'transparent';
                  b.style.transform = 'translateY(0)';
                }}
              >
                <Power size={11} />
                Close
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const handleTableChange: TableProps<SemesterRecord>['onChange'] = (pagination, filters, sorter) => {
    const newParams = { ...tableParams };

    if (filters.status && filters.status.length > 0) {
      newParams.status = filters.status[0] as string;
    } else {
      newParams.status = undefined;
    }

    if (!Array.isArray(sorter) && sorter.order) {
      newParams.sortBy = sorter.field as string;
      newParams.sortDir = sorter.order === 'ascend' ? 'asc' : 'desc';
    } else {
      newParams.sortBy = undefined;
      newParams.sortDir = undefined;
    }

    setTableParams(newParams);
    // Immediately fetch with the new params because setTableParams is async
    // and the stale tableParams value inside fetchSemesters would not reflect the change yet.
    void fetchSemesters(newParams);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className="semester-tab"
      style={{ background: 'transparent', padding: '0 0 24px' }}
    >
      {/* PAGE HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 22,
            fontWeight: 800,
            color: cc.textPrimary,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Semester Configuration
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13.5,
            color: cc.textMuted,
            margin: '5px 0 0',
            fontWeight: 400,
          }}
        >
          Manage academic terms and OJT timelines
        </p>
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderRadius: cc.radiusXl,
          boxShadow: cc.shadowSm,
          border: `1px solid ${cc.border}`,
          overflow: 'hidden',
        }}
      >
        {/* TABLE TOOLBAR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: `1px solid ${cc.border}`,
            background: cc.neutralBg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: cc.textMuted,
                fontWeight: 500,
              }}
            >
              {semesters.length} semester{semesters.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Create New Semester — Solid Brand Orange */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: cc.radiusMd,
              border: 'none',
              background: cc.brand,
              color: '#fff',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255,122,48,.25)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = cc.brandHover;
              b.style.transform = 'translateY(-1px)';
              b.style.boxShadow = '0 4px 14px rgba(255,122,48,.3)';
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = cc.brand;
              b.style.transform = 'translateY(0)';
              b.style.boxShadow = '0 2px 8px rgba(255,122,48,.25)';
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Create New Semester
          </button>
        </div>

        {/* ANT DESIGN TABLE */}
        <div style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
          <Table<SemesterRecord>
            columns={columns}
            dataSource={semesters}
            rowKey="id"
            pagination={false}
            onChange={handleTableChange}
            scroll={{ x: 860 }}
            className="semester-table"
          size="middle"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        </div>
      </div>

      {/* ============================================================ */}
      {/* CREATE SEMESTER MODAL */}
      {/* ============================================================ */}
      <Modal
        title={
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 17,
              color: cc.textPrimary,
            }}
          >
            Create New Semester
          </span>
        }
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        width={480}
        styles={{
          body: { paddingTop: 16 },
          content: { borderRadius: cc.radiusXl, overflow: 'hidden' },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="semesterCode"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Semester Code</span>}
            rules={[{ required: true, message: 'Please enter a semester code.' }]}
          >
            <Input
              placeholder="e.g. FA26"
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Semester Name</span>}
            rules={[{ required: true, message: 'Please enter a semester name.' }]}
          >
            <Input
              placeholder="e.g. Fall 2026"
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Academic Period</span>}
            rules={[{ required: true, message: 'Please select a date range.' }]}
          >
            <DatePicker.RangePicker
              size="large"
              style={{ width: '100%', borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="weeklyDeadline"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Weekly Report Deadline</span>}
            initialValue="SUNDAY"
          >
            <Select
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
              options={[
                { value: 'MONDAY', label: 'Monday' },
                { value: 'TUESDAY', label: 'Tuesday' },
                { value: 'WEDNESDAY', label: 'Wednesday' },
                { value: 'THURSDAY', label: 'Thursday' },
                { value: 'FRIDAY', label: 'Friday' },
                { value: 'SATURDAY', label: 'Saturday' },
                { value: 'SUNDAY', label: 'Sunday' },
              ]}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button
              onClick={() => { setIsModalOpen(false); form.resetFields(); }}
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleCreateSemester}
              style={{
                borderRadius: cc.radiusMd,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                background: cc.brand,
                borderColor: cc.brand,
              }}
            >
              Create Semester
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ============================================================ */}
      {/* EDIT TIMELINE MODAL */}
      {/* ============================================================ */}
      <Modal
        title={
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 17,
              color: cc.textPrimary,
            }}
          >
            Edit Timeline — {selectedSemester?.name}
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); editForm.resetFields(); }}
        footer={null}
        width={480}
        styles={{
          body: { paddingTop: 16 },
          content: { borderRadius: cc.radiusXl, overflow: 'hidden' },
        }}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="name"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Semester Name</span>}
            rules={[{ required: true, message: 'Please enter a semester name.' }]}
          >
            <Input
              placeholder="e.g. Fall 2026"
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="semesterCode"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Semester Code</span>}
            rules={[{ required: true, message: 'Please enter a semester code.' }]}
          >
            <Input
              placeholder="e.g. FA26"
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Academic Period</span>}
            rules={[{ required: true, message: 'Please select a date range.' }]}
          >
            <DatePicker.RangePicker
              size="large"
              style={{ width: '100%', borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button
              onClick={() => { setIsEditModalOpen(false); editForm.resetFields(); }}
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleEditSave}
              style={{
                borderRadius: cc.radiusMd,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                background: cc.brand,
                borderColor: cc.brand,
              }}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ============================================================ */}
      {/* INLINE STYLES (table customisation) */}
      {/* ============================================================ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .semester-tab .ant-table {
          background: transparent !important;
        }
        .semester-tab .ant-table-wrapper {
          border-radius: 0;
          overflow: hidden;
        }
        .semester-tab .ant-table-thead > tr > th {
          background: ${cc.neutralBg} !important;
          border-bottom: 1px solid ${cc.border} !important;
          padding: 0 14px !important;
          height: 40px !important;
          box-sizing: border-box !important;
          font-family: 'Inter, sans-serif';
          vertical-align: middle !important;
        }
        .semester-tab .ant-table-thead > tr > th:first-child {
          padding-left: 16px !important;
        }
        .semester-tab .ant-table-thead > tr > th:last-child {
          padding-right: 16px !important;
        }
        .semester-tab .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${cc.borderSubtle} !important;
          padding: 0 14px !important;
          height: 58px !important;
          box-sizing: border-box !important;
          background: ${cc.surface} !important;
          transition: background 0.15s ease !important;
          vertical-align: middle !important;
        }
        .semester-tab .ant-table-tbody > tr > td:first-child {
          padding-left: 16px !important;
        }
        .semester-tab .ant-table-tbody > tr > td:last-child {
          padding-right: 16px !important;
        }
        .semester-tab .ant-table-tbody > tr:hover > td {
          background: #FFF8F0 !important;
        }
        .semester-tab .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};
