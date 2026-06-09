import React, { useState, useCallback, useEffect } from 'react';
import { Table, Modal, Form, DatePicker, Input, Button, Popconfirm, message, Spin, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Plus,
  CalendarDays,
  Clock,
  Pencil,
  Star,
} from 'lucide-react';
import dayjs from 'dayjs';
import { c } from '../constants';

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
  surface: '#FFFFFF',
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
}

// ============================================================
// MOCK DATA — realistic academic timeline
// ============================================================
const MOCK_SEMESTERS: SemesterRecord[] = [
  {
    id: 'sm-001',
    name: 'Fall 2025',
    semesterCode: 'FA25',
    startDate: '2025-09-01',
    endDate: '2025-12-15',
    durationWeeks: 15,
    status: 'Completed',
  },
  {
    id: 'sm-002',
    name: 'Spring 2026',
    semesterCode: 'SP26',
    startDate: '2026-01-12',
    endDate: '2026-05-10',
    durationWeeks: 16,
    status: 'Completed',
  },
  {
    id: 'sm-003',
    name: 'Summer 2026',
    semesterCode: 'SU26',
    startDate: '2026-05-25',
    endDate: '2026-08-30',
    durationWeeks: 14,
    status: 'Current',
  },
  {
    id: 'sm-004',
    name: 'Fall 2026',
    semesterCode: 'FA26',
    startDate: '2026-09-07',
    endDate: '2026-12-20',
    durationWeeks: 15,
    status: 'Upcoming',
  },
];

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
  const [semesters] = useState<SemesterRecord[]>(MOCK_SEMESTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<SemesterRecord | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSetCurrent = useCallback((record: SemesterRecord) => {
    message.success({ content: `"${record.name}" is now set as Current semester.`, duration: 2.5 });
  }, []);

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
      message.success({ content: `Timeline for "${values.name}" updated successfully.`, duration: 2.5 });
      setIsEditModalOpen(false);
      editForm.resetFields();
    } catch {
      // validation failed
    }
  }, [editForm]);

  const handleCreateSemester = useCallback(async () => {
    try {
      const values = await form.validateFields();
      message.success({ content: `Semester "${values.name}" created successfully.`, duration: 2.5 });
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      // validation failed
    }
  }, [form]);

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
      dataIndex: 'status',
      key: 'status',
      align: 'right' as const,
      width: 115,
      render: (status: SemesterStatus) => (
        <div style={{ ...row, justifyContent: 'flex-end' }}>
          <StatusBadge status={status} />
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
          {/* Edit Timeline — always visible */}
          <button
            onClick={() => handleEditTimeline(record)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: cc.radiusMd,
              border: `1.5px solid ${cc.border}`,
              background: 'transparent',
              color: cc.textSecondary,
              fontSize: 11.5,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = cc.brand;
              b.style.color = cc.brand;
              b.style.background = cc.brandMuted;
              b.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
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

          {/* Set as Current — only if not Current */}
          {record.status !== 'Current' && (
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
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 11px',
                color: cc.textMuted,
                fontSize: 11.5,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                cursor: 'not-allowed',
                opacity: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              <Star size={11} />
              Active
            </span>
          )}
        </div>
      ),
    },
  ];

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
          background: cc.surface,
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
              {semesters.length} semester{semesters.length !== 1 ? 's' : ''}
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
