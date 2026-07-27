import React, { useState, useCallback, useEffect } from 'react';
import { Table, Modal, App, Spin, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Inbox,
  CheckCircle2,
  ChevronDown,
  Download,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  PlacementApplicationService,
  type OjtPlacementView,
  type AutoMatchResult,
  type AssignmentDetails,
} from '@/services/PlacementApplicationService';
import { EnterpriseService } from '@/services/EnterpriseService';
import type { Enterprise } from '@/pages/training-manager/types';

// ============================================================
// DESIGN TOKENS
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
// TYPES — workflow_status comes from backend OjtPlacementViewDTO
// ============================================================
type WorkflowStatus =
  | 'UNPLACED'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'PLACED'
  | 'COMPLETED'
  | 'CANCELLED';

type SourceType = 'SELF_SOURCED' | 'SYSTEM_MATCHED' | 'UNSOURCED';

interface PlacementRecord extends OjtPlacementView {
  targetRole?: string;
  key: string;
  avatar: string;
  source: SourceType;
  enterpriseInitials: string | null;
  enterpriseColor: string | null;
}

// ============================================================
// SOURCE DETECTION
// Ưu tiên dùng cột `source` từ backend (đã được persist vào DB).
// Fallback parse coverLetter prefix cho row cũ chưa được backfill.
// Nếu không có applicationId → UNSOURCED (SV chưa có placement_application).
// ============================================================
function detectSource(item: OjtPlacementView): SourceType {
  if (!item.applicationId) return 'UNSOURCED';
  if (item.source === 'SELF_SOURCED') return 'SELF_SOURCED';
  if (item.source === 'SYSTEM_MATCHED') return 'SYSTEM_MATCHED';
  // Fallback cho row legacy chưa được backfill source:
  const cl = item.coverLetter ?? '';
  if (cl.startsWith('[Manual Match by TM]')) return 'SYSTEM_MATCHED';
  if (cl.startsWith('[Auto-Match]')) return 'SYSTEM_MATCHED';
  if (cl.startsWith('[Interview Pass]')) return 'SYSTEM_MATCHED';
  if (cl.startsWith('[Legacy:')) return 'SYSTEM_MATCHED';
  return 'SELF_SOURCED';
}

// ============================================================
// COLOR UTILITIES
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// STATUS CONFIG — ghost outline (rgba bg for backgroundColor compat)
// ============================================================
const STATUS_CONFIG: Record<WorkflowStatus, {
  label: string; color: string; bg: string; borderColor: string;
}> = {
  UNPLACED:         { label: 'Unplaced',       color: cc.neutral,  bg: hexToRgba(cc.neutral,  0.06), borderColor: hexToRgba(cc.neutral,  0.25) },
  PENDING_APPROVAL: { label: 'Pending',        color: cc.info,     bg: hexToRgba(cc.info,     0.06), borderColor: hexToRgba(cc.info,     0.25) },
  REJECTED:         { label: 'Rejected',       color: cc.error,    bg: hexToRgba(cc.error,    0.06), borderColor: hexToRgba(cc.error,    0.25) },
  WITHDRAWN:        { label: 'Withdrawn',      color: cc.neutral,  bg: hexToRgba(cc.neutral,  0.06), borderColor: hexToRgba(cc.neutral,  0.25) },
  PLACED:           { label: 'Placed',         color: cc.success,  bg: hexToRgba(cc.success,  0.06), borderColor: hexToRgba(cc.success,  0.25) },
  COMPLETED:        { label: 'Completed',      color: cc.purple,   bg: hexToRgba(cc.purple,   0.06), borderColor: hexToRgba(cc.purple,   0.25) },
  CANCELLED:        { label: 'Terminated',     color: cc.error,    bg: hexToRgba(cc.error,    0.06), borderColor: hexToRgba(cc.error,    0.25) },
};

// ============================================================
// AVATAR PALETTE — deterministic 4-color from brand tokens
// ============================================================
const AVATAR_PALETTE = [
  { bg: cc.brandMuted,   text: cc.brand  },   // slot 0 — orange family
  { bg: cc.successMuted, text: cc.success },   // slot 1 — green family
  { bg: cc.infoMuted,    text: cc.info   },   // slot 2 — blue family
  { bg: cc.warningMuted, text: cc.warning },   // slot 3 — amber family
];

// ============================================================
// ENTERPRISE PALETTE — deterministic 4-color for enterprise avatars
// ============================================================
const ENTERPRISE_PALETTE = [
  { color: cc.brand,   bg: hexToRgba(cc.brand,   0.15) },   // slot 0 — orange family
  { color: cc.success, bg: hexToRgba(cc.success, 0.15) },   // slot 1 — green family
  { color: cc.info,    bg: hexToRgba(cc.info,    0.15) },   // slot 2 — blue family
  { color: cc.warning, bg: hexToRgba(cc.warning, 0.15) },   // slot 3 — amber family
];

function getEnterpriseColor(name: string) {
  const idx = name.split('').reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0) % ENTERPRISE_PALETTE.length;
  return ENTERPRISE_PALETTE[idx];
}

function getAvatarColor(name: string) {
  const idx = name.split('').reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

// ============================================================
// AVATAR — minimal circle with deterministic brand palette
// ============================================================
const Avatar: React.FC<{ initials: string; color?: string; bg?: string }> = ({ initials, color, bg }) => {
  const palette = (color || bg) ? null : getAvatarColor(initials);
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: bg ?? (color ? hexToRgba(color, 0.15) : palette?.bg),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color ?? palette?.text,
      fontWeight: 700, fontSize: 11,
      fontFamily: 'Inter, sans-serif', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

// ============================================================
// STATUS BADGE — only visual accent in a row
// ============================================================
const StatusBadge: React.FC<{ status: WorkflowStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNPLACED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 6,
      backgroundColor: cfg.bg, border: `1px solid ${cfg.borderColor}`,
      color: cfg.color, fontSize: 11, fontWeight: 600,
      fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em',
    }}>
      {cfg.label}
    </span>
  );
};

// ============================================================
// HEADER BADGE — styled column header
// ============================================================
const HeaderBadge: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({ children, align = 'left' }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
    color: cc.textMuted, textTransform: 'uppercase' as const,
    letterSpacing: '0.05em', lineHeight: 1,
  }}>
    {children}
  </div>
);

const ActionButtons: React.FC<{
  record: PlacementRecord;
  onApprove: (record: PlacementRecord) => void;
  onReject: (record: PlacementRecord) => void;
  onManualMatch: (record: PlacementRecord) => void;
  onViewContract: (record: PlacementRecord) => void;
}> = ({ record, onApprove, onReject, onManualMatch, onViewContract }) => {
  if (record.workflowStatus === 'PENDING_APPROVAL') {
    return (
      <div className="flex items-center w-full h-full justify-end gap-1.5">
        <button
          onClick={() => onApprove(record)}
          className="px-3 py-1.5 rounded-md border-none bg-[#10B981] text-white text-[11.5px] font-bold font-sans cursor-pointer whitespace-nowrap shadow-[0_2px_6px_rgba(16,185,129,0.18)] transition-all duration-150 ease-in-out hover:bg-[#0D9668] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(record)}
          className="px-3 py-1.5 rounded-md border-[1.5px] border-solid border-[#EF4444] bg-transparent text-[#EF4444] text-[11.5px] font-bold font-sans cursor-pointer whitespace-nowrap transition-all duration-150 ease-in-out hover:bg-[#EF4444] hover:text-white hover:-translate-y-[1px]"
        >
          Reject
        </button>
      </div>
    );
  }

  if (record.workflowStatus === 'UNPLACED') {
    return (
      <div className="flex items-center w-full h-full justify-end">
        <button
          onClick={() => onManualMatch(record)}
          className="px-3 py-1.5 rounded-md border-[1.5px] border-solid border-[#FF7A30] bg-transparent text-[#FF7A30] text-[11.5px] font-bold font-sans cursor-pointer whitespace-nowrap transition-all duration-150 ease-in-out hover:bg-[#FF7A30] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_3px_10px_rgba(255,122,48,0.22)]"
        >
          Match
        </button>
      </div>
    );
  }

  if (record.workflowStatus === 'PLACED' || record.workflowStatus === 'COMPLETED') {
    return (
      <div className="flex items-center w-full h-full justify-end">
        <button
          onClick={() => onViewContract(record)}
          className="px-3 py-1.5 rounded-md border-none bg-transparent text-[#94A3B8] text-[11.5px] font-semibold font-sans cursor-pointer whitespace-nowrap transition-colors duration-150 ease-in-out hover:text-[#64748B]"
        >
          View Details
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full h-full justify-end">
      <span className="font-sans align-middle text-[11px] text-[#94A3B8] italic">
        No action
      </span>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const renderPaginationTotal = (total: number, range: [number, number]) => (
  <span style={{ fontSize: 12, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>
    {range[0]}–{range[1]} of {total} students
  </span>
);

export const OJTTab: React.FC = () => {
  const { message } = App.useApp();
  const [majorFilter, setMajorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [running, setRunning] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PlacementRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [placementData, setPlacementData] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [autoMatchResult, setAutoMatchResult] = useState<AutoMatchResult | null>(null);
  const [autoMatchModalOpen, setAutoMatchModalOpen] = useState(false);
  const [manualMatchLoading, setManualMatchLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractData, setContractData] = useState<AssignmentDetails | null>(null);
  const [contractLoading, setContractLoading] = useState(false);

  const fetchOjtView = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await PlacementApplicationService.getOjtPlacementView();
      const rows = (data as OjtPlacementView[]) || [];
      const mapped: PlacementRecord[] = rows.map((item) => {
        const entName = item.enterpriseName ?? null;
        const entColor = entName ? getEnterpriseColor(entName) : null;
        // #region agent log
        try {
          const cl = (item.coverLetter ?? '').substring(0, 60);
          fetch('http://127.0.0.1:7689/ingest/85060117-28a9-450a-b776-759dca15ff5a', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cb12c5' },
            body: JSON.stringify({
              sessionId: 'cb12c5',
              hypothesisId: 'H1',
              location: 'OJTTab.tsx:295',
              message: 'source-mapping-debug',
              data: {
                studentCode: item.studentCode,
                workflowStatus: item.workflowStatus,
                hasApplicationId: !!item.applicationId,
                applicationStatus: item.applicationStatus,
                coverLetterPrefix: cl,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
        } catch {}
        // #endregion
        return {
          ...item,
          key: `${item.studentId}__${item.semesterId}`,
          avatar: (item.studentName ?? 'ST').substring(0, 2).toUpperCase(),
          source: detectSource(item),
          enterpriseInitials: entName ? entName.substring(0, 2).toUpperCase() : null,
          enterpriseColor: entColor?.color ?? null,
        };
      });
      setPlacementData(mapped);
    } catch (err) {
      console.error('Failed to load OJT placements', err);
      setPlacementData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEnterprises = useCallback(async () => {
    try {
      const list = await EnterpriseService.getApproved();
      setEnterprises(list);
    } catch (err) {
      console.error('Failed to load enterprises', err);
      setEnterprises([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchOjtView();
    void fetchEnterprises();
  }, [fetchOjtView, fetchEnterprises]);

  const pendingCount = placementData.filter(
    (p) => p.workflowStatus === 'PENDING_APPROVAL'
  ).length;



  const handleAutoMatch = useCallback(async () => {
    setRunning(true);
    try {
      const { data } = await PlacementApplicationService.autoMatch();
      const result = data as AutoMatchResult;
      setAutoMatchResult(result);
      setAutoMatchModalOpen(true);
      if (result.matchedCount > 0) {
        void message.success(
          `Auto-matched ${result.matchedCount} students in ${result.durationMs}ms — review in the modal.`,
          4
        );
        await fetchOjtView();
      } else {
        void message.info('No students were matched. Check the result modal for details.', 3);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      void message.error(msg ?? 'Auto-match failed', 3);
    } finally {
      setRunning(false);
    }
  }, [fetchOjtView, message]);

  const handleManualMatchSubmit = useCallback(
    async (enterpriseId: string, enterpriseName: string) => {
      if (!selectedRecord) return;
      setManualMatchLoading(true);
      try {
        await PlacementApplicationService.manualMatch({
          studentId: selectedRecord.studentId,
          enterpriseId,
        });
        void message.success(
          `Matched ${selectedRecord.studentName} → ${enterpriseName}!`,
          3
        );
        setMatchModalOpen(false);
        await fetchOjtView();
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        void message.error(msg ?? 'Manual match failed', 3);
      } finally {
        setManualMatchLoading(false);
      }
    },
    [selectedRecord, fetchOjtView, message]
  );

  const openManualMatch = useCallback((record: PlacementRecord) => {
    setSelectedRecord(record);
    setMatchModalOpen(true);
  }, []);

  const openApprove = useCallback((record: PlacementRecord) => {
    setSelectedRecord(record);
    setApproveModalOpen(true);
  }, []);

  const openReject = useCallback((record: PlacementRecord) => {
    setSelectedRecord(record);
    setRejectReason('');
    setRejectModalOpen(true);
  }, []);

  const handleViewContract = useCallback(async (record: PlacementRecord) => {
    if (!record.assignmentId) {
      void message.warning({ content: 'No assignment found for this student.', duration: 2 });
      return;
    }
    setContractModalOpen(true);
    setContractData(null);
    setContractLoading(true);
    try {
      const res = await PlacementApplicationService.getAssignmentById(record.assignmentId);
      setContractData(res.data as AssignmentDetails);
    } catch {
      void message.error({ content: 'Failed to load assignment details.', duration: 3 });
      setContractModalOpen(false);
    } finally {
      setContractLoading(false);
    }
  }, [message]);

  const handleApprove = useCallback(async (record: PlacementRecord) => {
    if (!record.applicationId) return;
    try {
      await PlacementApplicationService.approve(record.applicationId);
      void message.success({
        content: `${record.studentName} placed at ${record.enterpriseName}!`,
        duration: 3,
      });
      setApproveModalOpen(false);
      setReviewDrawerOpen(false);
      await fetchOjtView();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      void message.error({ content: msg ?? 'Approve failed', duration: 3 });
    }
  }, [fetchOjtView, message]);

  const handleReject = useCallback(async () => {
    if (!selectedRecord?.applicationId) return;
    if (rejectReason.trim().length < 5) {
      void message.warning({ content: 'Rejection reason must be at least 5 characters', duration: 2.5 });
      return;
    }
    try {
      await PlacementApplicationService.reject(selectedRecord.applicationId, {
        rejectionReason: rejectReason.trim(),
      });
      void message.success({
        content: `Application rejected for ${selectedRecord.studentName}`,
        duration: 2.5,
      });
      setRejectModalOpen(false);
      setRejectReason('');
      await fetchOjtView();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      void message.error({ content: msg ?? 'Reject failed', duration: 3 });
    }
  }, [selectedRecord, rejectReason, fetchOjtView, message]);

  const filteredData = placementData.filter((p) => {
    if (majorFilter !== 'ALL' && p.major !== majorFilter) return false;
    if (statusFilter !== 'ALL' && p.workflowStatus !== statusFilter) return false;
    return true;
  });

  const cellBase: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    verticalAlign: 'middle',
  };

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center',
    width: '100%', height: '100%',
  };

  const columns: ColumnsType<PlacementRecord> = [
    {
      title: <HeaderBadge>Student</HeaderBadge>,
      dataIndex: 'studentName',
      key: 'student',
      fixed: isMobile ? undefined : 'left',
      align: 'left' as const,
      width: 220,
      render: (_: unknown, record: PlacementRecord) => (
        <div style={row}>
          <Avatar initials={record.avatar} />
          <div style={{ minWidth: 0, marginLeft: 10 }}>
            {/* name */}
            <div style={{ ...cellBase, fontSize: 13, fontWeight: 600, color: cc.textPrimary, lineHeight: 1.3 }}>
              {record.studentName}
            </div>
            {/* unified pill: [code · major] */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 3, padding: '2px 7px 2px 6px',
              background: '#F3F4F6', border: '1px solid #E5E7EB',
              borderRadius: 4,
            }}>
              <span style={{
                fontFamily: "'Fira Code', 'Courier New', monospace",
                fontSize: 10, color: '#6B7280',
                letterSpacing: '-0.01em',
              }}>
                {record.studentCode}
              </span>
              <span style={{ color: '#D1D5DB', fontSize: 10 }}>·</span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 9.5, fontWeight: 800, color: cc.textSecondary,
                letterSpacing: '0.05em',
              }}>
                {record.major}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <HeaderBadge>Target Role</HeaderBadge>,
      dataIndex: 'targetRole',
      key: 'targetRole',
      align: 'left' as const,
      width: 160,
      render: (role: string) => (
        <div style={row}>
          <span style={{ ...cellBase, fontSize: 12, color: cc.textSecondary }}>{role}</span>
        </div>
      ),
    },
    {
      title: <HeaderBadge>Source</HeaderBadge>,
      key: 'source',
      align: 'left' as const,
      width: 135,
      render: (_: unknown, record: PlacementRecord) => {
        const sourceCfg: Record<SourceType, { label: string; bg: string; border: string; color: string }> = {
          SELF_SOURCED:   { label: 'Self-Sourced',   bg: hexToRgba(cc.info, 0.06),    border: hexToRgba(cc.info, 0.25),    color: cc.info },
          SYSTEM_MATCHED: { label: 'System-Matched', bg: hexToRgba(cc.purple, 0.06),  border: hexToRgba(cc.purple, 0.25),  color: cc.purple },
          UNSOURCED:      { label: '—',              bg: hexToRgba(cc.neutral, 0.06), border: hexToRgba(cc.neutral, 0.25), color: cc.textMuted },
        };
        const cfg = sourceCfg[record.source];
        return (
          <div style={row}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 7px', borderRadius: 6,
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              {cfg.label}
            </span>
          </div>
        );
      },
    },
    {
      title: <HeaderBadge>Enterprise</HeaderBadge>,
      key: 'enterprise',
      align: 'left' as const,
      width: 200,
      render: (_: unknown, record: PlacementRecord) => (
        <div style={row}>
          {record.enterpriseName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Avatar initials={record.enterpriseInitials ?? '??'} color={record.enterpriseColor ?? undefined} />
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ ...cellBase, fontSize: 12, fontWeight: 600, color: cc.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {record.enterpriseName}
                </span>
                {record.isReplacement && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '1px 6px', borderRadius: 4,
                    backgroundColor: hexToRgba(cc.warning, 0.10),
                    border: `1px solid ${hexToRgba(cc.warning, 0.30)}`,
                    color: cc.warningText,
                    fontSize: 9, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.02em', width: 'fit-content',
                  }}>
                    REPLACEMENT
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span style={{ ...cellBase, fontSize: 12, color: cc.textMuted, fontStyle: 'italic' }}>—</span>
          )}
        </div>
      ),
    },
    {
      title: <HeaderBadge align="right">Status</HeaderBadge>,
      dataIndex: 'workflowStatus',
      key: 'workflowStatus',
      align: 'right' as const,
      width: 120,
      render: (status: WorkflowStatus) => (
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
      width: 200,
      render: (_: unknown, record: PlacementRecord) => (
        <ActionButtons 
          record={record} 
          onApprove={openApprove} 
          onReject={openReject} 
          onManualMatch={openManualMatch} 
          onViewContract={handleViewContract} 
        />
      ),
    },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 24px 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ojt-table .ant-table {
          background: transparent !important;
        }
        .ojt-table .ant-table-wrapper {
          border-radius: ${cc.radiusXl}px;
          overflow: hidden;
          box-shadow: ${cc.shadowSm};
          border: 1px solid ${cc.border};
        }
        .ojt-table .ant-table-thead > tr > th {
          background: ${cc.neutralBg} !important;
          border-bottom: 1px solid ${cc.border} !important;
          padding: 0 14px !important;
          height: 40px !important;
          box-sizing: border-box !important;
          font-family: 'Inter, sans-serif';
          vertical-align: middle !important;
        }
        .ojt-table .ant-table-thead > tr > th:first-child {
          border-radius: ${cc.radiusXl}px 0 0 0 !important;
          padding-left: 16px !important;
        }
        .ojt-table .ant-table-thead > tr > th:last-child {
          border-radius: 0 ${cc.radiusXl}px 0 0 !important;
          padding-right: 16px !important;
        }
        .ojt-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${cc.borderSubtle} !important;
          padding: 0 14px !important;
          height: 54px !important;
          box-sizing: border-box !important;
          background: ${cc.surface} !important;
          transition: background 0.15s ease !important;
          vertical-align: middle !important;
        }
        .ojt-table .ant-table-tbody > tr > td:first-child {
          padding-left: 16px !important;
        }
        .ojt-table .ant-table-tbody > tr > td:last-child {
          padding-right: 16px !important;
        }
        .ojt-table .ant-table-tbody > tr:hover > td {
          background: #FFF8F0 !important;
        }
        .ojt-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .ojt-table .ant-table-pagination {
          padding: 10px 16px !important;
          margin: 0 !important;
          background: ${cc.neutralBg} !important;
          border-top: 1px solid ${cc.border} !important;
          border-radius: 0 0 ${cc.radiusXl}px ${cc.radiusXl}px !important;
        }
      `}</style>

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: cc.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
          OJT Placement Center
        </h2>
        <p style={{ fontSize: 12.5, color: cc.textMuted, margin: '3px 0 0' }}>
          Manage student-to-enterprise matching and placement lifecycle
        </p>
      </div>

      {/* ── ACTION ROW — one horizontal strip ─────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 12, padding: '10px 14px',
        background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${cc.border}`,
        borderRadius: cc.radiusLg, boxShadow: cc.shadowSm, flexWrap: 'wrap',
      }}>
        {/* Left: CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleAutoMatch}
            disabled={running}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: cc.radiusMd,
              border: 'none',
              background: running ? `${cc.brand}80` : cc.brand,
              color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              cursor: running ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: running ? 'none' : '0 2px 8px rgba(255,122,48,.20)',
              opacity: running ? 0.75 : 1,
            }}
            onMouseEnter={(e) => {
              if (!running) {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = cc.brandHover; b.style.transform = 'translateY(-1px)';
                b.style.boxShadow = '0 4px 12px rgba(255,122,48,.28)';
              }
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = running ? `${cc.brand}80` : cc.brand;
              b.style.transform = 'translateY(0)';
              b.style.boxShadow = running ? 'none' : '0 2px 8px rgba(255,122,48,.20)';
            }}
          >
            {running ? (
              <><Spin size="small" style={{ color: '#fff' }} />Running…</>
            ) : (
              <><Sparkles size={13} strokeWidth={2.5} />Auto-Match</>
            )}
          </button>

          <button
            onClick={() => setReviewDrawerOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: cc.radiusMd,
              border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
              fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', transition: 'all 0.18s ease', position: 'relative',
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = cc.neutralBg; b.style.borderColor = cc.neutral;
              b.style.color = cc.textPrimary;
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = 'transparent'; b.style.borderColor = cc.border;
              b.style.color = cc.textSecondary;
            }}
          >
            <Inbox size={13} strokeWidth={2.5} />
            Self-Placements
            {pendingCount > 0 && (
              <span style={{
                minWidth: 18, height: 18, borderRadius: 99,
                background: cc.info, color: '#fff',
                fontSize: 10, fontWeight: 800, fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', lineHeight: 1,
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={async () => {
              if (filteredData.length === 0) {
                void message.warning('No data to export.');
                return;
              }
              setExporting(true);
              try {
                // Generate CSV locally from filteredData to respect current filters
                const rows = [
                  ['Student Code', 'Student Name', 'Major', 'Target Role', 'Source', 'Enterprise', 'Status']
                ];
                filteredData.forEach(p => {
                  rows.push([
                    p.studentCode || '',
                    p.studentName || '',
                    p.major || '',
                    p.targetRole || '',
                    p.source === 'SELF_SOURCED' ? 'Self-Sourced' : p.source === 'SYSTEM_MATCHED' ? 'System-Matched' : '—',
                    p.enterpriseName || '',
                    p.workflowStatus || ''
                  ]);
                });
                const csvContent = rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `ojt_placements_filtered.csv`);
                document.body.appendChild(link);
                link.click();
                if (link.parentNode) link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                void message.success('Export successful!');
              } catch (err) {
                console.error(err);
                void message.error('Failed to export OJT placements');
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: cc.radiusMd,
              border: `1.5px solid ${cc.brand}`, background: 'transparent', color: cc.brand,
              fontSize: 12.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              cursor: exporting ? 'not-allowed' : 'pointer', transition: 'all 0.18s ease',
              opacity: exporting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (exporting) return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = cc.brand; b.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              if (exporting) return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = 'transparent'; b.style.color = cc.brand;
            }}
          >
            {exporting ? <Spin size="small" /> : <Download size={13} strokeWidth={2.5} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          {/* Summary — mono-tint pill chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, borderLeft: `1px solid ${cc.border}`, marginLeft: 4, flexWrap: 'wrap' }}>
            {([
              { label: 'Unplaced',  n: placementData.filter((p) => p.workflowStatus === 'UNPLACED').length },
              { label: 'Pending',   n: placementData.filter((p) => p.workflowStatus === 'PENDING_APPROVAL').length },
              { label: 'Placed',    n: placementData.filter((p) => p.workflowStatus === 'PLACED').length },
              { label: 'Completed', n: placementData.filter((p) => p.workflowStatus === 'COMPLETED').length },
            ] as const).map(({ label, n }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: cc.radiusFull,
                background: `${cc.neutral}0A`,   // 4% neutral gray — all identical
              }}>
                <span style={{
                  minWidth: 18, height: 18, borderRadius: cc.radiusFull,
                  background: hexToRgba(cc.brand, 0.06),  // 6% brand orange tint
                  color: cc.brand,
                  fontSize: 10.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', lineHeight: 1, flexShrink: 0,
                }}>
                  {n}
                </span>
                <span style={{ fontSize: 11, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Select
            value={majorFilter}
            onChange={setMajorFilter}
            suffixIcon={<ChevronDown size={11} />}
            style={{ width: 120, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
            options={[
              { value: 'ALL', label: 'All Majors' },
              { value: 'SE', label: 'SE' },
              { value: 'IA', label: 'IA' },
              { value: 'AI', label: 'AI' },
              { value: 'GD', label: 'GD' },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            suffixIcon={<ChevronDown size={11} />}
            style={{ width: 145, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'UNPLACED', label: 'Unplaced' },
              { value: 'PENDING_APPROVAL', label: 'Pending' },
              { value: 'PLACED', label: 'Placed' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'WITHDRAWN', label: 'Withdrawn' },
            ]}
          />
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────────────────── */}
      <div className="ojt-table" style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: renderPaginationTotal,
          }}
          scroll={{ x: 935 }}
        />
      </div>

      {/* ── MODAL: Manual Match ───────────────────────────── */}
      <Modal
        title={null} open={matchModalOpen}
        onCancel={() => !manualMatchLoading && setMatchModalOpen(false)}
        footer={null}
        width={460} centered
        styles={{ body: { padding: 0 }, mask: { backdropFilter: 'blur(2px)' } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${cc.brand}, ${cc.brandHover})`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Sparkles size={20} color="#fff" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Manual Match</div>
            {selectedRecord && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.80)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                {selectedRecord.studentName} &middot; {selectedRecord.studentCode} &middot; {selectedRecord.major}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <p style={{ fontSize: 12.5, color: cc.textSecondary, marginBottom: 14, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            Assign an APPROVED enterprise to this student. This will instantly create a
            placement and an active assignment (no approval step needed).
          </p>
          {enterprises.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: cc.textMuted, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
              No APPROVED enterprises available.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
              {enterprises.map((ent) => {
                const c = getEnterpriseColor(ent.companyName);
                return (
                  <button
                    key={ent.enterpriseId}
                    disabled={manualMatchLoading}
                    onClick={() => void handleManualMatchSubmit(ent.enterpriseId, ent.companyName)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: cc.radiusMd,
                      border: `1px solid ${cc.border}`, background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      cursor: manualMatchLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease', textAlign: 'left',
                      opacity: manualMatchLoading ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (manualMatchLoading) return;
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = cc.neutralBg; b.style.borderColor = cc.neutral;
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      b.style.background = cc.surface; b.style.borderColor = cc.border;
                    }}
                  >
                    <Avatar initials={ent.companyName.substring(0, 2).toUpperCase()} color={c.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: cc.textPrimary, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ent.companyName}
                      </div>
                      {ent.industry && (
                        <div style={{ fontSize: 10.5, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                          {ent.industry}
                        </div>
                      )}
                    </div>
                    {manualMatchLoading && <Spin size="small" />}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button
              onClick={() => setMatchModalOpen(false)}
              disabled={manualMatchLoading}
              style={{
                padding: '6px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                opacity: manualMatchLoading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Approve Self-Placement ─────────────────── */}
      <Modal
        title={null} open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)} footer={null}
        width={440} centered
        styles={{ body: { padding: 0 }, mask: { backdropFilter: 'blur(2px)' } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${cc.success}, #0D9668)`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <CheckCircle2 size={20} color="#fff" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Approve Self-Placement</div>
            {selectedRecord && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.80)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                {selectedRecord.studentName}{selectedRecord.enterpriseName ? ' · ' + selectedRecord.enterpriseName : ''}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          {selectedRecord?.coverLetter && (
            <div style={{
              padding: '10px 12px', borderRadius: cc.radiusMd,
              background: cc.neutralBg, border: `1px solid ${cc.border}`,
              marginBottom: 14, fontSize: 11.5, color: cc.textSecondary,
              fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 700, color: cc.textPrimary, marginBottom: 4 }}>Cover letter</div>
              {selectedRecord.coverLetter}
            </div>
          )}
          {selectedRecord && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: cc.radiusMd,
              background: cc.neutralBg, border: `1px solid ${cc.border}`,
              marginBottom: 14,
            }}>
              <Avatar initials={selectedRecord.enterpriseInitials ?? '??'} color={selectedRecord.enterpriseColor ?? undefined} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                  {selectedRecord.enterpriseName ?? '—'}
                </div>
                <div style={{ fontSize: 11.5, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                  {selectedRecord.semesterCode}
                </div>
              </div>
            </div>
          )}
          <p style={{ fontSize: 12.5, color: cc.textSecondary, marginBottom: 14, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
            Approving will mark the application as <strong style={{ color: cc.success }}>APPROVED</strong> and
            automatically create an <strong>enterprise_assignments</strong> row with status ACTIVE.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => setApproveModalOpen(false)}
              style={{
                padding: '7px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => void handleApprove(selectedRecord!)}
              style={{
                padding: '7px 14px', borderRadius: cc.radiusMd,
                border: 'none', background: cc.success, color: '#fff',
                fontSize: 12.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(16,185,129,.18)',
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = '#0D9668'; b.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = cc.success; b.style.transform = 'translateY(0)';
              }}
            >
              Approve & Place
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Reject Self-Placement ─────────────────── */}
      <Modal
        title={null} open={rejectModalOpen}
        onCancel={() => { setRejectModalOpen(false); setRejectReason(''); }}
        footer={null}
        width={460} centered
        styles={{ body: { padding: 0 }, mask: { backdropFilter: 'blur(2px)' } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${cc.error}, #B91C1C)`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <XCircle size={20} color="#fff" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Reject Self-Placement</div>
            {selectedRecord && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.80)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                {selectedRecord.studentName}{selectedRecord.enterpriseName ? ' · ' + selectedRecord.enterpriseName : ''}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: cc.textPrimary, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
            Rejection reason <span style={{ color: cc.error }}>*</span>
          </label>
          <Input.TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this application is being rejected (min 5 chars)..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            showCount
            style={{ fontSize: 12.5, fontFamily: 'Inter, sans-serif', marginBottom: 14 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => { setRejectModalOpen(false); setRejectReason(''); }}
              style={{
                padding: '7px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => void handleReject()}
              style={{
                padding: '7px 14px', borderRadius: cc.radiusMd,
                border: 'none', background: cc.error, color: '#fff',
                fontSize: 12.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(239,68,68,.20)',
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = '#B91C1C'; b.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = cc.error; b.style.transform = 'translateY(0)';
              }}
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Update Status (placeholder for future) ─── */}
      <Modal
        title={null} open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)} footer={null}
        width={400} centered
        styles={{ body: { padding: 0 }, mask: { backdropFilter: 'blur(2px)' } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${cc.warning}, #D97706)`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <TrendingUp size={20} color="#fff" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Placement Actions</div>
            {selectedRecord && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.80)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                {selectedRecord.studentName}{selectedRecord.enterpriseName ? ' · ' + selectedRecord.enterpriseName : ''}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <p style={{ fontSize: 12.5, color: cc.textSecondary, marginBottom: 14, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
            Future actions (e.g. terminate, change enterprise) will be added here once the
            enterprise workflow is finalized.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setUpdateModalOpen(false)}
              style={{
                padding: '7px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Review Self-Placements ───────────────── */}
      <Modal
        title={null} open={reviewDrawerOpen}
        onCancel={() => setReviewDrawerOpen(false)} footer={null}
        width={540} centered
        styles={{ body: { padding: 0 }, mask: { backdropFilter: 'blur(2px)' } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${cc.info}, #1D4ED8)`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Inbox size={20} color="#fff" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Review Self-Placements</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.80)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
              {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px', background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', maxHeight: 380, overflowY: 'auto' }}>
          {placementData
            .filter((p) => p.workflowStatus === 'PENDING_APPROVAL')
            .map((record) => (
              <div key={record.key} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: cc.radiusMd,
                background: cc.neutralBg, border: `1px solid ${cc.border}`,
                marginBottom: 8,
              }}>
                <Avatar initials={record.avatar} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                    {record.studentName}
                  </div>
                  <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                    {record.studentCode} &middot; {record.semesterCode}
                  </div>
                </div>
                <Avatar initials={record.enterpriseInitials ?? '??'} color={record.enterpriseColor ?? undefined} />
                <span style={{ fontSize: 12, fontWeight: 600, color: cc.textSecondary, fontFamily: 'Inter, sans-serif', minWidth: 90 }}>
                  {record.enterpriseName}
                </span>
                <button
                  onClick={() => {
                    setReviewDrawerOpen(false);
                    setSelectedRecord(record);
                    setApproveModalOpen(true);
                  }}
                  style={{
                    padding: '5px 12px', borderRadius: cc.radiusMd,
                    border: 'none', background: cc.success, color: '#fff',
                    fontSize: 11.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(16,185,129,.18)',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = '#0D9668'; b.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = cc.success; b.style.transform = 'translateY(0)';
                  }}
                >
                  Approve
                </button>
              </div>
            ))}
          {pendingCount === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: cc.textMuted, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}>
              No pending requests.
            </div>
          )}
        </div>
        <div style={{
          padding: '10px 20px', background: cc.neutralBg,
          borderTop: `1px solid ${cc.border}`, display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => setReviewDrawerOpen(false)}
            style={{
              padding: '6px 14px', borderRadius: cc.radiusMd,
              border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
              fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* ── MODAL: Auto-Match Results ─────────────────────── */}
      <Modal
        title={null} open={autoMatchModalOpen}
        onCancel={() => setAutoMatchModalOpen(false)} footer={null}
        width={620} centered
        styles={{ body: { padding: 0 }, mask: { backdropFilter: 'blur(2px)' } }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${cc.purple}, #6D28D9)`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Sparkles size={20} color="#fff" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Auto-Match Results</div>
            {autoMatchResult && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                {autoMatchResult.matchedCount} matched &middot; {autoMatchResult.skippedCount} skipped &middot; {autoMatchResult.durationMs}ms
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '16px 20px', background: cc.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', maxHeight: 460, overflowY: 'auto' }}>
          {autoMatchResult && autoMatchResult.details.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                Matched ({autoMatchResult.details.length})
              </div>
              {autoMatchResult.details.map((d) => (
                <div key={d.applicationId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: cc.radiusMd,
                  background: cc.neutralBg, border: `1px solid ${cc.border}`,
                  marginBottom: 6,
                }}>
                  <Avatar initials={d.studentName.substring(0, 2).toUpperCase()} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                      {d.studentName} <span style={{ color: cc.textMuted, fontWeight: 500 }}>· {d.studentCode}</span>
                    </div>
                    <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                      {d.reason} &middot; score <strong style={{ color: cc.brand }}>{d.score.toFixed(1)}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: cc.textSecondary, fontFamily: 'Inter, sans-serif', textAlign: 'right' }}>
                    → {d.enterpriseName}
                  </span>
                  <StatusBadge status="PENDING_APPROVAL" />
                </div>
              ))}
            </>
          )}

          {autoMatchResult && autoMatchResult.skipped.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 14, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                Skipped ({autoMatchResult.skipped.length})
              </div>
              {autoMatchResult.skipped.map((s) => (
                <div key={s.studentId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 12px', borderRadius: cc.radiusMd,
                  background: cc.neutralBg, border: `1px solid ${cc.borderSubtle}`,
                  marginBottom: 4,
                }}>
                  <Avatar initials={s.studentName.substring(0, 2).toUpperCase()} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                      {s.studentName}
                    </div>
                    <div style={{ fontSize: 10.5, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                      {s.reason}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {autoMatchResult && autoMatchResult.details.length === 0 && autoMatchResult.skipped.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: cc.textMuted, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}>
              No eligible students to match.
            </div>
          )}
        </div>
        <div style={{
          padding: '10px 20px', background: cc.neutralBg,
          borderTop: `1px solid ${cc.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 11, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>
            Approve from <strong>Self-Placements</strong> inbox
          </div>
          <button
            onClick={() => setAutoMatchModalOpen(false)}
            style={{
              padding: '6px 14px', borderRadius: cc.radiusMd,
              border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
              fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* ── CONTRACT DETAILS MODAL (Issue #156 fix) ───────── */}
      <Modal
        open={contractModalOpen}
        onCancel={() => { setContractModalOpen(false); setContractData(null); }}
        footer={null}
        width={520}
        title={
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: cc.textPrimary }}>
            OJT Assignment Details
          </div>
        }
        styles={{ body: { padding: '20px 24px 24px', fontFamily: 'Inter, sans-serif' } }}
      >
        {contractLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="default" />
          </div>
        ) : contractData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Student */}
            <div style={{ background: cc.neutralBg, borderRadius: cc.radiusMd, padding: '12px 16px', border: `1px solid ${cc.border}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Student</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>{contractData.studentName}</div>
              <div style={{ fontSize: 11.5, color: cc.textSecondary, marginTop: 2 }}>{contractData.studentCode} · {contractData.major}</div>
              {contractData.studentEmail && (
                <div style={{ fontSize: 11.5, color: cc.textSecondary, marginTop: 1 }}>{contractData.studentEmail}</div>
              )}
            </div>

            {/* Enterprise & Semester */}
            <div style={{ background: cc.neutralBg, borderRadius: cc.radiusMd, padding: '12px 16px', border: `1px solid ${cc.border}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Enterprise & Semester</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>{contractData.enterpriseName}</div>
              <div style={{ fontSize: 11.5, color: cc.textSecondary, marginTop: 2 }}>Semester: {contractData.semesterCode}</div>
            </div>

            {/* Internship Period */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: cc.neutralBg, borderRadius: cc.radiusMd, padding: '12px 16px', border: `1px solid ${cc.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Start Date</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>
                  {contractData.startDate ? new Date(contractData.startDate).toLocaleDateString('en-GB') : '—'}
                </div>
              </div>
              <div style={{ background: cc.neutralBg, borderRadius: cc.radiusMd, padding: '12px 16px', border: `1px solid ${cc.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>End Date</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>
                  {contractData.endDate ? new Date(contractData.endDate).toLocaleDateString('en-GB') : '—'}
                </div>
              </div>
            </div>

            {/* Supervisor */}
            {(contractData.supervisorName || contractData.supervisorEmail || contractData.supervisorPhone) && (
              <div style={{ background: cc.neutralBg, borderRadius: cc.radiusMd, padding: '12px 16px', border: `1px solid ${cc.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Supervisor</div>
                {contractData.supervisorName && (
                  <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>{contractData.supervisorName}</div>
                )}
                {contractData.supervisorEmail && (
                  <div style={{ fontSize: 11.5, color: cc.textSecondary, marginTop: 2 }}>{contractData.supervisorEmail}</div>
                )}
                {contractData.supervisorPhone && (
                  <div style={{ fontSize: 11.5, color: cc.textSecondary, marginTop: 1 }}>{contractData.supervisorPhone}</div>
                )}
              </div>
            )}

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11.5, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>Assignment Status:</div>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 9px', borderRadius: 6,
                backgroundColor: contractData.status === 'ACTIVE' ? hexToRgba(cc.success, 0.08) : hexToRgba(cc.neutral, 0.08),
                border: `1px solid ${contractData.status === 'ACTIVE' ? hexToRgba(cc.success, 0.3) : hexToRgba(cc.neutral, 0.3)}`,
                color: contractData.status === 'ACTIVE' ? cc.success : cc.neutral,
                fontSize: 11, fontWeight: 700,
              }}>
                {contractData.status}
              </span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default OJTTab;
