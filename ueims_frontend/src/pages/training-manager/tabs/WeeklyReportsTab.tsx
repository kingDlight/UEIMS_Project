import React, { useState, useCallback, forwardRef } from 'react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { Modal, Spin, Input, App, Button } from 'antd';

import {
  Clock,
  FileText,
  Filter,
  Calendar,
  Building2,
  Eye,
  AlertCircle,
  AlertOctagon,
  CheckSquare,
  CheckCircle2,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { st } from './StatsTab';
import { WeeklyReportService } from '@/services/WeeklyReportService';

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
// Backend can return any of: NOT_SUBMITTED, DRAFT, SUBMITTED, APPROVED, REJECTED.
// We surface a small set in the UI; anything else falls back to "Pending".
// ============================================================
export type WeeklyReportStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING';

export interface WeeklyReport {
  id: string;
  studentName: string;
  studentCode: string;
  enterprise: string;
  weekNumber: number;
  weekLabel: string;
  status: WeeklyReportStatus;
  submittedAt: string;
  hoursLogged: number | null;
  summary: string;
  plagiarismScore: number | null;     // FIX 006-B: BR-58
  isAnomaly: boolean;                 // FIX 006-B: BR-58
  lateOverriddenBy: string | null;    // FIX 006-C: BR-56
}

const ALL_WEEKS = [
  'Week 1',
  'Week 2',
  'Week 3',
  'Week 4',
  'Week 5',
  'Week 6',
  'Week 7',
  'Week 8',
  'Week 9',
  'Week 10',
];

const STATUS_CONFIG: Record<WeeklyReportStatus, {
  color: string;
  bg: string;
  borderColor: string;
  icon: React.ReactNode;
  label: string;
}> = {
  SUBMITTED: {
    color: st.warning,
    bg: hexToRgba(st.warning, 0.06),
    borderColor: hexToRgba(st.warning, 0.20),
    icon: <Clock size={12} strokeWidth={2.5} />,
    label: 'Submitted',
  },
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
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
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
  index: number;
  onViewDetail: (id: string) => void;
}

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>((
  { report, index, onViewDetail },
  ref,
) => {
  const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.PENDING;

  return (
    <div
      ref={ref}
      className="bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:shadow-md hover:border-slate-300 flex flex-col cursor-pointer"
      onClick={() => onViewDetail(report.id)}
    >
      {/* Top: Student + Status */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <div style={{ minWidth: 0 }}>
          <div className="text-sm font-bold text-slate-900 leading-tight mb-0.5 truncate">
            {report.studentName} <span className="text-slate-400 font-normal text-xs ml-1"># {report.studentCode}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
            <span className="flex items-center gap-1"><Building2 size={12} className="text-slate-400" /> {report.enterprise}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {report.weekLabel}</span>
            {/* FIX 006-B: anomaly badge */}
            {report.isAnomaly && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '1px 6px', borderRadius: 999,
                background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5',
                fontSize: 10, fontWeight: 700,
              }} title={`Plagiarism score: ${(report.plagiarismScore ?? 0).toFixed(2)}`}>
                <AlertOctagon size={10} strokeWidth={2.5} />
                ANOMALY
              </span>
            )}
            {/* FIX 006-C: late override badge */}
            {report.lateOverriddenBy && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '1px 6px', borderRadius: 999,
                background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD',
                fontSize: 10, fontWeight: 700,
              }} title="TM override for late submission">
                <ShieldCheck size={10} strokeWidth={2.5} />
                LATE OVERRIDE
              </span>
            )}
          </div>
        </div>
        <span style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.borderColor}` }} className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0">
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Middle: snippet */}
      <div className="text-[13px] text-slate-600 mb-4 flex-1 line-clamp-2 leading-relaxed">
        {report.summary || 'No summary available for this report.'}
      </div>

      {/* Bottom: Date + View detail */}
      <div className="flex justify-between items-end mt-auto pt-3 border-t border-slate-100">
        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
          <Clock size={12} />
          {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not submitted'}
        </div>
        <span className="text-[11px] font-bold text-[#E67E22] flex items-center gap-1 group-hover:underline">
          View detail <Eye size={12} />
        </span>
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
  counts: { submitted: number; approved: number; rejected: number; anomaly: number };
  onlyAnomaly: boolean;
  onToggleAnomaly: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedWeek, onWeekChange, checkedStatuses, onStatusToggle, counts,
  onlyAnomaly, onToggleAnomaly,
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
          {selectedWeek && (
            <button
              onClick={() => onWeekChange('')}
              style={{
                marginLeft: 'auto',
                padding: '2px 8px',
                borderRadius: 999,
                border: `1px solid ${st.border}`,
                background: st.neutralBg,
                color: st.textSecondary,
                fontSize: 9.5,
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: '0.02em',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
              title="Clear week filter"
            >
              Clear
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALL_WEEKS.map((w, idx) => {
            const weekNum = idx + 1;
            const isSelected = selectedWeek === String(weekNum);
            return (
              <button
                key={w}
                onClick={() => onWeekChange(isSelected ? '' : String(weekNum))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: st.radiusMd,
                  border: isSelected ? `1px solid #BFDBFE` : `1px solid transparent`,
                  background: isSelected ? '#EFF6FF' : 'transparent',
                  color: isSelected ? '#1D4ED8' : st.textSecondary,
                  fontSize: 11.5,
                  fontWeight: isSelected ? 700 : 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Custom radio indicator (matching Anomaly chip style) */}
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `1.5px solid ${isSelected ? '#1D4ED8' : st.border}`,
                  background: isSelected ? '#1D4ED8' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}>
                  {isSelected && (
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#fff',
                    }} />
                  )}
                </div>
                <span style={{ flex: 1 }}>{w}</span>
                {isSelected && (
                  <CheckCircle2 size={12} strokeWidth={2.5} style={{ color: '#1D4ED8' }} />
                )}
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
            { value: 'SUBMITTED', label: 'Submitted', count: counts.submitted, cfg: STATUS_CONFIG.SUBMITTED },
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

      {/* FIX 006-B: Anomaly quick filter (BR-58 plagiarism) */}
      <div style={{ padding: '14px 14px', borderTop: `1px solid ${st.borderSubtle}` }}>
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
          <AlertOctagon size={11} strokeWidth={2.5} />
          Suspicious
        </div>
        <button
          onClick={onToggleAnomaly}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            textAlign: 'left',
            padding: '7px 10px',
            borderRadius: st.radiusMd,
            border: onlyAnomaly ? `1px solid #FCA5A5` : `1px solid transparent`,
            background: onlyAnomaly ? '#FEE2E2' : 'transparent',
            color: onlyAnomaly ? '#B91C1C' : st.textSecondary,
            fontSize: 11.5,
            fontWeight: onlyAnomaly ? 700 : 500,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            border: `1.5px solid ${onlyAnomaly ? '#B91C1C' : st.border}`,
            background: onlyAnomaly ? '#B91C1C' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}>
            {onlyAnomaly && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ flex: 1 }}>Anomaly only</span>
          <span style={{
            fontSize: 10.5,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'Inter, sans-serif',
            color: counts.anomaly > 0 ? '#B91C1C' : st.textMuted,
          }}>
            {counts.anomaly}
          </span>
        </button>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const WeeklyReportsTab: React.FC = () => {
  const { message } = App.useApp();
  useScrollAnimation();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Normalize any backend status into one of our 4 UI buckets.
  // Anything that isn't APPROVED/REJECTED is treated as "submitted/pending".
  const normalizeStatus = (raw: string | undefined): WeeklyReportStatus => {
    switch (raw) {
      case 'APPROVED': return 'APPROVED';
      case 'REJECTED': return 'REJECTED';
      case 'SUBMITTED': return 'SUBMITTED';
      default: return 'PENDING';
    }
  };

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await WeeklyReportService.getAllReports();
        const mapped = (Array.isArray(data) ? data : []).map((r: any) => ({
          id: r.reportId,
          studentName: r.studentName || 'Unknown Student',
          studentCode: r.studentCode || 'N/A',
          enterprise: r.enterpriseName || 'Unknown Enterprise',
          weekNumber: r.weekNumber,
          weekLabel: `Week ${r.weekNumber}`,
          status: normalizeStatus(r.status),
          submittedAt: r.submittedAt || null,
          hoursLogged: r.hoursLogged ?? null,
          summary: r.tasksCompleted || 'No summary provided',
          plagiarismScore: r.plagiarismScore ?? null,
          isAnomaly: Boolean(r.isAnomaly),
          lateOverriddenBy: r.lateOverrideBy ?? null,
        }));
        setReports(mapped);
        setErrorMsg(null);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? 'Failed to load weekly reports.';
        setErrorMsg(msg);
        void message.error({ content: msg, duration: 4 });
      } finally {
        setLoading(false);
      }
    };
    void fetchReports();
  }, [message]);

  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [checkedStatuses, setCheckedStatuses] = useState<Set<string>>(new Set(['SUBMITTED']));
  const [onlyAnomaly, setOnlyAnomaly] = useState<boolean>(false);

  // Filter by week number (parsed from selectedWeek) + status set + anomaly toggle.
  const filteredReports = reports.filter((r) => {
    const selectedWeekNum = selectedWeek ? Number(selectedWeek) : null;
    const matchWeek = selectedWeekNum == null || r.weekNumber === selectedWeekNum;
    const matchStatus = checkedStatuses.size === 0 || checkedStatuses.has(r.status);
    const matchAnomaly = !onlyAnomaly || r.isAnomaly;
    return matchWeek && matchStatus && matchAnomaly;
  });

  // Counts for sidebar — count actual UI-normalized buckets.
  const counts = {
    submitted: reports.filter((r) => r.status === 'SUBMITTED').length,
    approved: reports.filter((r) => r.status === 'APPROVED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
    anomaly: reports.filter((r) => r.isAnomaly).length,
  };

  // Toggle status filter checkbox
  const toggleStatus = useCallback((s: string) => {
    setCheckedStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }, []);

  // Training Manager is read-only here (UC-33 final grading review,
  // UC-32 incident evidence, monitor). Clicking a card opens the detail
  // modal which is the single affordance.
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  const handleOverrideLate = useCallback(async () => {
    if (!detailId || !overrideReason.trim()) {
      void message.warning('Please provide a reason for the override.');
      return;
    }
    setOverrideLoading(true);
    try {
      await WeeklyReportService.overrideLateSubmission(detailId, overrideReason.trim());
      void message.success('Late submission overridden.');
      // Refresh detail
      const fresh = await WeeklyReportService.getReportById(detailId);
      setDetailData(fresh);
      setOverrideReason('');
      // Refresh list so badge appears
      const data = await WeeklyReportService.getAllReports();
      const mapped = (Array.isArray(data) ? data : []).map((r: any) => ({
        id: r.reportId,
        studentName: r.studentName || 'Unknown Student',
        studentCode: r.studentCode || 'N/A',
        enterprise: r.enterpriseName || 'Unknown Enterprise',
        weekNumber: r.weekNumber,
        weekLabel: `Week ${r.weekNumber}`,
        status: normalizeStatus(r.status),
        submittedAt: r.submittedAt || null,
        hoursLogged: r.hoursLogged ?? null,
        summary: r.tasksCompleted || 'No summary provided',
        plagiarismScore: r.plagiarismScore ?? null,
        isAnomaly: Boolean(r.isAnomaly),
        lateOverriddenBy: r.lateOverrideBy ?? null,
      }));
      setReports(mapped);
    } catch (err: any) {
      void message.error(err?.response?.data?.message ?? 'Failed to override late submission.');
    } finally {
      setOverrideLoading(false);
    }
  }, [detailId, overrideReason, message]);

  const openDetail = useCallback(async (id: string) => {
    setDetailId(id);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);
    try {
      const data = await WeeklyReportService.getReportById(id);
      setDetailData(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to load report detail.';
      setDetailError(msg);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailId(null);
    setDetailData(null);
    setDetailError(null);
  }, []);

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
            onlyAnomaly={onlyAnomaly}
            onToggleAnomaly={() => setOnlyAnomaly((v) => !v)}
          />
        </div>

        {/* RIGHT: Report List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Simple counter */}
          <div style={{
            marginBottom: 12,
            padding: '0 2px',
            fontSize: 13,
            fontWeight: 700,
            color: st.textPrimary,
            fontFamily: 'Inter, sans-serif',
          }}>
            {filteredReports.length} Report{filteredReports.length !== 1 ? 's' : ''}
          </div>

          {/* Scrollable Card List */}
          {filteredReports.length === 0 ? (
            <div
              key="empty"
              className="scroll-animate"
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
                minHeight: 320,
              }}
            >
              <FileText size={40} strokeWidth={1.5} style={{ color: st.border }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: st.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                No reports found
              </div>
              <div style={{ fontSize: 12.5, color: st.textMuted, fontFamily: 'Inter, sans-serif', textAlign: 'center', maxWidth: 320 }}>
                Try adjusting the week, status, or anomaly filters in the sidebar.
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-10"
              style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 4, paddingBottom: 20 }}
            >
              {filteredReports.map((report, i) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  index={i}
                  onViewDetail={openDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal (read-only, TM context: UC-33 / UC-32 / monitor) */}
      <Modal
        open={!!detailId}
        onCancel={closeDetail}
        footer={null}
        width={720}
        centered
        title={
          detailData ? (
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: st.textPrimary }}>
                {detailData.studentName ?? 'Student'} — Week {detailData.weekNumber}
              </div>
              <div style={{ fontSize: 12, color: st.textMuted, marginTop: 2 }}>
                {detailData.enterpriseName ?? ''}
              </div>
            </div>
          ) : null
        }
      >
        {detailLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : detailError ? (
          <div style={{ padding: '20px 0', color: st.error, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
            {detailError}
          </div>
        ) : detailData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'Inter, sans-serif' }}>
            {/* FIX 006-B/C: Plagiarism + Late Override badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {detailData.plagiarismScore != null && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  background: detailData.isAnomaly ? '#FEE2E2' : st.neutralBg,
                  color: detailData.isAnomaly ? '#B91C1C' : st.textSecondary,
                  border: `1px solid ${detailData.isAnomaly ? '#FCA5A5' : st.border}`,
                  fontSize: 11, fontWeight: 700,
                }}>
                  <AlertOctagon size={11} strokeWidth={2.5} />
                  Plagiarism score: {Number(detailData.plagiarismScore).toFixed(2)}
                  {detailData.isAnomaly && ' · ANOMALY'}
                </span>
              )}
              {detailData.lateOverrideBy && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  background: '#DBEAFE', color: '#1D4ED8',
                  border: '1px solid #93C5FD',
                  fontSize: 11, fontWeight: 700,
                }}>
                  <ShieldCheck size={11} strokeWidth={2.5} />
                  Late submission overridden by TM
                </span>
              )}
            </div>

            <DetailSection label="Tasks Completed" value={detailData.tasksCompleted} />
            <DetailSection label="Issues / Challenges" value={detailData.issuesChallenges} />
            <DetailSection label="Lessons Learned" value={detailData.lessonsLearned} />
            <DetailSection label="Plan for Next Week" value={detailData.planNextWeek} />
            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: st.textSecondary, borderTop: `1px solid ${st.border}`, paddingTop: 12, flexWrap: 'wrap' }}>
              <span>
                <strong>Status:</strong>{' '}
                {STATUS_CONFIG[detailData.status as WeeklyReportStatus]?.label
                  ?? detailData.status
                  ?? 'N/A'}
              </span>
              {detailData.hoursLogged != null && (
                <span><strong>Hours logged:</strong> {detailData.hoursLogged}h</span>
              )}
              {detailData.submittedAt && (
                <span>
                  <strong>Submitted:</strong>{' '}
                  {new Date(detailData.submittedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              )}
            </div>
            {detailData.feedback && (
              <div style={{ padding: '10px 12px', background: st.neutralBg, borderRadius: 8, fontSize: 12.5, color: st.textSecondary }}>
                <strong>Enterprise feedback:</strong> {detailData.feedback}
              </div>
            )}

            {/* FIX 006-C: TM Override Late action */}
            {!detailData.lateOverrideBy && (
              <div style={{ borderTop: `1px solid ${st.border}`, paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Training Manager Actions
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Input.TextArea
                    placeholder="Reason for override (e.g. 'Server outage 03/15 — approved grace period')"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    rows={2}
                    style={{ flex: 1, minWidth: 240 }}
                    maxLength={300}
                  />
                  <Button
                    type="primary"
                    icon={<ShieldCheck size={14} />}
                    loading={overrideLoading}
                    disabled={!overrideReason.trim()}
                    onClick={handleOverrideLate}
                    style={{ background: '#1D4ED8', borderColor: '#1D4ED8' }}
                  >
                    Override Late
                  </Button>
                </div>
                <div style={{ fontSize: 11, color: st.textMuted, marginTop: 6 }}>
                  Mark this report as accepted despite being past the deadline (BR-56).
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

const DetailSection: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <div style={{
      fontSize: 10.5,
      fontWeight: 700,
      color: st.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 6,
      fontFamily: 'Inter, sans-serif',
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 13,
      color: st.textPrimary,
      lineHeight: 1.6,
      padding: '10px 12px',
      background: st.neutralBg,
      borderRadius: 8,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily: 'Inter, sans-serif',
    }}>
      {value && value.trim() ? value : <em style={{ color: st.textMuted }}>Not provided</em>}
    </div>
  </div>
);

export default WeeklyReportsTab;
