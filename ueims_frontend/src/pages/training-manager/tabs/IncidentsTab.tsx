import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Input, message } from 'antd';
import {
  AlertOctagon,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  X,
  AlertTriangle,
} from 'lucide-react';
import { IncidentService } from '@/services/IncidentService';
import type { Incident } from '../types';

// ============================================================
// DESIGN TOKENS — aligned with project brand system
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
  shadowMd: '0 4px 6px rgba(0,0,0,.07)',
  shadowLg: '0 10px 15px rgba(0,0,0,.08)',
  shadowBrand: '0 4px 12px rgba(255,122,48,.25)',
  shadowError: '0 4px 12px rgba(239,68,68,.25)',
  shadowSuccess: '0 4px 12px rgba(16,185,129,.25)',
};

// ============================================================
// COLOR UTILITY — hex-to-rgba for ghost style rendering
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// INCIDENT SEVERITY MAPPING (BR-26 aligned) — ghost outline style
// ============================================================
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'RESOLVED';

const SEVERITY_CONFIG: Record<Severity, {
  color: string; bg: string; borderColor: string; label: string;
}> = {
  CRITICAL: {
    color: cc.error,
    bg: hexToRgba(cc.error,  0.06),
    borderColor: hexToRgba(cc.error,  0.25),
    label: 'CRITICAL',
  },
  HIGH: {
    color: cc.warning,
    bg: hexToRgba(cc.warning, 0.06),
    borderColor: hexToRgba(cc.warning, 0.25),
    label: 'HIGH',
  },
  MEDIUM: {
    color: cc.info,
    bg: hexToRgba(cc.info,    0.06),
    borderColor: hexToRgba(cc.info,    0.25),
    label: 'MEDIUM',
  },
  LOW: {
    color: cc.textMuted,
    bg: hexToRgba(cc.textMuted, 0.06),
    borderColor: hexToRgba(cc.textMuted, 0.25),
    label: 'LOW',
  },
  RESOLVED: {
    color: cc.success,
    bg: hexToRgba(cc.success, 0.06),
    borderColor: hexToRgba(cc.success, 0.25),
    label: 'RESOLVED',
  },
};

function deriveSeverity(incident: Incident): Severity {
  if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') return 'RESOLVED';
  const cat = (incident.category || '').toLowerCase();
  if (cat.includes('harassment') || cat.includes('accident') || cat.includes('safety'))
    return 'CRITICAL';
  if (cat.includes('attendance') || cat.includes('absent')) return 'HIGH';
  if (cat.includes('performance') || cat.includes('late')) return 'MEDIUM';
  return 'LOW';
}

// ============================================================
// MOCK DATA — pre-seeded for demo
// ============================================================
const MOCK_INCIDENTS: Incident[] = [
  {
    incidentId: 'INC001',
    category: 'Harassment',
    description:
      'A student reported verbal harassment from a co-worker at the enterprise. Immediate supervisor was notified but no action was taken within 48 hours.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignment: {
      student: { fullName: 'Nguyễn Thị Lan', studentCode: 'CS22001', email: 'lan.nt@student.fpt.edu.vn' },
      enterprise: { companyName: 'FPT Software', address: 'FPT Tower, Hanoi' },
    },
    reportedBy: { fullName: 'TM.Pham Thanh', role: 'Training Manager' },
  },
  {
    incidentId: 'INC002',
    category: 'Attendance Issue',
    description:
      'Student has been absent for 3 consecutive days without any notification to the university or enterprise supervisor. Attendance records confirm 6 absences in the current month.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    assignment: {
      student: { fullName: 'Trần Văn Minh', studentCode: 'SE22003', email: 'minh.tv@student.fpt.edu.vn' },
      enterprise: { companyName: 'Viettel Solutions', address: 'Ho Chi Minh City' },
    },
    reportedBy: { fullName: 'Enterprise HR', role: 'Enterprise Supervisor' },
  },
  {
    incidentId: 'INC003',
    category: 'Performance Warning',
    description:
      'Student submitted deliverables 2 weeks late with quality below enterprise standards. Enterprise supervisor has requested a formal review meeting.',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    assignment: {
      student: { fullName: 'Lê Hoàng Nam', studentCode: 'AI21005', email: 'nam.lh@student.fpt.edu.vn' },
      enterprise: { companyName: 'VinBigData', address: 'Hanoi' },
    },
    reportedBy: { fullName: 'Enterprise Tech Lead', role: 'Enterprise Supervisor' },
    resolutionNote: 'Student has been placed on a performance improvement plan (PIP) with weekly check-ins. Enterprise supervisor agreed to extend internship by 2 weeks to compensate for the delay.',
  },
  {
    incidentId: 'INC004',
    category: 'Safety Incident',
    description:
      'Minor slip-and-fall accident in the enterprise cafeteria. Student sustained no injuries but reported the incident as a safety concern for future prevention.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    assignment: {
      student: { fullName: 'Phạm Thị Hương', studentCode: 'CS21007', email: 'huong.pt@student.fpt.edu.vn' },
      enterprise: { companyName: 'Bosch Vietnam', address: 'Bien Hoa, Dong Nai' },
    },
    reportedBy: { fullName: 'Safety Officer', role: 'Enterprise Safety Officer' },
  },
  {
    incidentId: 'INC005',
    category: 'Dress Code Violation',
    description:
      'Student attended client-facing meeting without proper business attire, resulting in negative feedback from the client.',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    assignment: {
      student: { fullName: 'Bùi Đức Anh', studentCode: 'SE21009', email: 'anh.bd@student.fpt.edu.vn' },
      enterprise: { companyName: 'Grab Vietnam', address: 'Ho Chi Minh City' },
    },
    reportedBy: { fullName: 'Project Manager', role: 'Enterprise Supervisor' },
    resolutionNote: 'Student acknowledged the violation and has since complied with the enterprise dress code policy. No further incidents reported.',
  },
];

// ============================================================
// INCIDENT CARD
// ============================================================
const IncidentCard: React.FC<{
  incident: Incident;
  isSelected: boolean;
  onSelect: (i: Incident) => void;
  index: number;
}> = ({ incident, isSelected, onSelect, index }) => {
  const severity = deriveSeverity(incident);
  const cfg = SEVERITY_CONFIG[severity];
  const isResolved = severity === 'RESOLVED';
  const isCritical = severity === 'CRITICAL';

  const student = incident.assignment?.student;
  const enterprise = incident.assignment?.enterprise;

  return (
    <motion.button
      className="incident-card-btn"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.32, 0.72, 0, 1] }}
      onClick={() => onSelect(incident)}
      style={{
        width: '100%',
        background: isSelected ? cc.brandSubtle : cc.surface,
        border: 'none',
        borderLeft: `4px solid ${cfg.borderColor}`,
        borderRadius: cc.radiusMd,
        padding: '13px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: isSelected ? cc.shadowMd : cc.shadowSm,
        opacity: isResolved ? 0.72 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        outline: isSelected ? `2px solid ${cc.brand}30` : 'none',
        outlineOffset: 1,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: cc.radiusMd,
          background: cfg.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {isCritical ? (
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.12, 0, 0.12] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: cc.radiusMd,
              background: cc.error,
            }}
          />
        ) : null}
        {isResolved ? (
          <CheckCircle2 size={16} color={cfg.color} />
        ) : (
          <ShieldAlert size={16} color={cfg.color} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: isSelected ? cc.brand : cc.textPrimary,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {student?.fullName ?? 'Unknown Student'}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: cfg.color,
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.borderColor}`,
              padding: '2px 7px',
              borderRadius: 6,
              fontFamily: 'Inter, sans-serif',
              flexShrink: 0,
              letterSpacing: '0.04em',
            }}
          >
            {cfg.label}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: cc.textSecondary,
            marginTop: 2,
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {enterprise?.companyName ?? 'Unknown Enterprise'} &middot; {incident.category}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: cc.textMuted,
            marginTop: 2,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {new Date(incident.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Chevron */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            style={{ color: cc.brand, flexShrink: 0 }}
          >
            <ChevronRight size={14} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ============================================================
// RESOLUTION WORKSPACE
// ============================================================
const ResolutionWorkspace: React.FC<{
  incident: Incident;
  onResolve: (id: string, outcome: string, note: string) => Promise<void>;
}> = ({ incident, onResolve }) => {
  const [outcome, setOutcome] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const severity = deriveSeverity(incident);
  const cfg = SEVERITY_CONFIG[severity];
  const isResolved = severity === 'RESOLVED';

  const charCount = resolutionNote.trim().length;
  const isValid = charCount >= 20 && outcome !== '';
  const isInvalid = charCount > 0 && charCount < 20;

  const student = incident.assignment?.student;
  const enterprise = incident.assignment?.enterprise;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onResolve(incident.incidentId, outcome, resolutionNote);
      setOutcome('');
      setResolutionNote('');
    } finally {
      setSubmitting(false);
    }
  };

  if (isResolved) {
    return (
      <div style={{ padding: '24px 20px', fontFamily: 'Inter, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: cc.radiusMd,
            background: cc.successMuted,
            border: `1px solid ${cc.success}30`,
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={16} color={cc.success} />
          <span style={{ fontSize: 13, fontWeight: 600, color: cc.successText }}>
            This incident was resolved on{' '}
            {new Date(incident.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
          Resolution Note
        </div>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: cc.radiusMd,
            background: cc.neutralBg,
            border: `1px solid ${cc.border}`,
            fontSize: 13,
            color: cc.textSecondary,
            lineHeight: 1.6,
          }}
        >
          {incident.resolutionNote ?? 'No resolution note was recorded.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Outcome dropdown */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11.5,
            fontWeight: 700,
            color: cc.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 6,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Outcome
        </label>
        <Select
          value={outcome || undefined}
          onChange={setOutcome}
          placeholder="Select outcome..."
          style={{ width: '100%', fontFamily: 'Inter, sans-serif' }}
          popupMatchSelectWidth
          options={[
            { value: 'WARNING_SENT', label: 'Warning Sent to Student' },
            { value: 'ENTERPRISE_NOTIFIED', label: 'Enterprise Notified' },
            { value: 'ESCALATED', label: 'Escalated to Dean' },
            { value: 'RESOLVED_INFORMALLY', label: 'Resolved Informally' },
            { value: 'NO_FURTHER_ACTION', label: 'No Further Action' },
          ]}
        />
      </div>

      {/* Resolution note textarea */}
      <div style={{ marginBottom: 8 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11.5,
            fontWeight: 700,
            color: cc.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 6,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Resolution Note <span style={{ color: cc.error }}>*</span>
        </label>
        <Input.TextArea
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          rows={5}
          showCount
          maxLength={500}
          placeholder="Describe the incident resolution steps taken and outcome..."
          style={{
            borderRadius: cc.radiusMd,
            borderColor: isInvalid ? cc.error : cc.border,
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>

      {/* BR-26 validation message */}
      <AnimatePresence>
        {isInvalid && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 14,
              padding: '7px 10px',
              borderRadius: cc.radiusMd,
              background: cc.errorMuted,
              border: `1px solid ${cc.error}30`,
            }}
          >
            <AlertTriangle size={12} color={cc.error} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: cc.errorText }}>
              BR-26: {20 - charCount} more characters required before closing.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BR-26 helper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 18,
          padding: '7px 10px',
          borderRadius: cc.radiusMd,
          background: cc.warningMuted,
          border: `1px solid ${cc.warning}25`,
        }}
      >
        <ShieldAlert size={12} color={cc.warning} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: cc.warningText, lineHeight: 1.4 }}>
          <strong>BR-26:</strong> A minimum of 20 characters is required for the resolution note. The incident will be closed and the student notified.
        </span>
      </motion.div>

      {/* Submit button */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: cc.radiusMd,
            border: 'none',
            background: isValid ? cc.error : cc.border,
            color: isValid ? '#fff' : cc.textMuted,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: isValid ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif',
            boxShadow: isValid ? cc.shadowError : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) => {
            if (isValid) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 5px 14px rgba(239,68,68,.40)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = isValid ? cc.shadowError : 'none';
          }}
        >
          <XCircle size={14} />
          Close Incident
        </button>
      </div>
    </div>
  );
};

// ============================================================
// METRIC CARD
// ============================================================
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgMuted: string;
}> = ({ label, value, icon, color, bgMuted }) => {
  const [displayValue, setDisplayValue] = React.useState(typeof value === 'number' ? 0 : value);
  
  React.useEffect(() => {
    if (typeof value === 'number') {
      import('framer-motion').then(({ animate }) => {
        animate(0, value, { duration: 1.2, onUpdate: v => setDisplayValue(Math.round(v)) });
      });
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(15,23,42,.12)', transition: { duration: 0.2 } }}
    style={{
      background: cc.surface,
      border: `1px solid ${cc.border}`,
      borderRadius: cc.radiusLg,
      padding: '14px 16px',
      boxShadow: cc.shadowSm,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flex: '1 1 200px',
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: cc.radiusMd,
        background: bgMuted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, lineHeight: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {displayValue}
      </div>
      <div style={{ fontSize: 11.5, color: cc.textMuted, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
        {label}
      </div>
    </div>
  </motion.div>
)};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const IncidentsTab: React.FC = () => {
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selected, setSelected] = useState<Incident | null>(null);

  const open = incidents.filter((i) => i.status === 'OPEN');
  const resolved = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED');

  const criticalCount = open.filter((i) => deriveSeverity(i) === 'CRITICAL').length;
  const underInvestigation = open.filter((i) => deriveSeverity(i) === 'HIGH').length;
  const resolvedCount = resolved.length;
  const avgDays = resolvedCount > 0 ? (13.2).toFixed(1) : '—';

  // Auto-select first open incident
  useEffect(() => {
    if (!selected && open.length > 0) {
      setSelected(open[0]);
    }
  }, [open.length]);

  const handleResolve = useCallback(async (id: string, _outcome: string, note: string) => {
    try {
      await IncidentService.resolve(id, { resolutionNote: note });
      void message.success('Incident closed successfully.');
      const updated = MOCK_INCIDENTS.map((i) =>
        i.incidentId === id ? { ...i, status: 'RESOLVED' as const, resolutionNote: note } : i
      );
      // Update local state
      const next = updated.find((i) => i.status === 'OPEN') ?? null;
      setSelected(next);
    } catch {
      void message.error('Failed to close incident. Please try again.');
    }
  }, []);

  const student = selected?.assignment?.student;
  const enterprise = selected?.assignment?.enterprise;
  const severity = selected ? deriveSeverity(selected) : null;
  const cfg = severity ? SEVERITY_CONFIG[severity] : null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 24px 40px' }}>
      <style>{`
        .incident-card-btn:focus-visible {
          outline: 2px solid ${cc.brand} !important;
          outline-offset: 2px;
        }
        .incidents-table .ant-table-thead > tr > th {
          background: ${cc.neutralBg} !important;
          border-bottom: 1px solid ${cc.border} !important;
          font-size: 11px !important; font-weight: 700 !important;
          text-transform: uppercase !important; letter-spacing: 0.06em !important;
          color: ${cc.textMuted} !important;
        }
        .incidents-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${cc.borderSubtle} !important;
          padding: 12px 14px !important;
        }
        .incidents-table .ant-select-selector {
          border-radius: ${cc.radiusMd}px !important;
          font-family: Inter, sans-serif !important;
          font-size: 13px !important;
        }
        .incidents-table .ant-input-textarea-show-count::after {
          font-size: 11px !important;
          color: ${cc.textMuted} !important;
          font-family: Inter, sans-serif !important;
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: cc.textPrimary,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Incident Management
        </h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: '4px 0 0' }}>
          Review, investigate, and close student-enterprise incidents
        </p>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <MetricCard
          label="Open (Critical)"
          value={criticalCount}
          icon={<AlertOctagon size={18} color={cc.error} />}
          color={cc.error}
          bgMuted={cc.errorMuted}
        />
        <MetricCard
          label="Under Investigation"
          value={underInvestigation}
          icon={<Search size={18} color={cc.warning} />}
          color={cc.warning}
          bgMuted={cc.warningMuted}
        />
        <MetricCard
          label="Resolved"
          value={resolvedCount}
          icon={<CheckCircle2 size={18} color={cc.success} />}
          color={cc.success}
          bgMuted={cc.successMuted}
        />
        <MetricCard
          label="Avg Resolution"
          value={`${avgDays}d`}
          icon={<Clock size={18} color={cc.info} />}
          color={cc.info}
          bgMuted={cc.infoMuted}
        />
      </div>

      {/* 12-col Master-Detail Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5fr 7fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* LEFT INBOX */}
        <div>
          {/* Inbox header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              padding: '0 2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertOctagon size={14} color={cc.textSecondary} />
              <span style={{ fontSize: 11, fontWeight: 700, color: cc.textSecondary, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Inbox
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#fff',
                  background: cc.brand,
                  padding: '1px 6px',
                  borderRadius: cc.radiusFull,
                }}
              >
                {open.length}
              </span>
            </div>
          </div>

          {/* Incident list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 580,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            <AnimatePresence mode="sync">
              {open.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: '40px 20px', 
                    textAlign: 'center', 
                    background: cc.surface, 
                    borderRadius: cc.radiusLg,
                    border: `1px dashed ${cc.border}`
                  }}
                >
                  <CheckCircle2 size={32} color={cc.success} style={{ marginBottom: 12, opacity: 0.5, display: 'inline-block' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: cc.textSecondary, fontFamily: 'Inter, sans-serif' }}>Inbox Zero!</div>
                  <div style={{ fontSize: 11.5, color: cc.textMuted, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>No open incidents require your attention.</div>
                </motion.div>
              ) : (
                open.map((inc, i) => (
                  <IncidentCard
                    key={inc.incidentId}
                    incident={inc}
                    isSelected={selected?.incidentId === inc.incidentId}
                    onSelect={setSelected}
                    index={i}
                  />
                ))
              )}
            </AnimatePresence>

            {/* Resolved section */}
            {resolved.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: cc.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 2px 8px',
                  borderBottom: `1px solid ${cc.borderSubtle}`,
                  marginBottom: 8,
                }}>
                  Resolved ({resolved.length})
                </div>
                {resolved.map((incident, i) => (
                  <IncidentCard
                    key={incident.incidentId}
                    incident={incident}
                    isSelected={selected?.incidentId === incident.incidentId}
                    onSelect={setSelected}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT WORKSPACE */}
        <motion.div
          key={selected?.incidentId ?? 'empty'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: cc.surface,
            border: `1px solid ${cc.border}`,
            borderRadius: cc.radiusLg,
            boxShadow: cc.shadowSm,
            overflow: 'hidden',
          }}
        >
          {!selected ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 24px',
                color: cc.textMuted,
              }}
            >
              <ShieldAlert size={36} style={{ opacity: 0.25, marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Select an incident</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Choose from the inbox on the left</div>
            </div>
          ) : (
            <>
              {/* Workspace Header */}
              <div
                style={{
                  background: cfg?.bg ?? cc.neutralBg,
                  borderBottom: `1px solid ${cc.borderSubtle}`,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: cc.radiusMd,
                      background: cc.surface,
                      border: `1px solid ${cc.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldAlert size={16} color={cfg?.color ?? cc.textSecondary} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                      {selected.incidentId} &middot; {selected.category}
                    </div>
                    <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                      {new Date(selected.createdAt).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: cfg?.color ?? cc.textMuted,
                    backgroundColor: cfg?.bg ?? 'transparent',
                    border: `1px solid ${cfg?.borderColor ?? cc.border}`,
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.05em',
                  }}
                >
                  {cfg?.label ?? 'UNKNOWN'}
                </span>
              </div>

              {/* Incident Info Grid */}
              <div style={{ padding: '16px 18px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  {[
                    { label: 'Student', value: student?.fullName ?? '—' },
                    { label: 'Enterprise', value: enterprise?.companyName ?? '—' },
                    { label: 'Student Code', value: student?.studentCode ?? '—' },
                    { label: 'Reported By', value: selected.reportedBy?.fullName ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                    Description
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: cc.textSecondary,
                    lineHeight: 1.6,
                    padding: '10px 12px',
                    background: cc.neutralBg,
                    borderRadius: cc.radiusMd,
                    border: `1px solid ${cc.borderSubtle}`,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {selected.description}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: cc.borderSubtle, margin: '0 18px' }} />

              {/* Workspace label */}
              <div style={{
                padding: '12px 18px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                color: cc.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'Inter, sans-serif',
              }}>
                Resolution Workspace
              </div>

              {/* Resolution Form or Resolved State */}
              <ResolutionWorkspace incident={selected} onResolve={handleResolve} />

              {/* Bottom padding */}
              <div style={{ height: 20 }} />
            </>)}
        </motion.div>
      </div>
    </div>
  );
};

export default IncidentsTab;
