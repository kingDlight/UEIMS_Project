import React, { useEffect, useState } from 'react';
import { Spin, message, Modal, DatePicker, Input } from 'antd';
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
  CalendarOutlined,
  LinkOutlined,
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
// TYPES
// ============================================================
type ApplicationStatus = 'PENDING' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED';

interface ApplicantCard {
  id: string;
  applicationId: string;
  studentName: string;
  studentCode: string;
  studentEmail: string;
  major: string;
  gpa: number;
  jobTitle: string;
  avatarInitials: string;
  avatarColor: string;
  appliedAt: string;
  status: ApplicationStatus;
  interviewDate?: string;
  interviewLink?: string;
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

const MOCK_APPLICANTS: ApplicantCard[] = [
  { id: 'a-001', applicationId: 'app-001', studentName: 'Nguyen Van A', studentCode: 'SE161234', studentEmail: 'nguyenvana@student.fpt.edu.vn', major: 'Software Engineering', gpa: 3.8, jobTitle: 'Frontend Developer', avatarInitials: 'NVA', avatarColor: '#E67E22', appliedAt: '2026-06-01T10:00:00Z', status: 'PENDING' },
  { id: 'a-002', applicationId: 'app-002', studentName: 'Tran Thi B', studentCode: 'IA162345', studentEmail: 'tranthib@student.fpt.edu.vn', major: 'Info Assurance', gpa: 3.4, jobTitle: 'Security Analyst', avatarInitials: 'TTB', avatarColor: '#3B82F6', appliedAt: '2026-06-02T14:30:00Z', status: 'PENDING' },
  { id: 'a-003', applicationId: 'app-003', studentName: 'Le Van C', studentCode: 'SE163456', studentEmail: 'levanc@student.fpt.edu.vn', major: 'Software Engineering', gpa: 3.1, jobTitle: 'Backend Developer', avatarInitials: 'LVC', avatarColor: '#22c55e', appliedAt: '2026-06-03T09:15:00Z', status: 'INTERVIEW_SCHEDULED', interviewDate: '2026-06-20T10:00:00Z', interviewLink: 'https://meet.example.com/abc123' },
  { id: 'a-004', applicationId: 'app-004', studentName: 'Bui Van G', studentCode: 'GD162111', studentEmail: 'buivang@student.fpt.edu.vn', major: 'Graphic Design', gpa: 3.6, jobTitle: 'UI/UX Designer', avatarInitials: 'BVG', avatarColor: '#8b5cf6', appliedAt: '2026-06-03T16:00:00Z', status: 'INTERVIEW_SCHEDULED', interviewDate: '2026-06-22T14:00:00Z' },
  { id: 'a-005', applicationId: 'app-005', studentName: 'Pham Thi D', studentCode: 'AI162789', studentEmail: 'phamthid@student.fpt.edu.vn', major: 'Artificial Intelligence', gpa: 3.9, jobTitle: 'ML Engineer', avatarInitials: 'PTD', avatarColor: '#f59e0b', appliedAt: '2026-05-28T11:00:00Z', status: 'ACCEPTED' },
  { id: 'a-006', applicationId: 'app-006', studentName: 'Hoang Van E', studentCode: 'SE164001', studentEmail: 'hoangvane@student.fpt.edu.vn', major: 'Software Engineering', gpa: 2.9, jobTitle: 'QA Engineer', avatarInitials: 'HVE', avatarColor: '#ef4444', appliedAt: '2026-05-25T08:00:00Z', status: 'REJECTED' },
  { id: 'a-007', applicationId: 'app-007', studentName: 'Dao Thi F', studentCode: 'IA163222', studentEmail: 'daothif@student.fpt.edu.vn', major: 'Info Assurance', gpa: 3.2, jobTitle: 'DevSecOps Engineer', avatarInitials: 'DTF', avatarColor: '#3B82F6', appliedAt: '2026-06-05T13:00:00Z', status: 'PENDING' },
  { id: 'a-008', applicationId: 'app-008', studentName: 'Vo Thi H', studentCode: 'GD163333', studentEmail: 'vothih@student.fpt.edu.vn', major: 'Graphic Design', gpa: 3.5, jobTitle: 'Motion Designer', avatarInitials: 'VTH', avatarColor: '#22c55e', appliedAt: '2026-06-04T10:30:00Z', status: 'ACCEPTED' },
];

// ============================================================
// COLUMN CONFIG
// ============================================================
const COLUMNS: { id: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { id: 'PENDING', label: 'Pending', color: c.warning, bg: hexToRgba(c.warning, 0.06) },
  { id: 'INTERVIEW_SCHEDULED', label: 'Interviewing', color: c.info, bg: hexToRgba(c.info, 0.06) },
  { id: 'ACCEPTED', label: 'Passed', color: c.success, bg: hexToRgba(c.success, 0.06) },
  { id: 'REJECTED', label: 'Rejected', color: c.error, bg: hexToRgba(c.error, 0.06) },
];

// ============================================================
// STATUS BADGE
// ============================================================
const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const config = COLUMNS.find(col => col.id === status);
  if (!config) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: c.radiusFull,
      background: config.bg, border: `1px solid ${hexToRgba(config.color, 0.25)}`,
      color: config.color, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status === 'ACCEPTED' && <CheckCircleOutlined style={{ fontSize: 10 }} />}
      {status === 'REJECTED' && <CloseCircleOutlined style={{ fontSize: 10 }} />}
      {status === 'INTERVIEW_SCHEDULED' && <ClockCircleOutlined style={{ fontSize: 10 }} />}
      {status === 'PENDING' && <WarningOutlined style={{ fontSize: 10 }} />}
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
  const avatarColor = getAvatarColor(applicant.studentName);
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
            {applicant.avatarInitials}
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
            <span style={{ color: c.border }}>·</span>
            <span>GPA {applicant.gpa}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: c.textMuted }}>
            <MailOutlined style={{ fontSize: 11, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{applicant.studentEmail}</span>
          </div>
          {applicant.interviewDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: c.info }}>
              <ClockCircleOutlined style={{ fontSize: 11, flexShrink: 0 }} />
              <span>{dayjs(applicant.interviewDate).format('MMM D, HH:mm')}</span>
            </div>
          )}
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
  const avatarColor = getAvatarColor(applicant.studentName);
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
          {applicant.avatarInitials}
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
// INTERVIEW MODAL
// ============================================================
const InterviewModal: React.FC<{
  applicant: ApplicantCard | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string, link: string) => Promise<void>;
}> = ({ applicant, open, onClose, onConfirm }) => {
  const [scheduledDate, setScheduledDate] = useState<dayjs.Dayjs | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) { setScheduledDate(null); setMeetingLink(''); setError(''); }
  }, [open]);

  const handleConfirm = async () => {
    if (!scheduledDate) { setError('Please select an interview date and time.'); return; }
    if (scheduledDate.isBefore(dayjs())) { setError('Interview date cannot be in the past.'); return; }
    try {
      setSubmitting(true);
      setError('');
      await onConfirm(scheduledDate.toISOString(), meetingLink);
      onClose();
    } catch { setError('Failed to schedule interview. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal
      title={<div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>
        Schedule Interview — {applicant?.studentName}
      </div>}
      open={open} onCancel={onClose} footer={null} width={440}
      styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: c.radiusMd, background: c.errorMuted, border: `1px solid ${hexToRgba(c.error, 0.3)}`, color: c.error, fontSize: 13, fontWeight: 600 }}>{error}</div>
        )}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interview Date & Time <span style={{ color: c.error }}>*</span>
          </label>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" value={scheduledDate}
            onChange={(val) => { setScheduledDate(val); setError(''); }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            style={{ width: '100%', borderRadius: c.radiusMd, borderColor: c.border }} placeholder="Select date and time" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meeting Link</label>
          <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." style={{ borderRadius: c.radiusMd }} prefix={<LinkOutlined />} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: c.radiusMd, border: `1px solid ${c.border}`, background: c.surface, color: c.text, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleConfirm} disabled={submitting}
            style={{ padding: '10px 20px', borderRadius: c.radiusMd, border: 'none', background: c.brand, color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 13, opacity: submitting ? 0.7 : 1, boxShadow: c.shadowBrand }}>
            {submitting ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================
// DETAIL MODAL
// ============================================================
const DetailModal: React.FC<{ applicant: ApplicantCard | null; open: boolean; onClose: () => void }> = ({ applicant, open, onClose }) => {
  if (!applicant) return null;
  const avatarColor = getAvatarColor(applicant.studentName);
  return (
    <Modal
      title={<div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: c.text, fontSize: 16 }}>Applicant Details</div>}
      open={open} onCancel={onClose} footer={null} width={480}
      styles={{ content: { borderRadius: c.radiusLg, padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: c.radiusLg, background: avatarColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: avatarColor.text, fontSize: 22, fontWeight: 800 }}>
            {applicant.avatarInitials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>{applicant.studentName}</div>
            <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 8 }}>{applicant.jobTitle}</div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[{ label: 'Student ID', value: applicant.studentCode }, { label: 'Major', value: applicant.major }, { label: 'GPA', value: applicant.gpa.toString() }, { label: 'Applied', value: dayjs(applicant.appliedAt).format('MMM D, YYYY') }].map(item => (
            <div key={item.label} style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: c.bgLight, border: `1px solid ${c.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Email</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{applicant.studentEmail}</div>
        </div>
        {applicant.interviewDate && (
          <div style={{ padding: '12px 14px', borderRadius: c.radiusMd, background: hexToRgba(c.info, 0.06), border: `1px solid ${hexToRgba(c.info, 0.2)}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: c.info, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Interview Scheduled</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{dayjs(applicant.interviewDate).format('dddd, MMMM D, YYYY [at] HH:mm')}</div>
            {applicant.interviewLink && <a href={applicant.interviewLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: c.info, marginTop: 4, display: 'block' }}>Join Meeting →</a>}
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
// MAP API RESPONSE TO APPLICANT CARD
// ============================================================
function mapToApplicantCard(item: any): ApplicantCard {
  const name = item.studentName ?? 'Student';
  const avatarColor = getAvatarColor(name);
  return {
    id: item.applicationId ?? item.id,
    applicationId: item.applicationId ?? item.id,
    studentName: name,
    studentCode: item.studentCode ?? '—',
    studentEmail: item.studentEmail ?? '',
    major: item.major ?? '—',
    gpa: item.gpa ?? 0,
    jobTitle: item.jobPostTitle ?? 'Intern',
    avatarInitials: name.substring(0, 2).toUpperCase(),
    avatarColor: avatarColor.text,
    appliedAt: item.createdAt ?? new Date().toISOString(),
    status: (item.status as ApplicationStatus) ?? 'PENDING',
    interviewDate: item.interviewDate,
    interviewLink: item.interviewLink,
  };
}

// ============================================================
// MAIN KANBAN BOARD
// ============================================================
export const ApplicantKanbanTab: React.FC = () => {
  const [applicants, setApplicants] = useState<ApplicantCard[]>(MOCK_APPLICANTS);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [interviewModal, setInterviewModal] = useState<{ open: boolean; applicant: ApplicantCard | null }>({ open: false, applicant: null });
  const [detailModal, setDetailModal] = useState<{ open: boolean; applicant: ApplicantCard | null }>({ open: false, applicant: null });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const res = await ApplicationService.getMyEnterprise();
        const data = res.data?.result ?? res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setApplicants(data.map(mapToApplicantCard));
        }
      } catch { /* fallback to mock */ }
      finally { setLoading(false); }
    };
    fetchApplicants();
  }, []);

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
    let targetStatus: ApplicationStatus;
    if (targetColumn) {
      targetStatus = targetColumn.id;
    } else {
      const overApplicant = applicants.find(a => a.id === overId);
      if (!overApplicant) return;
      targetStatus = overApplicant.status;
    }

    if (draggedApplicant.status === targetStatus) return;

    if (targetStatus === 'INTERVIEW_SCHEDULED') {
      setInterviewModal({ open: true, applicant: draggedApplicant });
      return;
    }

    await updateStatus(draggedApplicant, targetStatus);
  };

  const updateStatus = async (applicant: ApplicantCard, newStatus: ApplicationStatus) => {
    try {
      await ApplicationService.updateStatus(applicant.applicationId, { status: newStatus });
    } catch { /* optimistic update */ }
    setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: newStatus } : a));
    message.success(`Moved ${applicant.studentName} to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
  };

  const handleScheduleInterview = async (date: string, link: string) => {
    if (!interviewModal.applicant) return;
    try {
      await ApplicationService.updateStatus(interviewModal.applicant.applicationId, {
        status: 'INTERVIEW_SCHEDULED',
        interviewDate: date,
        interviewLink: link,
      });
    } catch { /* optimistic */ }
    setApplicants(prev => prev.map(a => a.id === interviewModal.applicant!.id
      ? { ...a, status: 'INTERVIEW_SCHEDULED' as ApplicationStatus, interviewDate: date, interviewLink: link } : a));
    message.success(`Interview scheduled for ${interviewModal.applicant.studentName}`);
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
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Drag & drop to update status</p>
        </div>
        <span style={{ padding: '6px 14px', borderRadius: c.radiusFull, background: c.bgLight, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 700, color: c.textMuted }}>{applicants.length} Total</span>
      </div>

      <div style={{ display: 'flex', gap: 16, padding: '0 24px', overflowX: 'auto', alignItems: 'flex-start' }}>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {COLUMNS.map(column => (
            <KanbanColumn key={column.id} column={column} applicants={applicants.filter(a => a.status === column.id)} onViewDetails={(a) => setDetailModal({ open: true, applicant: a })} />
          ))}
          <DragOverlay>{activeApplicant ? <DragCard applicant={activeApplicant} /> : null}</DragOverlay>
        </DndContext>
      </div>

      <InterviewModal
        applicant={interviewModal.applicant}
        open={interviewModal.open}
        onClose={() => setInterviewModal({ open: false, applicant: null })}
        onConfirm={handleScheduleInterview}
      />
      <DetailModal
        applicant={detailModal.applicant}
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, applicant: null })}
      />
    </div>
  );
};
