import React, { useEffect, useState } from 'react';
import { Spin, App, Modal, Button, Input } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
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
  DownloadOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ApplicationService } from '@/services/ApplicationService';

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
  { bg: 'bg-[#fff3e6]', text: 'text-[#E67E22]' },
  { bg: 'bg-emerald-100', text: 'text-emerald-500' },
  { bg: 'bg-blue-100', text: 'text-blue-500' },
  { bg: 'bg-amber-100', text: 'text-amber-500' },
  { bg: 'bg-purple-100', text: 'text-purple-500' },
  { bg: 'bg-red-100', text: 'text-red-500' },
];

function getAvatarColor(name: string) {
  const idx = name.split('').reduce((a, ch) => a + (ch.codePointAt(0) ?? 0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ============================================================
// MAP API RESPONSE TO APPLICANT CARD (UC-39: from real backend)
// ============================================================
function mapToApplicantCard(item: any): ApplicantCard {
  const name: string = item.studentName ?? item.student?.fullName ?? 'Student';
  const avatarColor = getAvatarColor(name);
  return {
    id: item.applicationId ?? item.id,
    applicationId: item.applicationId ?? item.id,
    studentName: name,
    studentCode: item.studentCode ?? item.student?.studentCode ?? '—',
    studentEmail: item.studentEmail ?? item.student?.email ?? '',
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

const COLUMNS: { id: KanbanStatus; label: string; colorClass: string; bgClass: string; borderClass: string }[] = [
  { id: 'PENDING', label: 'Pending', colorClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-500/20' },
  { id: 'INTERVIEW_SCHEDULED', label: 'Interviewing', colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-500/20' },
  { id: 'ACCEPTED', label: 'Passed', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-500/20' },
  { id: 'REJECTED', label: 'Rejected', colorClass: 'text-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-500/20' },
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
const STATUS_PALETTE: Record<string, { colorClass: string; bgClass: string; borderClass: string; label: string; icon: React.ReactNode }> = {
  PENDING: { colorClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-500/25', label: 'Pending', icon: <WarningOutlined className="text-[10px]" /> },
  SCREENING_PASSED: { colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-500/25', label: 'CV Pass', icon: <CheckCircleOutlined className="text-[10px]" /> },
  SCREENING_REJECTED: { colorClass: 'text-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-500/25', label: 'CV Reject', icon: <CloseCircleOutlined className="text-[10px]" /> },
  INTERVIEW_SCHEDULED: { colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-500/25', label: 'Interviewing', icon: <ClockCircleOutlined className="text-[10px]" /> },
  ACCEPTED: { colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-500/25', label: 'Passed', icon: <CheckCircleOutlined className="text-[10px]" /> },
  REJECTED: { colorClass: 'text-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-500/25', label: 'Rejected', icon: <CloseCircleOutlined className="text-[10px]" /> },
  WITHDRAWN: { colorClass: 'text-slate-500', bgClass: 'bg-slate-50', borderClass: 'border-slate-500/25', label: 'Withdrawn', icon: <CloseCircleOutlined className="text-[10px]" /> },
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const config = STATUS_PALETTE[status] || STATUS_PALETTE.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${config.bgClass} border ${config.borderClass} ${config.colorClass} text-[11px] font-bold uppercase tracking-wider`}>
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
        whileHover={{ y: -1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 cursor-grab mb-2.5 transition-all"
      >
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className={`w-[42px] h-[42px] rounded-xl ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center text-[14px] font-extrabold shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-slate-900 mb-0.5 leading-[1.2]">
              {applicant.studentName}
            </div>
            <div className="text-[11px] text-slate-500 mb-1">{applicant.jobTitle}</div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <UserOutlined className="text-[11px] shrink-0" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{applicant.studentCode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MailOutlined className="text-[11px] shrink-0" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{applicant.studentEmail}</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 text-right">
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
    <div className="bg-white rounded-2xl border-2 border-[#E67E22] shadow-[0_20px_50px_rgba(230,126,34,0.2)] p-3.5 cursor-grabbing w-[260px]">
      <div className="flex items-start gap-2.5">
        <div className={`w-[42px] h-[42px] rounded-xl ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center text-[14px] font-extrabold`}>
          {initials}
        </div>
        <div>
          <div className="text-[13px] font-bold text-slate-900">{applicant.studentName}</div>
          <div className="text-[11px] text-slate-500">{applicant.jobTitle}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DETAIL MODAL
// ============================================================
interface DetailModalProps {
  applicant: ApplicantCard | null;
  open: boolean;
  onClose: () => void;
  onScreenComplete?: (applicant: ApplicantCard, newStatus: 'SCREENING_PASSED' | 'SCREENING_REJECTED', reason?: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ applicant, open, onClose, onScreenComplete }) => {
  const { message } = App.useApp();
  const [downloading, setDownloading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'SCREENING_PASSED' | 'SCREENING_REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!applicant) return null;
  const avatarColor = applicant.avatarColor;
  const initials = (applicant.studentName || 'ST').substring(0, 2).toUpperCase();
  const isPending = applicant.status === 'PENDING';
  const alreadyScreened = applicant.status === 'SCREENING_PASSED' || applicant.status === 'SCREENING_REJECTED';

  const openConfirm = (decision: 'SCREENING_PASSED' | 'SCREENING_REJECTED') => {
    setPendingDecision(decision);
    setRejectionReason('');
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setPendingDecision(null);
    setRejectionReason('');
  };

  const submitScreen = async () => {
    if (!pendingDecision) return;
    if (pendingDecision === 'SCREENING_REJECTED' && !rejectionReason.trim()) {
      message.warning('Justification notes when failing a candidate.');
      return;
    }
    setSubmitting(true);
    try {
      await ApplicationService.screen(applicant.applicationId, {
        status: pendingDecision,
        rejectionReason: pendingDecision === 'SCREENING_REJECTED' ? rejectionReason.trim() : undefined,
      });
      message.success('Application status updated successfully.');
      setConfirmOpen(false);
      onScreenComplete?.(applicant, pendingDecision, pendingDecision === 'SCREENING_REJECTED' ? rejectionReason.trim() : undefined);
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      const errorStr = typeof backendMsg === 'string' ? backendMsg : 'Failed to update screening status.';
      if (err?.response?.status === 400 || err?.response?.status === 409) {
        message.warning(errorStr);
      } else {
        message.error(errorStr);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCv = async () => {
    if (!applicant?.applicationId) return;
    setDownloading(true);
    const hide = message.loading('Preparing CV…', 0);
    try {
      const filename = await ApplicationService.downloadCV(applicant.applicationId, applicant.studentName);
      hide();
      message.success(`File download started automatically (${filename})`);
    } catch (err: any) {
      hide();
      const code = err?.response?.data?.code;
      const backendMsg = err?.response?.data?.message;
      if (err?.response?.status === 404 || code === 1073) {
        message.error('The requested CV file is currently unavailable or has been removed by the applicant.');
      } else {
        const errorStr = typeof backendMsg === 'string' ? backendMsg : 'Failed to download CV. Please try again.';
        message.error(errorStr);
      }
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Modal
      title={<div className="font-sans font-bold text-slate-900 text-[16px]">Applicant Details</div>}
      open={open} onCancel={onClose} footer={null} width={480}
      styles={{ content: { borderRadius: '1rem', padding: '24px 28px' }, header: { borderBottom: 'none', marginBottom: 16, padding: 0 }, body: { padding: 0 } }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl ${avatarColor.bg} ${avatarColor.text} flex items-center justify-center text-[22px] font-extrabold`}>
            {initials}
          </div>
          <div>
            <div className="text-[18px] font-extrabold text-slate-900 mb-1">{applicant.studentName}</div>
            <div className="text-[13px] text-slate-500 mb-2">{applicant.jobTitle}</div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Student ID', value: applicant.studentCode },
            { label: 'Job Post', value: applicant.jobTitle },
            { label: 'Status', value: applicant.status },
            { label: 'Applied', value: dayjs(applicant.appliedAt).format('MMM D, YYYY') },
          ].map(item => (
            <div key={item.label} className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</div>
              <div className="text-[13px] font-semibold text-slate-900 break-words">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</div>
          <div className="text-[13px] font-semibold text-slate-900">{applicant.studentEmail}</div>
        </div>
        {applicant.coverLetter && (
          <div className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Letter</div>
            <div className="text-[13px] text-slate-900 leading-relaxed whitespace-pre-wrap">{applicant.coverLetter}</div>
          </div>
        )}
        <div className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CV / Resume</div>
          <div className="text-[13px] font-semibold text-slate-900">
            {applicant.cvFileUrl ? (
              applicant.cvFileUrl.startsWith('http') ? (
                <a href={applicant.cvFileUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                  <FileTextOutlined /> View External CV Link
                </a>
              ) : (
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  loading={downloading}
                  onClick={handleDownloadCv}
                  className="p-0 h-auto text-blue-500 hover:text-blue-600 flex items-center gap-1 text-[13px]"
                >
                  Download CV Document (PDF)
                </Button>
              )
            ) : (
              <span className="text-slate-400 italic">No CV provided</span>
            )}
          </div>
        </div>
        {isPending && (
          <div className="flex gap-2.5 pt-1 border-t border-slate-100">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => openConfirm('SCREENING_PASSED')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 border-none font-bold py-4 rounded-xl"
            >
              Pass Screening
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => openConfirm('SCREENING_REJECTED')}
              className="flex-1 font-bold py-4 rounded-xl"
            >
              Reject
            </Button>
          </div>
        )}
        {applicant.rejectionReason && (
          <div className="px-3.5 py-3 rounded-xl bg-red-50 border border-red-500/30">
            <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</div>
            <div className="text-[13px] text-slate-900 leading-relaxed">{applicant.rejectionReason}</div>
          </div>
        )}
        {alreadyScreened && (
          <div className="text-[12px] text-slate-500 text-center px-3 py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <LockOutlined className="mr-1.5" />
            Evaluation locked — application has been screened.
          </div>
        )}
      </div>
      <Modal
        title={
          <div className="font-sans font-bold text-slate-900 text-[15px]">
            {pendingDecision === 'SCREENING_PASSED' ? 'Confirm Pass Screening' : 'Confirm Rejection'}
          </div>
        }
        open={confirmOpen}
        onCancel={closeConfirm}
        footer={null}
        width={420}
        destroyOnHidden
        styles={{ content: { borderRadius: '1rem' } }}
      >
        <div className="text-[13px] text-slate-900 mb-3 leading-relaxed">
          Are you sure you want to{' '}
          <strong className={pendingDecision === 'SCREENING_PASSED' ? 'text-emerald-500' : 'text-red-500'}>
            {pendingDecision === 'SCREENING_PASSED' ? 'Pass' : 'Reject'}
          </strong>{' '}
          <strong>{applicant?.studentName}</strong>?
        </div>
        {pendingDecision === 'SCREENING_REJECTED' && (
          <div className="mb-3">
            <div className="text-[12px] font-bold text-slate-500 mb-1.5">
              Rejection Reason <span className="text-red-500">*</span>
            </div>
            <Input.TextArea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Briefly explain the reason for rejection (required)"
              maxLength={500}
              showCount
              className="rounded-xl"
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={closeConfirm} disabled={submitting} className="rounded-xl">Cancel</Button>
          <Button
            type="primary"
            danger={pendingDecision === 'SCREENING_REJECTED'}
            onClick={submitScreen}
            loading={submitting}
            className={`rounded-xl ${pendingDecision === 'SCREENING_PASSED' ? 'bg-emerald-500 hover:bg-emerald-600 border-none' : ''}`}
          >
            Confirm
          </Button>
        </div>
      </Modal>
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
}> = ({ column, applicants, onViewDetails }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div className="flex-[0_0_280px] flex flex-col min-w-0">
      <div className={`px-3.5 py-3 rounded-xl ${column.bgClass} border ${column.borderClass} mb-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block bg-current ${column.colorClass}`} />
          <span className={`text-[13px] font-bold ${column.colorClass}`}>{column.label}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full bg-current/10 ${column.colorClass} text-[12px] font-bold`}>{applicants.length}</span>
      </div>
      <SortableContext items={applicants.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 px-1 py-1.5 min-h-[200px] rounded-xl bg-slate-50 border border-dashed overflow-y-auto max-h-[calc(100vh-280px)] transition-colors ${isOver ? 'border-[#E67E22] bg-[#E67E22]/5' : 'border-slate-200'}`}
        >
          {applicants.length === 0 ? (
            <div className="py-8 px-4 text-center text-slate-500 text-[12px]">Drop here</div>
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
};

// ============================================================
// MAIN KANBAN BOARD
// ============================================================
export const ApplicantKanbanTab: React.FC = () => {
  const { message } = App.useApp();
  const [applicants, setApplicants] = useState<ApplicantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; applicant: ApplicantCard | null }>({ open: false, applicant: null });
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    applicant: ApplicantCard | null;
    pendingRejectReason: string;
    submitting: boolean;
  }>({ open: false, applicant: null, pendingRejectReason: '', submitting: false });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApplicationService.getMyEnterprise();
      const data: any[] = res.data?.result ?? res.data ?? [];
      setApplicants(Array.isArray(data) ? data.map(mapToApplicantCard) : []);
    } catch (err: any) {
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

    // Asking for a reason when dropping into REJECTED (especially from
    // INTERVIEW_SCHEDULED — disciplinary / misconduct case).
    if (targetStatus === 'REJECTED') {
      setRejectModal({
        open: true,
        applicant: draggedApplicant,
        pendingRejectReason: '',
        submitting: false,
      });
      return;
    }

    await updateStatus(draggedApplicant, targetStatus, undefined);
  };

  const submitReject = async () => {
    const { applicant, pendingRejectReason } = rejectModal;
    if (!applicant) return;
    if (!pendingRejectReason.trim()) {
      message.warning('Please provide a rejection reason.');
      return;
    }
    setRejectModal(prev => ({ ...prev, submitting: true }));
    try {
      await updateStatus(applicant, 'REJECTED', pendingRejectReason.trim());
      setRejectModal({ open: false, applicant: null, pendingRejectReason: '', submitting: false });
    } catch {
      setRejectModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const updateStatus = async (
    applicant: ApplicantCard,
    newStatus: KanbanStatus,
    rejectionReason?: string,
  ) => {
    const backendStatus: ApplicationStatus =
      newStatus === 'PENDING' ? 'PENDING' :
      newStatus === 'INTERVIEW_SCHEDULED' ? 'INTERVIEW_SCHEDULED' :
      newStatus === 'ACCEPTED' ? 'ACCEPTED' :
      'REJECTED';

    // Optimistic update
    setApplicants(prev => prev.map(a => a.id === applicant.id ? {
      ...a,
      status: backendStatus,
      rejectionReason: rejectionReason ?? a.rejectionReason,
    } : a));
    try {
      await ApplicationService.updateStatus(applicant.applicationId, {
        status: backendStatus,
        ...(rejectionReason ? { rejectionReason } : {}),
      });
      message.success(`Moved ${applicant.studentName} to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (err: any) {
      // Revert on error
      setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: applicant.status } : a));
      const errorMsg = err.response?.data?.message;
      const errorStr = typeof errorMsg === 'string' ? errorMsg : 'Failed to save status change. Please check your connection.';
      message.error(errorStr);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <div className="px-6 pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">Applicant Kanban</h2>
          <p className="text-[13px] text-slate-500 m-0">Drag &amp; drop to update application status</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[12px] font-bold text-slate-500">{applicants.length} Total</span>
          <Button size="small" icon={<ReloadOutlined />} onClick={fetchApplicants} className="rounded-xl h-8 px-3">Refresh</Button>
        </div>
      </div>

      {applicants.length === 0 && !error ? (
        <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <FileTextOutlined className="text-[48px] text-slate-400 mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">No applications yet</div>
          <div className="text-[13px] text-slate-500">Students will appear here once they apply to your job posts</div>
        </div>
      ) : applicants.length === 0 && error ? (
        <div className="p-[60px] text-center text-red-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <WarningOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">Unable to load application details</div>
          <div className="text-[13px] text-slate-500 mb-3">{error}</div>
          <Button type="primary" onClick={fetchApplicants} className="bg-[#E67E22] hover:bg-[#D68910] border-none rounded-xl">Try Again</Button>
        </div>
      ) : (
        <div className="flex gap-4 px-6 overflow-x-auto items-start min-h-[500px]">
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
        onScreenComplete={(a, newStatus, reason) => {
          setApplicants(prev => prev.map(item =>
            item.id === a.id
              ? { ...item, status: newStatus, rejectionReason: reason ?? item.rejectionReason }
              : item
          ));
        }}
      />

      <Modal
        open={rejectModal.open}
        title={
          <div className="font-extrabold text-slate-900">
            Reject {rejectModal.applicant?.studentName}?
          </div>
        }
        onCancel={() => {
          if (rejectModal.submitting) return;
          setRejectModal({ open: false, applicant: null, pendingRejectReason: '', submitting: false });
        }}
        footer={null}
        destroyOnHidden
      >
        {rejectModal.applicant?.status === 'INTERVIEW_SCHEDULED' && (
          <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            This candidate is currently in an interview. The active interview will be cancelled automatically.
          </div>
        )}
        <div className="mb-3">
          <div className="text-[12px] font-bold text-slate-500 mb-1.5">
            Rejection reason <span className="text-red-500">*</span>
          </div>
          <Input.TextArea
            value={rejectModal.pendingRejectReason}
            onChange={e =>
              setRejectModal(prev => ({ ...prev, pendingRejectReason: e.target.value }))
            }
            rows={3}
            placeholder="e.g. Misconduct during interview, no-show, breach of company policy..."
            maxLength={500}
            showCount
            className="rounded-xl"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              if (rejectModal.submitting) return;
              setRejectModal({ open: false, applicant: null, pendingRejectReason: '', submitting: false });
            }}
            disabled={rejectModal.submitting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            loading={rejectModal.submitting}
            onClick={submitReject}
            className="rounded-xl"
          >
            Confirm reject
          </Button>
        </div>
      </Modal>
    </div>
  );
};
