import React, { useState, useCallback, forwardRef } from 'react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { message, Checkbox } from 'antd';

import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Filter,
  Calendar,
  Building2,
  Hash,
} from 'lucide-react';
import { st } from './StatsTab';

// ============================================================
// COLOR UTILITY — hex-to-rgba for ghost style rendering
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
export interface WeeklyReport {
  id: string;
  studentName: string;
  studentCode: string;
  enterprise: string;
  weekNumber: number;
  weekLabel: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  hoursLogged: number;
  summary: string;
}

// ============================================================
// MOCK DATA — 6 realistic reports (4 pending, 1 approved, 1 rejected)
// ============================================================
const MOCK_WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: 'wr-001',
    studentName: 'Nguyen Van A',
    studentCode: 'SE161234',
    enterprise: 'FPT Software',
    weekNumber: 1,
    weekLabel: 'Week 1 — Jun 2–8, 2026',
    status: 'PENDING',
    submittedAt: '2026-06-08T17:30:00',
    hoursLogged: 40,
    summary: 'Completed onboarding modules, set up local development environment, and attended daily standup meetings. Shadowed senior developer on REST API integration tasks and submitted first PR.',
  },
  {
    id: 'wr-002',
    studentName: 'Tran Thi B',
    studentCode: 'IA162345',
    enterprise: 'VinBigData',
    weekNumber: 1,
    weekLabel: 'Week 1 — Jun 2–8, 2026',
    status: 'PENDING',
    submittedAt: '2026-06-08T18:15:00',
    hoursLogged: 38,
    summary: 'Worked on data pipeline scripts using Python and Apache Spark. Participated in sprint planning and completed first data quality check assignment with validation report.',
  },
  {
    id: 'wr-003',
    studentName: 'Le Van C',
    studentCode: 'SE163456',
    enterprise: 'NashTech VN',
    weekNumber: 2,
    weekLabel: 'Week 2 — Jun 9–15, 2026',
    status: 'PENDING',
    submittedAt: '2026-06-15T16:00:00',
    hoursLogged: 42,
    summary: 'Assisted with network security audit tasks. Documented firewall rule configurations and participated in a vulnerability assessment workshop with the security team.',
  },
  {
    id: 'wr-004',
    studentName: 'Pham Thi D',
    studentCode: 'GD162111',
    enterprise: 'VNG Corporation',
    weekNumber: 2,
    weekLabel: 'Week 2 — Jun 9–15, 2026',
    status: 'PENDING',
    submittedAt: '2026-06-15T14:30:00',
    hoursLogged: 36,
    summary: 'Designed marketing assets for the product launch campaign. Created 5 social media banners, 2 illustrated infographics, and contributed to UI mockups for the mobile app redesign.',
  },
  {
    id: 'wr-005',
    studentName: 'Hoang Van E',
    studentCode: 'AI162789',
    enterprise: 'Viettel AI',
    weekNumber: 3,
    weekLabel: 'Week 3 — Jun 16–22, 2026',
    status: 'APPROVED',
    submittedAt: '2026-06-22T19:00:00',
    hoursLogged: 44,
    summary: 'Completed ML model training pipeline using PyTorch. Documented training logs, evaluated model performance metrics, and prepared a summary slide deck for the weekly review meeting.',
  },
  {
    id: 'wr-006',
    studentName: 'Dao Thi F',
    studentCode: 'CS162333',
    enterprise: 'FPT Software',
    weekNumber: 3,
    weekLabel: 'Week 3 — Jun 16–22, 2026',
    status: 'REJECTED',
    submittedAt: '2026-06-22T17:45:00',
    hoursLogged: 40,
    summary: 'Worked on microservices refactoring using Node.js and Docker. Report was rejected — missing Docker compose configuration files and unclear description of the architecture changes.',
  },
];

const ALL_WEEKS = [
  'Week 1 — Jun 2–8, 2026',
  'Week 2 — Jun 9–15, 2026',
  'Week 3 — Jun 16–22, 2026',
  'Week 4 — Jun 23–29, 2026',
  'Week 5 — Jun 30–Jul 6, 2026',
  'Week 6 — Jul 7–13, 2026',
  'Week 7 — Jul 14–20, 2026',
  'Week 8 — Jul 21–27, 2026',
  'Week 9 — Jul 28–Aug 3, 2026',
  'Week 10 — Aug 4–10, 2026',
];

const STATUS_CONFIG = {
  PENDING: {
    color: st.warning,
    bg: hexToRgba(st.warning, 0.06),
    borderColor: hexToRgba(st.warning, 0.20),
    icon: <Clock size={12} strokeWidth={2.5} />,
    label: 'Pending',
  },
  APPROVED: {
    color: st.success,
    bg: hexToRgba(st.success, 0.06),
    borderColor: hexToRgba(st.success, 0.20),
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    label: 'Approved',
  },
  REJECTED: {
    color: st.error,
    bg: hexToRgba(st.error, 0.06),
    borderColor: hexToRgba(st.error, 0.20),
    icon: <AlertCircle size={12} strokeWidth={2.5} />,
    label: 'Rejected',
  },
};

// ============================================================
// STATUS BADGE
// ============================================================
const StatusBadge: React.FC<{ status: WeeklyReport['status'] }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 9px',
      borderRadius: st.radiusFull,
      background: cfg.bg,
      color: cfg.color,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.02em',
      fontFamily: 'Inter, sans-serif',
    }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ============================================================
// REPORT CARD — forwardRef required for AnimatePresence
// ============================================================
interface ReportCardProps {
  report: WeeklyReport;
  checked: boolean;
  onToggle: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  index: number;
}

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>((
  { report, checked, onToggle, onApprove, onReject, index },
  ref,
) => {
  const [hovered, setHovered] = useState(false);
  const isPending = report.status === 'PENDING';

  return (
    <div
      ref={ref}
     
     
     
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? st.border : st.borderSubtle}`,
        borderRadius: st.radiusXl,
        boxShadow: hovered ? st.shadowMd : st.shadowSm,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        overflow: 'hidden',
      }}
     className="scroll-animate">
      <div className="report-card-inner">
        {/* Left: Checkbox */}
        <div className="rc-checkbox" style={{ background: checked ? st.successMuted : 'transparent' }}>
          <Checkbox checked={checked} onChange={() => onToggle(report.id)} />
        </div>

        {/* Middle: Card Content */}
        <div className="rc-content">
          {/* Card Header */}
          <div className="rc-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', marginBottom: 3, maxWidth: '100%', minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: st.textPrimary, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {report.studentName}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: st.textMuted, fontFamily: 'Inter, sans-serif' }}>
                  <Hash size={10} strokeWidth={2.5} />
                  {report.studentCode}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: st.textSecondary, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  <Building2 size={11} strokeWidth={2} color={st.brand} />
                  {report.enterprise}
                </span>
                <span style={{ fontSize: 11, color: st.border }}>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: st.textMuted, fontFamily: 'Inter, sans-serif' }}>
                  <Calendar size={11} strokeWidth={2} />
                  {report.weekLabel}
                </span>
                <span style={{ fontSize: 11, color: st.border }}>·</span>
                <span style={{ fontSize: 11, color: st.textMuted, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
                  {report.hoursLogged}h logged
                </span>
              </div>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Card Body — Report Snippet */}
          <p style={{
            fontSize: 12.5,
            color: st.textSecondary,
            margin: '0 0 10px',
            lineHeight: 1.55,
            fontFamily: 'Inter, sans-serif',
          }}>
            {report.summary}
          </p>

          {/* Card Footer — Timestamp */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10.5,
            color: st.textMuted,
            fontFamily: 'Inter, sans-serif',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <FileText size={10} strokeWidth={2} />
            Submitted {new Date(report.submittedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })} at {new Date(report.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Right: Action Buttons */}
        {isPending && (
          <div className="rc-actions">
            <button
              aria-label={"Approve report for " + report.studentName}
              onClick={() => onApprove(report.id)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: st.radiusMd,
                border: 'none',
                background: st.success,
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = st.success;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(16,185,129,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = st.success;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(16,185,129,0.25)';
              }}
            >
              <CheckCircle2 size={12} strokeWidth={2.5} />
              Approve
            </button>
            <button
              aria-label={"Reject report for " + report.studentName}
              onClick={() => onReject(report.id)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: st.radiusMd,
                border: `1px solid ${st.error}`,
                background: 'transparent',
                color: st.error,
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = st.error;
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = st.error;
              }}
              disabled={report.status !== 'PENDING'}
            >
              <AlertCircle size={12} strokeWidth={2.5} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================
// FILTER SIDEBAR
// ============================================================
interface FilterSidebarProps {
  selectedWeek: string;
  onWeekChange: (w: string) => void;
  checkedStatuses: Set<string>;
  onStatusToggle: (s: string) => void;
  counts: { pending: number; approved: number; rejected: number };
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedWeek, onWeekChange, checkedStatuses, onStatusToggle, counts,
}) => {
  return (
    <div style={{
      background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${st.border}`,
      borderRadius: st.radiusXl,
      boxShadow: st.shadowSm,
      overflow: 'hidden',
      alignSelf: 'flex-start',
      position: 'sticky',
      top: 0,
    }}>
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        borderBottom: `1px solid ${st.borderSubtle}`,
        background: st.neutralBg,
      }}>
        <Filter size={14} color={st.textSecondary} strokeWidth={2} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: st.textPrimary, fontFamily: 'Inter, sans-serif' }}>
          Filters
        </span>
      </div>

      {/* Week Filter — 10 selectable pills */}
      <div style={{ padding: '14px 14px', borderBottom: `1px solid ${st.borderSubtle}` }}>
        <div style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: st.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 10,
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <Calendar size={11} strokeWidth={2.5} />
          Week
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALL_WEEKS.map((w) => {
            const isSelected = selectedWeek === w;
            return (
              <button
                key={w}
                onClick={() => onWeekChange(isSelected ? '' : w)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: st.radiusMd,
                  border: 'none',
                  background: isSelected ? st.brandSubtle : 'transparent',
                  color: isSelected ? st.brand : st.textSecondary,
                  fontSize: 11.5,
                  fontWeight: isSelected ? 700 : 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {w}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter — Checkboxes (Pending checked by default) */}
      <div style={{ padding: '14px 14px' }}>
        <div style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: st.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 10,
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <CheckSquare size={11} strokeWidth={2.5} />
          Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {([
            { value: 'PENDING', label: 'Pending', count: counts.pending, cfg: STATUS_CONFIG.PENDING },
            { value: 'APPROVED', label: 'Approved', count: counts.approved, cfg: STATUS_CONFIG.APPROVED },
            { value: 'REJECTED', label: 'Rejected', count: counts.rejected, cfg: STATUS_CONFIG.REJECTED },
          ] as const).map(({ value, label, count, cfg }) => {
            const isChecked = checkedStatuses.has(value);
            return (
              <button
                key={value}
                onClick={() => onStatusToggle(value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: st.radiusMd,
                  border: isChecked ? `1px solid ${cfg.color}40` : `1px solid transparent`,
                  background: isChecked ? cfg.bg : 'transparent',
                  color: isChecked ? cfg.color : st.textSecondary,
                  fontSize: 11.5,
                  fontWeight: isChecked ? 700 : 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Custom checkbox indicator */}
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: `1.5px solid ${isChecked ? cfg.color : st.border}`,
                  background: isChecked ? cfg.color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}>
                  {isChecked && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                <span style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const WeeklyReportsTab: React.FC = () => {
  useScrollAnimation();

  const [reports, setReports] = useState<WeeklyReport[]>(MOCK_WEEKLY_REPORTS);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [checkedStatuses, setCheckedStatuses] = useState<Set<string>>(new Set(['PENDING']));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  // Derived filtered data
  const filteredReports = reports.filter((r) => {
    const matchWeek = !selectedWeek || r.weekLabel === selectedWeek;
    const matchStatus = checkedStatuses.size === 0 || checkedStatuses.has(r.status);
    return matchWeek && matchStatus;
  });

  // Counts for sidebar
  const counts = {
    pending: reports.filter((r) => r.status === 'PENDING').length,
    approved: reports.filter((r) => r.status === 'APPROVED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
  };

  // Toggle individual row checkbox
  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Toggle select-all
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReports.map((r) => r.id)));
    }
  }, [selectedIds, filteredReports]);

  // Toggle status filter checkbox
  const toggleStatus = useCallback((s: string) => {
    setCheckedStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }, []);

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Single approve
  const handleApprove = useCallback(async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    await new Promise((r) => setTimeout(r, 400)); // Simulate API delay
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'APPROVED' as const } : r));
    void message.success({ content: 'Report approved.', key: id, duration: 2 });
    setProcessingId(null);
  }, [processingId]);

  // Single reject
  const handleReject = useCallback(async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    await new Promise((r) => setTimeout(r, 400)); // Simulate API delay
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'REJECTED' as const } : r));
    void message.warning({ content: 'Report rejected.', key: id, duration: 2 });
    setProcessingId(null);
  }, [processingId]);

  // Batch approve
  const handleBatchApprove = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBatchLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setReports((prev) => prev.map((r) => selectedIds.has(r.id) ? { ...r, status: 'APPROVED' as const } : r));
      setSelectedIds(new Set());
      void message.success({ content: `${selectedIds.size} report(s) approved.`, key: 'batch', duration: 2.5 });
    } catch {
      void message.error({ content: 'Failed to approve reports.', key: 'batch' });
    } finally {
      setBatchLoading(false);
    }
  }, [selectedIds]);

  const batchDisabled = selectedIds.size === 0;
  const allSelected = filteredReports.length > 0 && selectedIds.size === filteredReports.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredReports.length;

  let batchApproveLabel = 'Batch Approve';
  if (batchLoading) {
    batchApproveLabel = 'Approving...';
  } else if (selectedIds.size > 0) {
    batchApproveLabel = 'Batch Approve (' + selectedIds.size + ')';
  }

  return (
    <div className="wr-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .wr-scroll::-webkit-scrollbar { width: 4px; }
        .wr-scroll::-webkit-scrollbar-track { background: transparent; }
        .wr-scroll::-webkit-scrollbar-thumb { background: ${st.border}; border-radius: 99px; }
        .wr-scroll::-webkit-scrollbar-thumb { background: ${st.border}; border-radius: 99px; }
        .wr-scroll::-webkit-scrollbar-thumb:hover { background: ${st.textMuted}; }
        .wr-container {
          padding: 0 24px 40px;
        }
        .wr-layout {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .wr-sidebar {
          width: 220px;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .wr-container {
            padding: 0 12px 100px !important;
          }
          .wr-layout {
            flex-direction: column;
          }
          .wr-sidebar {
            width: 100%;
            position: relative !important; /* disable sticky on mobile */
          }
          .report-card-inner {
            flex-direction: column !important;
          }
          .rc-checkbox {
            border-right: none !important;
            border-bottom: 1px solid ${st.borderSubtle};
            padding: 12px 18px !important;
            justify-content: flex-start !important;
          }
          .rc-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .rc-actions {
            border-left: none !important;
            border-top: 1px solid ${st.borderSubtle};
            flex-direction: row !important;
            padding: 12px 18px !important;
          }
        }
        .report-card-inner {
          display: flex;
          align-items: stretch;
        }
        .rc-checkbox {
          display: flex;
          align-items: center;
          padding: 18px 0 18px 18px;
          border-right: 1px solid ${st.borderSubtle};
          transition: background 0.2s;
          min-width: 50px;
          justify-content: center;
          flex-shrink: 0;
        }
        .rc-content {
          flex: 1;
          padding: 16px 18px;
          min-width: 0;
        }
        .rc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .rc-actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 16px 18px 16px 14px;
          border-left: 1px solid ${st.borderSubtle};
          min-width: 108px;
          flex-shrink: 0;
        }
      `}</style>

      {/* ── Page Header ──────────────────────────────── */}
      <div>
        <h2 style={{
          fontSize: 20,
          fontWeight: 800,
          color: st.textPrimary,
          margin: '0 0 4px',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '-0.01em',
        }}>
          Weekly OJT Reports
        </h2>
        <p style={{ fontSize: 13, color: st.textMuted, margin: 0, fontFamily: 'Inter, sans-serif' }}>
          Review and approve student weekly submissions
        </p>
      </div>

      {/* ── Main Layout: Sidebar + Content ────────────── */}
      <div className="wr-layout">
        {/* LEFT: Filter Sidebar */}
        <div className="wr-sidebar">
          <FilterSidebar
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            checkedStatuses={checkedStatuses}
            onStatusToggle={toggleStatus}
            counts={counts}
          />
        </div>

        {/* RIGHT: Report List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar: Select All + Batch Approve */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            padding: '0 2px',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: st.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                {filteredReports.length} Report{filteredReports.length !== 1 ? 's' : ''}
              </span>
              {selectedIds.size > 0 && (
                <span style={{ fontSize: 12, color: st.textMuted, fontFamily: 'Inter, sans-serif' }}>
                  · {selectedIds.size} selected
                </span>
              )}
            </div>

            {/* Solid Green Batch Approve Button */}
            <button
              disabled={batchDisabled || batchLoading}
              onClick={handleBatchApprove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: st.radiusMd,
                border: batchDisabled ? `1px solid ${st.border}` : 'none',
                background: batchDisabled ? 'transparent' : st.success,
                color: batchDisabled ? st.textMuted : '#fff',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                cursor: batchDisabled ? 'not-allowed' : 'pointer',
                opacity: batchDisabled ? 0.55 : 1,
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                boxShadow: batchDisabled ? 'none' : '0 2px 8px rgba(16,185,129,0.25)',
                pointerEvents: batchDisabled ? 'none' : 'auto',
              }}
              onMouseEnter={(e) => {
                if (!batchDisabled && !batchLoading) {
                  (e.currentTarget as HTMLButtonElement).style.background = st.success;
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(16,185,129,0.35)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = batchDisabled ? 'transparent' : st.success;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = batchDisabled ? 'none' : '0 2px 8px rgba(16,185,129,0.25)';
              }}
            >
              <CheckSquare size={14} strokeWidth={2.5} />
              {batchApproveLabel}
            </button>
          </div>

          {/* Scrollable Card List */}
          <div
            className="wr-scroll"
            style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 580, overflowY: 'auto', paddingRight: 2 }}
          >
            
              {filteredReports.length === 0 ? (
                <div
                  key="empty"
                 
                 
                 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 24px',
                    background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: `1px dashed ${st.border}`,
                    borderRadius: st.radiusXl,
                    gap: 8,
                  }}
                 className="scroll-animate">
                  <FileText size={40} strokeWidth={1.5} style={{ color: st.border }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: st.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                    No reports found
                  </div>
                  <div style={{ fontSize: 12.5, color: st.textMuted, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                    Try adjusting the week or status filters
                  </div>
                </div>
              ) : (
                filteredReports.map((report, i) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    checked={selectedIds.has(report.id)}
                    onToggle={toggleRow}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    index={i}
                  />
                ))
              )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportsTab;
