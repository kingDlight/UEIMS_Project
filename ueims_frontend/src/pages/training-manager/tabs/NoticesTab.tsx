import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Table, Modal, Form, Input, Select, Button, Popconfirm, App, Tooltip, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Plus,
  Megaphone,
  Edit3,
  Eye,
  Globe,
  Send,
  XCircle,
  BellRing,
  Trash2,
} from 'lucide-react';
import dayjs from 'dayjs';
import { SystemAnnouncementService } from '@/services/SystemAnnouncementService';
import { SemesterService } from '@/services/SemesterService';
import type { SemesterResponse } from '@/services/SemesterService';


// ============================================================
// DESIGN TOKENS — matches SemesterTab / OJTTab Command Center
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
  errorText: '#991B1B',
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
type NoticeStatus = 'Draft' | 'Published';
type Audience = 'All' | 'Students' | 'Enterprise' | 'TrainingManager' | 'Admin' | 'Semester';

interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  audience: Audience;
  audienceLabel: string;
  semesterCode?: string;
  status: NoticeStatus;
  publishedDate?: string;
  createdDate: string;
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

interface AudienceBadgeProps {
  audience: Audience;
  label: string;
}

const AudienceBadge: React.FC<AudienceBadgeProps> = ({ audience, label }) => {
  const { message } = App.useApp();
  const config: Record<Audience, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
    All: {
      bg: cc.neutralMuted,
      border: cc.border,
      color: cc.neutral,
      icon: <Globe size={11} />,
    },
    Students: {
      bg: cc.infoMuted,
      border: '#BFDBFE',
      color: cc.infoText,
      icon: <Megaphone size={11} />,
    },
    Enterprise: {
      bg: cc.purpleMuted,
      border: '#DDD6FE',
      color: cc.purple,
      icon: <Megaphone size={11} />,
    },
    TrainingManager: {
      bg: cc.successMuted,
      border: '#A7F3D0',
      color: cc.successText,
      icon: <Megaphone size={11} />,
    },
    Admin: {
      bg: cc.errorMuted,
      border: '#FECACA',
      color: cc.errorText,
      icon: <Megaphone size={11} />,
    },
    Semester: {
      bg: cc.brandMuted,
      border: '#FED7AA',
      color: cc.warningText,
      icon: <Megaphone size={11} />,
    },
  };

  const cfg = config[audience];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.icon}
      {label}
    </span>
  );
};

interface StatusBadgeProps {
  status: NoticeStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { message } = App.useApp();
  const cfg = status === 'Published'
    ? { bg: cc.successMuted, border: '#A7F3D0', color: cc.successText, dot: cc.success, label: 'Published' }
    : { bg: cc.warningMuted, border: '#FDE68A', color: cc.warningText, dot: cc.warning, label: 'Draft' };

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
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const NoticesTab: React.FC = () => {
  const { message } = App.useApp();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all'); // 'all' | 'YYYY-MM'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeRecord | null>(null);
  const [form] = Form.useForm();
  const [publishing, setPublishing] = useState(false);
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  
  const fetchNotices = useCallback(async () => {
    try {
      const data: SystemAnnouncement[] = await SystemAnnouncementService.getAll();
      const semesterById = new Map(semesters.map((s) => [s.semesterId, s]));
      const mapped: NoticeRecord[] = data.map(n => {
        let audience: Audience = 'All';
        let audienceLabel = 'All Users';

        if (n.semesterId) {
          const sem = semesterById.get(n.semesterId);
          audience = 'Semester';
          audienceLabel = sem
            ? `${sem.name} (${sem.semesterCode})`
            : (n.semester ? `${n.semester.name ?? n.semester.semesterCode}` : 'Specific Semester');
        } else {
          switch (n.targetRole) {
            case 'STUDENT':
              audience = 'Students';
              audienceLabel = 'Students';
              break;
            case 'ENTERPRISE':
              audience = 'Enterprise';
              audienceLabel = 'Enterprises';
              break;
            case 'ADMIN':
              audience = 'Admin';
              audienceLabel = 'Admins';
              break;
            case 'TRAINING_MANAGER':
              audience = 'TrainingManager';
              audienceLabel = 'Training Managers';
              break;
            default:
              audience = 'All';
              audienceLabel = 'All Users';
          }
        }

        return {
          id: n.announcementId,
          title: n.title,
          content: n.content,
          audience,
          audienceLabel,
          semesterCode: n.semester?.semesterCode,
          status: n.status === 'PUBLISHED' ? 'Published' : 'Draft',
          publishedDate: n.publishedAt,
          createdDate: n.createdAt,
        };
      });
      setNotices(mapped);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch announcements');
    }
  }, [semesters]);

  const fetchSemesters = useCallback(async () => {
    setSemestersLoading(true);
    try {
      const data = await SemesterService.getAllSemesters();
      setSemesters(data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch semesters');
      setSemesters([]);
    } finally {
      setSemestersLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void fetchSemesters();
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const filteredNotices = useMemo(() => {
    return notices
      .filter((n) => {
        const matchAudience = audienceFilter === 'all' || n.audienceLabel === audienceFilter;
        const matchStatus = statusFilter === 'all' || n.status === statusFilter;
        let matchMonth = true;
        if (monthFilter !== 'all') {
          const d = dayjs(n.publishedDate ?? n.createdDate);
          matchMonth = d.isValid() && d.format('YYYY-MM') === monthFilter;
        }
        return matchAudience && matchStatus && matchMonth;
      })
      .sort((a, b) => {
        const ad = new Date(a.publishedDate ?? a.createdDate).getTime();
        const bd = new Date(b.publishedDate ?? b.createdDate).getTime();
        return bd - ad;
      });
  }, [notices, audienceFilter, statusFilter, monthFilter]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => {
      const d = dayjs(n.publishedDate ?? n.createdDate);
      if (d.isValid()) set.add(d.format('YYYY-MM'));
    });
    return [
      { value: 'all', label: 'All time' },
      ...Array.from(set)
        .sort((a, b) => b.localeCompare(a))
        .map((m) => ({ value: m, label: dayjs(m + '-01').format('MMMM YYYY') })),
    ];
  }, [notices]);

  const handlePublish = useCallback(async (record: NoticeRecord) => {
    try {
      await SystemAnnouncementService.publish(record.id);
      message.success({ content: `"${record.title}" published successfully.`, duration: 2.5 });
      void fetchNotices();
    } catch (err) {
      message.error('Failed to publish announcement');
    }
  }, [fetchNotices]);

  const handleUnpublish = useCallback(async (record: NoticeRecord) => {
    try {
      await SystemAnnouncementService.archive(record.id);
      message.success({ content: `"${record.title}" unpublished.`, duration: 2.5 });
      void fetchNotices();
    } catch (err) {
      message.error('Failed to unpublish announcement');
    }
  }, [fetchNotices]);

  const handleDelete = useCallback(async (record: NoticeRecord) => {
    try {
      await SystemAnnouncementService.delete(record.id);
      message.success({ content: `"${record.title}" deleted.`, duration: 2.5 });
      void fetchNotices();
    } catch (err) {
      console.error(err);
      message.error('Failed to delete announcement');
    }
  }, [fetchNotices]);

  const handleView = useCallback((record: NoticeRecord) => {
    setSelectedNotice(record);
    setIsViewModalOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setPublishing(true);

      const audienceToRole: Record<string, string | undefined> = {
        All: undefined,
        Students: 'STUDENT',
        Enterprise: 'ENTERPRISE',
        TrainingManager: 'TRAINING_MANAGER',
        Admin: 'ADMIN',
        Semester: undefined,
      };
      const targetRole = audienceToRole[values.audience];

      // 1. Persist (status=DRAFT on server). Backend will use these fields
      //    later when publish() fans out the live bell.
      const created = await SystemAnnouncementService.create({
        title: values.title,
        content: values.content,
        semesterId: values.audience === 'Semester' ? values.semesterId : undefined,
        type: values.type ?? 'GENERAL',
        audience: values.audience,
        targetRole,
      } as unknown as Parameters<typeof SystemAnnouncementService.create>[0]);

      // 2. Publish immediately — backend fans out the live bell automatically
      //    (one source of truth: announcement = notification).
      await SystemAnnouncementService.publish(created.announcementId);

      const audienceLabel =
        values.audience === 'Semester'
          ? '(semester-scoped, bell pending per-semester route)'
          : `(live bell -> ${values.audience === 'All' ? 'all users' : values.audience.toLowerCase()})`;
      message.success({
        content: `Announcement "${values.title}" published ${audienceLabel}.`,
        duration: 3,
      });
      setIsModalOpen(false);
      form.resetFields();
      setSelectedNotice(null);
      void fetchNotices();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }, [form, fetchNotices]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return dayjs(dateStr).format('MMM D, YYYY');
  };

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

  const columns: ColumnsType<NoticeRecord> = [
    {
      title: <HeaderBadge>Title</HeaderBadge>,
      dataIndex: 'title',
      key: 'title',
      align: 'left' as const,
      width: 300,
      render: (title: string, record: NoticeRecord) => (
        <div style={row}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: record.status === 'Published' ? cc.brandMuted : cc.neutralMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Megaphone size={15} color={record.status === 'Published' ? cc.brand : cc.neutral} />
          </div>
          <div style={{ minWidth: 0, marginLeft: 10 }}>
            <div
              style={{
                ...cellBase,
                fontSize: 13,
                fontWeight: 600,
                color: cc.textPrimary,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 240,
              }}
            >
              {title}
            </div>
            <div
              style={{
                ...cellBase,
                fontSize: 10.5,
                color: cc.textMuted,
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 240,
              }}
            >
              {record.content.slice(0, 55)}
              {record.content.length > 55 ? 'Ã¢â¬Â¦' : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <HeaderBadge>Audience</HeaderBadge>,
      dataIndex: 'audience',
      key: 'audience',
      align: 'left' as const,
      width: 140,
      render: (_: unknown, record: NoticeRecord) => (
        <div style={row}>
          <AudienceBadge audience={record.audience} label={record.audienceLabel} />
        </div>
      ),
    },
    {
      title: <HeaderBadge>Status</HeaderBadge>,
      dataIndex: 'status',
      key: 'status',
      align: 'left' as const,
      width: 120,
      render: (status: NoticeStatus) => (
        <div style={row}>
          <StatusBadge status={status} />
        </div>
      ),
    },
    {
      title: <HeaderBadge>Published Date</HeaderBadge>,
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      align: 'left' as const,
      width: 140,
      render: (date: string | undefined, record: NoticeRecord) => (
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
            {formatDate(date ?? record.createdDate)}
          </span>
        </div>
      ),
    },
    {
      title: <HeaderBadge align="right">Actions</HeaderBadge>,
      key: 'actions',
      fixed: isMobile ? undefined : 'right',
      align: 'right' as const,
      width: 280,
      render: (_: unknown, record: NoticeRecord) => (
        <div style={{ ...row, justifyContent: 'flex-end', gap: 8 }}>
          {record.status === 'Draft' ? (
            <>
              {/* Publish Now — Solid Green */}
              <Popconfirm
                title={`Publish "${record.title}"?`}
                description="This announcement will be visible to the selected audience."
                onConfirm={() => handlePublish(record)}
                okText="Publish"
                cancelText="Cancel"
                okButtonProps={{ style: { borderRadius: cc.radiusMd, fontWeight: 600, background: cc.success, borderColor: cc.success } }}
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
                    background: cc.success,
                    color: '#fff',
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(16,185,129,.2)',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.transform = 'translateY(-1px)';
                    b.style.boxShadow = '0 4px 12px rgba(16,185,129,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.transform = 'translateY(0)';
                    b.style.boxShadow = '0 2px 8px rgba(16,185,129,0.25)';
                  }}
                >
                  <Send size={11} strokeWidth={2} />
                  Publish Now
                </button>
              </Popconfirm>

              {/* Edit — Ghost Icon */}
              <button
                onClick={() => { setSelectedNotice(record); setIsModalOpen(true); }}
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
                <Edit3 size={11} />
                Edit
              </button>

              {/* Delete (Draft) — Danger Solid */}
              <Popconfirm
                title={`Delete "${record.title}"?`}
                description="This draft will be permanently removed."
                onConfirm={() => handleDelete(record)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ style: { borderRadius: cc.radiusMd, fontWeight: 700, background: cc.error, borderColor: cc.error } }}
                cancelButtonProps={{ style: { borderRadius: cc.radiusMd } }}
              >
                <button
                  aria-label="Delete"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: cc.radiusMd,
                    border: `1.5px solid ${cc.error}40`,
                    background: 'transparent',
                    color: cc.error,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = cc.error;
                    b.style.color = '#fff';
                    b.style.borderColor = cc.error;
                    b.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = 'transparent';
                    b.style.color = cc.error;
                    b.style.borderColor = `${cc.error}40`;
                    b.style.transform = 'translateY(0)';
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </Popconfirm>
            </>
          ) : (
            <>
              {/* Unpublish — Danger Outline */}
              <Popconfirm
                title={`Unpublish "${record.title}"?`}
                description="This announcement will be hidden from the audience."
                onConfirm={() => handleUnpublish(record)}
                okText="Unpublish"
                cancelText="Cancel"
                okButtonProps={{ style: { borderRadius: cc.radiusMd, fontWeight: 600, background: cc.error, borderColor: cc.error } }}
                cancelButtonProps={{ style: { borderRadius: cc.radiusMd } }}
              >
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 11px',
                    borderRadius: cc.radiusMd,
                    border: `1.5px solid ${cc.error}40`,
                    background: 'transparent',
                    color: cc.error,
                    fontSize: 11.5,
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.borderColor = cc.error;
                    b.style.background = cc.errorMuted;
                    b.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.borderColor = `${cc.error}40`;
                    b.style.background = 'transparent';
                    b.style.transform = 'translateY(0)';
                  }}
                >
                  <XCircle size={11} />
                  Unpublish
                </button>
              </Popconfirm>

              {/* View — Ghost Icon */}
              <button
                onClick={() => handleView(record)}
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
                  b.style.borderColor = cc.info;
                  b.style.color = cc.info;
                  b.style.background = cc.infoMuted;
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
                <Eye size={11} />
                View
              </button>

              {/* Delete (Published) — Danger Solid Icon */}
              <Popconfirm
                title={`Delete "${record.title}"?`}
                description="Already-published — recipients will no longer be able to view it in the announcement list."
                onConfirm={() => handleDelete(record)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ style: { borderRadius: cc.radiusMd, fontWeight: 700, background: cc.error, borderColor: cc.error } }}
                cancelButtonProps={{ style: { borderRadius: cc.radiusMd } }}
              >
                <button
                  aria-label="Delete"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: cc.radiusMd,
                    border: `1.5px solid ${cc.error}40`,
                    background: 'transparent',
                    color: cc.error,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = cc.error;
                    b.style.color = '#fff';
                    b.style.borderColor = cc.error;
                    b.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = 'transparent';
                    b.style.color = cc.error;
                    b.style.borderColor = `${cc.error}40`;
                    b.style.transform = 'translateY(0)';
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  // ============================================================
  // AUDIENCE OPTIONS
  // ============================================================
  const audienceOptions = [
    { value: 'all', label: 'All Audiences' },
    { value: 'All Users', label: 'All Users' },
    { value: 'Students', label: 'Students' },
    { value: 'Enterprises', label: 'Enterprises' },
    { value: 'Training Managers', label: 'Training Managers' },
    { value: 'Admins', label: 'Admins' },
    { value: 'Specific Semester', label: 'Specific Semester' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Published', label: 'Published' },
    { value: 'Draft', label: 'Draft' },
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className="notices-tab"
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
          Announcements
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
          Broadcast official school-wide notices to enterprises and students
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
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Target Audience Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: cc.textMuted,
                  whiteSpace: 'nowrap',
                }}
              >
                Target Audience:
              </span>
              <Select
                value={audienceFilter}
                onChange={setAudienceFilter}
                options={audienceOptions}
                style={{ width: 150, fontFamily: 'Inter, sans-serif' }}
                size="small"
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: cc.textMuted,
                  whiteSpace: 'nowrap',
                }}
              >
                Status:
              </span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                style={{ width: 130, fontFamily: 'Inter, sans-serif' }}
                size="small"
              />
            </div>

            {/* Month Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: cc.textMuted,
                  whiteSpace: 'nowrap',
                }}
              >
                Month:
              </span>
              <Select
                value={monthFilter}
                onChange={setMonthFilter}
                options={monthOptions}
                style={{ width: 160, fontFamily: 'Inter, sans-serif' }}
                size="small"
              />
            </div>

            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: cc.textMuted,
                fontWeight: 500,
                marginLeft: 4,
              }}
            >
              {`${filteredNotices.length} notice${filteredNotices.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Right-side actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Create Announcement — also pushes live bell automatically */}
            <button
              onClick={() => { setSelectedNotice(null); setIsModalOpen(true); }}
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
              Create Announcement
            </button>
          </div>
        </div>

        {/* ANT DESIGN TABLE */}
        <div style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
          <Table<NoticeRecord>
            columns={columns}
            dataSource={filteredNotices}
            rowKey="id"
            pagination={false}
            scroll={{ x: 860 }}
            className="notices-table"
            size="middle"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* CREATE / EDIT MODAL */}
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
            {selectedNotice ? 'Edit Announcement' : 'Create New Announcement'}
          </span>
        }
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); setSelectedNotice(null); }}
        footer={null}
        centered
        width={520}
        styles={{
          body: { paddingTop: 16 },
          content: { borderRadius: cc.radiusXl, overflow: 'hidden' },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="title"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Announcement Title</span>}
            rules={[{ required: true, message: 'Please enter a title.' }]}
          >
            <Input
              placeholder="e.g. OJT Registration Deadline Extended"
              size="large"
              maxLength={200}
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Message</span>}
            rules={[{ required: true, message: 'Please enter the announcement message.' }]}
          >
            <Input.TextArea
              rows={4}
              maxLength={1000}
              placeholder="Enter the full message that recipients will see in their bell..."
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Type</span>}
            initialValue="GENERAL"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
              options={[
                { value: 'GENERAL', label: 'General' },
                { value: 'WARNING', label: 'Warning' },
                { value: 'INCIDENT', label: 'Incident' },
                { value: 'SYSTEM_ANNOUNCEMENT', label: 'System Announcement' },
                { value: 'APPROVAL', label: 'Approval' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="audience"
            label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Target Audience</span>}
            rules={[{ required: true, message: 'Please select an audience.' }]}
          >
            <Select
              placeholder="Select target audience"
              size="large"
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
              options={[
                { value: 'All', label: 'All Users' },
                { value: 'Students', label: 'Students' },
                { value: 'Enterprise', label: 'Enterprises' },
                { value: 'TrainingManager', label: 'Training Managers' },
                { value: 'Admin', label: 'Admins' },
                { value: 'Semester', label: 'Specific Semester' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.audience !== curr.audience}
          >
            {({ getFieldValue }) =>
              getFieldValue('audience') === 'Semester' ? (
                <Form.Item
                  name="semesterId"
                  label={<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: cc.textSecondary }}>Semester</span>}
                  rules={[{ required: true, message: 'Please pick a semester.' }]}
                >
                  <Select
                    placeholder="Pick a semester"
                    size="large"
                    allowClear
                    loading={semestersLoading}
                    notFoundContent={semestersLoading ? 'Loading semesters…' : 'No semesters available'}
                    style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif' }}
                    options={semesters.map((s) => ({
                      value: s.semesterId,
                      label: `${s.name} (${s.semesterCode})`,
                    }))}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {/* Realtime delivery — always on (one source of truth: announcement = notification) */}
          <div
            style={{
              marginTop: 4,
              padding: '12px 14px',
              background: '#FFF8F0',
              border: `1px solid ${cc.brandMuted}`,
              borderRadius: cc.radiusMd,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <BellRing size={16} color={cc.brand} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 12.5, color: cc.textPrimary }}>
                Live bell push
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: cc.textSecondary, marginTop: 1, lineHeight: 1.4 }}>
                On publish, every matching recipient gets a WebSocket bell-frame — no refresh needed.
              </div>
            </div>
            <Switch checked disabled style={{ backgroundColor: cc.brand }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button
              onClick={() => { setIsModalOpen(false); form.resetFields(); setSelectedNotice(null); }}
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={publishing}
              onClick={handleCreate}
              icon={<Send size={14} />}
              style={{
                borderRadius: cc.radiusMd,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                background: cc.brand,
                borderColor: cc.brand,
              }}
            >
              {selectedNotice ? 'Save Changes' : 'Publish Now'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ============================================================ */}
      {/* VIEW MODAL */}
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
            Announcement Preview
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => { setIsViewModalOpen(false); setSelectedNotice(null); }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              onClick={() => { setIsViewModalOpen(false); setSelectedNotice(null); }}
              style={{ borderRadius: cc.radiusMd, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              Close
            </Button>
          </div>
        }
        width={560}
        styles={{
          body: { paddingTop: 12 },
          content: { borderRadius: cc.radiusXl, overflow: 'hidden' },
        }}
      >
        {selectedNotice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: selectedNotice.status === 'Published' ? cc.brandMuted : cc.neutralMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Megaphone size={18} color={selectedNotice.status === 'Published' ? cc.brand : cc.neutral} />
              </div>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: cc.textPrimary }}>
                  {selectedNotice.title}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: cc.textMuted, marginTop: 2 }}>
                  {formatDate(selectedNotice.publishedDate ?? selectedNotice.createdDate)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <AudienceBadge audience={selectedNotice.audience} label={selectedNotice.audienceLabel} />
              <StatusBadge status={selectedNotice.status} />
            </div>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13.5,
                color: cc.textSecondary,
                lineHeight: 1.7,
                padding: '12px 14px',
                background: cc.neutralBg,
                borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`,
              }}
            >
              {selectedNotice.content}
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .notices-tab .ant-table {
          background: transparent !important;
        }
        .notices-tab .ant-table-wrapper {
          border-radius: 0;
          overflow: hidden;
        }
        .notices-tab .ant-table-thead > tr > th {
          background: ${cc.neutralBg} !important;
          border-bottom: 1px solid ${cc.border} !important;
          padding: 0 14px !important;
          height: 40px !important;
          box-sizing: border-box !important;
          font-family: 'Inter, sans-serif';
          vertical-align: middle !important;
        }
        .notices-tab .ant-table-thead > tr > th:first-child {
          padding-left: 16px !important;
        }
        .notices-tab .ant-table-thead > tr > th:last-child {
          padding-right: 16px !important;
        }
        .notices-tab .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${cc.borderSubtle} !important;
          padding: 0 14px !important;
          height: 62px !important;
          box-sizing: border-box !important;
          background: ${cc.surface} !important;
          transition: background 0.15s ease !important;
          vertical-align: middle !important;
        }
        .notices-tab .ant-table-tbody > tr > td:first-child {
          padding-left: 16px !important;
        }
        .notices-tab .ant-table-tbody > tr > td:last-child {
          padding-right: 16px !important;
        }
        .notices-tab .ant-table-tbody > tr:hover > td {
          background: #FFF8F0 !important;
        }
        .notices-tab .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }

        .notices-tab .ant-select-selector {
          font-family: 'Inter, sans-serif' !important;
          font-size: 12px !important;
          border-radius: ${cc.radiusMd}px !important;
        }
      `}</style>
    </div>
  );
};
