import React, { useEffect, useState } from 'react';
import { Spin, message, Modal, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  ReloadOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ApplicationService } from '@/services/ApplicationService';
import { c } from '../constants';

// ============================================================
// DESIGN TOKENS
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// TYPES — match ApplicationResponse from backend
// ============================================================
type ApplicationStatus = 'PENDING' | 'SCREENING_PASSED' | 'SCREENING_REJECTED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

interface ApplicantCard {
  id: string;
  applicationId: string;
  studentName: string;
  studentCode: string;
  studentEmail: string;
  jobTitle: string;
  jobPostId: string;
  avatarColor: { bg: string; text: string };
  appliedAt: string;
  status: ApplicationStatus;
  cvFileUrl?: string;
  coverLetter?: string;
  rejectionReason?: string;
}

// ============================================================
// HELPERS
// ============================================================
const AVATAR_COLORS = [
  { bg: '#fff3e6', text: '#E67E22' },
  { bg: '#dcfce7', text: '#22c55e' },
  { bg: '#dbeafe', text: '#3b82f6' },
  { bg: '#fef3c7', text: '#f59e0b' },
  { bg: '#f3e5f5', text: '#8b5cf6' },
  { bg: '#fee2e2', text: '#ef4444' },
];

function getAvatarColor(name: string) {
  const idx = name.split('').reduce((a, ch) => a + (ch.codePointAt(0) ?? 0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ============================================================
// MAP API RESPONSE TO APPLICANT CARD (UC-39: from real backend)
// ============================================================
function mapToApplicantCard(item: any): ApplicantCard {
  const name: string = item.studentName || 'Student';
  const avatarColor = getAvatarColor(name);
  return {
    id: item.applicationId ?? item.id,
    applicationId: item.applicationId ?? item.id,
    studentName: name,
    studentCode: item.studentCode || '—',
    studentEmail: item.studentEmail || '',
    jobTitle: item.jobPostTitle ?? item.job?.title ?? 'Intern',
    jobPostId: item.jobPostId ?? '',
    avatarColor,
    appliedAt: item.createdAt ?? new Date().toISOString(),
    status: (item.status as ApplicationStatus) ?? 'PENDING',
    cvFileUrl: item.cvFileUrl,
    coverLetter: item.coverLetter,
    rejectionReason: item.rejectionReason,
  };
}

// ============================================================
// KANBAN COLUMN STATUSES — visible in kanban (others treated as PENDING bucket)
// ============================================================
type KanbanStatus = 'PENDING' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED';

const COLUMNS: { id: KanbanStatus; label: string; color: string; bg: string }[] = [
  { id: 'PENDING', label: 'Pending', color: c.warning, bg: hexToRgba(c.warning, 0.06) },
  { id: 'INTERVIEW_SCHEDULED', label: 'Interviewing', color: c.info, bg: hexToRgba(c.info, 0.06) },
  { id: 'ACCEPTED', label: 'Passed', color: c.success, bg: hexToRgba(c.success, 0.06) },
  { id: 'REJECTED', label: 'Rejected', color: c.error, bg: hexToRgba(c.error, 0.06) },
];

// Map any backend status to a kanban column (so SCREENING_*/WITHDRAWN are visible in PENDING bucket)
function toKanbanStatus(status: ApplicationStatus): KanbanStatus {
  switch (status) {
    case 'PENDING':
    case 'SCREENING_PASSED':
    case 'SCREENING_REJECTED':
      return 'PENDING';
    case 'INTERVIEW_SCHEDULED':
      return 'INTERVIEW_SCHEDULED';
    case 'ACCEPTED':
      return 'ACCEPTED';
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
}

// ============================================================
// STATUS BADGE
// ============================================================
const STATUS_PALETTE: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  PENDING: { color: c.warning, bg: hexToRgba(c.warning, 0.1), label: 'Pending', icon: <WarningOutlined style={{ fontSize: 10 }} /> },
  SCREENING_PASSED: { color: c.info, bg: hexToRgba(c.info, 0.1), label: 'CV Pass', icon: <CheckCircleOutlined style={{ fontSize: 10 }} /> },
  SCREENING_REJECTED: { color: c.error, bg: hexToRgba(c.error, 0.1), label: 'CV Reject', icon: <CloseCircleOutlined style={{ fontSize: 10 }} /> },
  INTERVIEW_SCHEDULED: { color: c.info, bg: hexToRgba(c.info, 0.1), label: 'Interviewing', icon: <ClockCircleOutlined style={{ fontSize: 10 }} /> },
  ACCEPTED: { color: c.success, bg: hexToRgba(c.success, 0.1), label: 'Passed', icon: <CheckCircleOutlined style={{ fontSize: 10 }} /> },
  REJECTED: { color: c.error, bg: hexToRgba(c.error, 0.1), label: 'Rejected', icon: <CloseCircleOutlined style={{ fontSize: 10 }} /> },
  WITHDRAWN: { color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1), label: 'Withdrawn', icon: <CloseCircleOutlined style={{ fontSize: 10 }} /> },
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const config = STATUS_PALETTE[status] || STATUS_PALETTE.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: c.radiusFull,
      background: config.bg, border: `1px solid ${hexToRgba(config.color, 0.25)}`,
      color: config.color, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ============================================================
// SORTABLE CARD
// ============================================================
const SortableCard: React.FC<{
  applicant: ApplicantCard;
  onViewDetails: (a: ApplicantCard) => void;
}> = ({ applicant, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: applicant.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  const avatarColor = applicant.avatarColor;
  const initials = (applicant.studentName || 'ST').substring(0, 2).toUpperCase();
  const daysSinceApply = Math.floor((Date.now() - new Date(applicant.appliedAt).getTime()) / 86400000);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        onClick={() => onViewDetails(applicant)}
        whileHover={{ y: -2 }}
        style={{
          background: c.surface, borderRadius: c.radiusLg,
          border: `1px solid ${c.border}`, boxShadow: c.shadowSm,
          padding: '14px 16px', cursor: 'grab', marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: c.radiusMd,
            background: avatarColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: avatarColor.text, fontSize: 14, fontWeight: 800, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 2, lineHeight: 1.2 }}>
              {applicant.studentName}
            </div>
            <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>{applicant.jobTitle}</div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: c.textMuted }}>
            <UserOutlined style={{ fontSize: 11, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{applicant.studentCode}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: c.textMuted }}>
            <MailOutlined style={{ fontSize: 11, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{applicant.studentEmail}</span>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: c.textMuted, textAlign: 'right' }}>
          {daysSinceApply === 0 ? 'Today' : `${daysSinceApply}d ago`}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// DRAG OVERLAY
// ============================================================
const DragCard: React.FC<{ applicant: ApplicantCard }> = ({ applicant }) => {
  const avatarColor = applicant.avatarColor;
  const initials = (applicant.studentName || 'ST').substring(0, 2).toUpperCase();
  return (
    <div style={{
      background: c.surface, borderRadius: c.radiusLg,
      border: `2px solid ${c.brand}`,
      boxShadow: '0 20px 50px rgba(230,126,34,0.2)',
      padding: '14px 16px', cursor: 'grabbing', width: 260,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: c.radiusMd, background: avatarColor.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: avatarColor.text, fontSize: 14, fontWeight: 800,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{applicant.studentName}</div>
          <div style={{ fontSize: 11, color: c.textMuted }}>{applicant.jobTitle}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DETAIL MODAL
// ============================================================
const DetailModal: React.FC<{ applicant: ApplicantCard | null; open: boolean; onClose: () => void }> = ({ applicant, open, onClose }) => {
  if (!applicant) return null;
  const avatarColor = applicant.avatarColor;
  const initials = (applicant.studentName || 'ST').substring(0, 2).toUpperCase();
  return (
    <Modal
      title={<div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>Applicant Details</div>}
      open={open} onCancel={onClose} footer={null} width={480}
      styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: c.radiusLg, background: avatarColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: avatarColor.text, fontSize: 22, fontWeight: 800 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>{applicant.studentName}</div>
            <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 8 }}>{applicant.jobTitle}</div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Student ID', value: applicant.studentCode },
            { label: 'Job Post', value: applicant.jobTitle },
            { label: 'Status', value: applicant.status },
            { label: 'Applied', value: dayjs(applicant.appliedAt).format('MMM D, YYYY') },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text, wordBreak: 'break-word' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Email</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{applicant.studentEmail}</div>
        </div>
        {applicant.coverLetter && (
          <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Cover Letter</div>
            <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{applicant.coverLetter}</div>
          </div>
        )}
        {applicant.cvFileUrl && (
          <a href={applicant.cvFileUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: c.radiusMd, background: c.brand, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: c.shadowBrand }}>
            <FilePdfOutlined /> View CV (PDF)
          </a>
        )}
        {applicant.rejectionReason && (
          <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.errorMuted, border: `1px solid ${hexToRgba(c.error, 0.3)}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: c.error, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Rejection Reason</div>
            <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5 }}>{applicant.rejectionReason}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ============================================================
// KANBAN COLUMN
// ============================================================
const KanbanColumn: React.FC<{
  column: typeof COLUMNS[number];
  applicants: ApplicantCard[];
  onViewDetails: (a: ApplicantCard) => void;
}> = ({ column, applicants, onViewDetails }) => (
  <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
    <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: column.bg, border: `1px solid ${hexToRgba(column.color, 0.2)}`, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: column.color, display: 'inline-block' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: column.color }}>{column.label}</span>
      </div>
      <span style={{ padding: '2px 8px', borderRadius: c.radiusFull, background: hexToRgba(column.color, 0.15), color: column.color, fontSize: 12, fontWeight: 700 }}>{applicants.length}</span>
    </div>
    <SortableContext items={applicants.map(a => a.id)} strategy={verticalListSortingStrategy}>
      <div style={{ flex: 1, padding: '6px 4px', minHeight: 200, borderRadius: c.radiusMd, background: c.surface, border: `1px dashed ${c.border}`, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
        {applicants.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: c.textMuted, fontSize: 12 }}>Drop here</div>
        ) : (
          <AnimatePresence>
            {applicants.map((applicant) => (
              <motion.div key={applicant.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <SortableCard applicant={applicant} onViewDetails={onViewDetails} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </SortableContext>
  </div>
);

// ============================================================
// MAIN KANBAN BOARD
// ============================================================
export const ApplicantKanbanTab: React.FC = () => {
  const [applicants, setApplicants] = useState<ApplicantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; applicant: ApplicantCard | null }>({ open: false, applicant: null });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApplicationService.getMyEnterprise();
      const data: any[] = res.data?.result ?? res.data ?? [];
      setApplicants(Array.isArray(data) ? data.map(mapToApplicantCard) : []);
    } catch (err: any) {
      // UC-39 Exception 39.0.E1: Application Data Loading Error
      const msg = err.response?.data?.message || 'Unable to load application details. Please try again.';
      setError(msg);
      message.error(msg);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const activeApplicant = applicants.find(a => a.id === activeId) ?? null;

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedApplicant = applicants.find(a => a.id === active.id);
    if (!draggedApplicant) return;

    const overId = over.id as string;
    const targetColumn = COLUMNS.find(col => col.id === overId);
    let targetStatus: KanbanStatus;
    if (targetColumn) {
      targetStatus = targetColumn.id;
    } else {
      const overApplicant = applicants.find(a => a.id === overId);
      if (!overApplicant) return;
      targetStatus = toKanbanStatus(overApplicant.status);
    }

    if (toKanbanStatus(draggedApplicant.status) === targetStatus) return;

    await updateStatus(draggedApplicant, targetStatus);
  };

  // UC-39 Step 5-6: Update status, refresh, show error if fails
  const updateStatus = async (applicant: ApplicantCard, newStatus: KanbanStatus) => {
    // Map kanban status back to actual backend status
    const backendStatus: ApplicationStatus =
      newStatus === 'PENDING' ? 'PENDING' :
      newStatus === 'INTERVIEW_SCHEDULED' ? 'INTERVIEW_SCHEDULED' :
      newStatus === 'ACCEPTED' ? 'ACCEPTED' :
      'REJECTED';

    // Optimistic update (UC-39: E2 handles revert on failure)
    setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: backendStatus } : a));
    try {
      await ApplicationService.updateStatus(applicant.applicationId, { status: backendStatus });
      message.success(`Moved ${applicant.studentName} to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (err: any) {
      // UC-39 Exception 39.0.E2: Status Update Failure
      // Revert to previous status
      setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: applicant.status } : a));
      message.error(err.response?.data?.message || 'Failed to save status change. Please check your connection.');
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
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Applicant Kanban</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Drag &amp; drop to update application status</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '6px 14px', borderRadius: c.radiusFull, background: c.bgLight, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 700, color: c.textMuted }}>{applicants.length} Total</span>
          <Button size="small" icon={<ReloadOutlined />} onClick={fetchApplicants}>Refresh</Button>
        </div>
      </div>

      {applicants.length === 0 && !error ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <FileTextOutlined style={{ fontSize: 48, color: c.textMuted, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No applications yet</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Students will appear here once they apply to your job posts</div>
        </div>
      ) : applicants.length === 0 && error ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.error, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <WarningOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Unable to load application details</div>
          <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 12 }}>{error}</div>
          <Button type="primary" onClick={fetchApplicants} style={{ background: c.brand, borderColor: c.brand }}>Try Again</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, padding: '0 24px', overflowX: 'auto', alignItems: 'flex-start' }}>
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {COLUMNS.map(column => (
              <KanbanColumn key={column.id} column={column} applicants={applicants.filter(a => toKanbanStatus(a.status) === column.id)} onViewDetails={(a) => setDetailModal({ open: true, applicant: a })} />
            ))}
            <DragOverlay>{activeApplicant ? <DragCard applicant={activeApplicant} /> : null}</DragOverlay>
          </DndContext>
        </div>
      )}

      <DetailModal
        applicant={detailModal.applicant}
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, applicant: null })}
      />
    </div>
  );
};
