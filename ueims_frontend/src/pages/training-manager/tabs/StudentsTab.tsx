import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Table, Modal, Select, Input, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload';
import {
  Upload as UploadIcon,
  Download,
  Search,
  Eye,
  Edit3,
  Users,
  UserCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import { EligibleStudentService } from '@/services/EligibleStudentService';
import { SemesterService } from '@/services/SemesterService';
import type { EligibleStudent } from '../types';

// ============================================================
// DESIGN TOKENS
// ============================================================
const st = {
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
  surface: 'rgba(255, 255, 255, 0.72)',
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
};

// ============================================================
// COLOR UTILITIES — shared across all tabs for ghost style rendering
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// AVATAR PALETTE — deterministic 4-color from brand tokens
// ============================================================
const AVATAR_PALETTE = [
  { bg: st.brandMuted,   text: st.brand  },   // slot 0 — orange family
  { bg: st.successMuted, text: st.success },   // slot 1 — green family
  { bg: st.infoMuted,    text: st.info   },   // slot 2 — blue family
  { bg: st.warningMuted, text: st.warning },   // slot 3 — amber family
];

function getAvatarColor(name: string) {
  const idx = name.split('').reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

const Avatar: React.FC<{ initials: string }> = ({ initials }) => {
  const palette = getAvatarColor(initials);
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: palette.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: palette.text,
      fontWeight: 700, fontSize: 11,
      fontFamily: 'Inter, sans-serif', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

// ============================================================
// RDS BUSINESS RULES — OJT Status by Semester
// RDS UC-20 / BR-19:
//   - Sem 1-4 : Pre-Registration  (cannot register OJT, just view list)
//   - Sem 5   : Eligible          (can register OJT, GPA >= 2.0 required)
//   - Sem 6   : In OJT           (active internship)
//   - Sem 7-9 : Completed        (finished OJT, can view results)
//   - Note: "Pre-Registration" students do NOT appear in the Eligible list
//     by default; they are only shown when "All" filter is applied.
// ============================================================
const OJT_STATUS: Record<string, {
  label: string; color: string; bg: string; borderColor: string;
  semRange: string; description: string;
}> = {
  PRE_REGISTRATION: {
    label: 'Pre-Registration', color: st.textMuted,  bg: hexToRgba(st.textMuted,  0.06), borderColor: hexToRgba(st.textMuted,  0.25), semRange: 'Sem. 1-4', description: 'Cannot register OJT — semester below eligibility threshold',
  },
  ELIGIBLE: {
    label: 'Eligible',        color: st.info,     bg: hexToRgba(st.info,     0.06), borderColor: hexToRgba(st.info,     0.25), semRange: 'Sem. 5',     description: 'Meets all OJT criteria — ready to register for internship',
  },
  IN_OJT: {
    label: 'In OJT',           color: st.success,  bg: hexToRgba(st.success,  0.06), borderColor: hexToRgba(st.success,  0.25), semRange: 'Sem. 6',     description: 'Currently in OJT — active internship',
  },
  COMPLETED: {
    label: 'Completed',       color: st.warning,  bg: hexToRgba(st.warning,  0.06), borderColor: hexToRgba(st.warning,  0.25), semRange: 'Sem. 7-9',   description: 'OJT finished — eligible to view results',
  },
};

function deriveStatus(sem: number): string {
  if (sem < 5) return 'PRE_REGISTRATION';
  if (sem === 5) return 'ELIGIBLE';
  if (sem === 6) return 'IN_OJT';
  return 'COMPLETED';
}

// ============================================================
// MOCK DATA — RDS-aligned students
// Sem 1-4: PRE_REGISTRATION (not yet eligible)
// Sem 5:   ELIGIBLE (meets criteria, can register OJT)
// Sem 6:   IN_OJT (active internship)
// Sem 7-9: COMPLETED (finished OJT)
// ============================================================
const MAJORS = [
  'All Majors',
  'Computer Science',
  'Software Engineering',
  'Information Assurance',
  'Artificial Intelligence',
];
const ACAD_SEM_OPTIONS = [
  { value: 'ALL', label: 'All Academic Sem' },
  { value: '1-4', label: 'Sem. 1-4' },
  { value: '5', label: 'Sem. 5 - Eligible' },
  { value: '6', label: 'Sem. 6 - In OJT' },
  { value: '7+', label: 'Sem. 7-9 - Completed' },
];

// ============================================================
// UI COMPONENTS
// ============================================================

// ============================================================
// STATUS BADGE — ghost outline (text color + whisper border, no solid fill)
// ============================================================
const StatusBadge: React.FC<{ sem: number }> = ({ sem }) => {
  const key = deriveStatus(sem);
  const cfg = OJT_STATUS[key];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 6,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.borderColor}`,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {cfg.label}
    </span>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgMuted: string;
}> = ({ label, value, icon, color, bgMuted }) => (
  <div
    style={{
      flex: 1,
      minWidth: 140,
      background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${st.border}`,
      borderRadius: st.radiusXl,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: st.shadowSm,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: st.radiusMd,
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
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: st.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: st.textMuted,
          marginTop: 4,
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

// STUDENT DETAIL MODAL — Gradient orange banner design
// ============================================================
const StudentDetailModal: React.FC<{
  open: boolean;
  student: EligibleStudent | null;
  onClose: () => void;
  onEdit: (s: EligibleStudent) => void;
}> = ({ open, student, onClose, onEdit }) => {
  if (!student) return null;
  const key = deriveStatus(student.currentSemester);
  const cfg = OJT_STATUS[key];
  const initials = student.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      destroyOnHidden
      styles={{
        mask: {
          background: 'rgba(0,0,0,.40)',
          backdropFilter: 'blur(6px)',
        },
        content: {
          borderRadius: st.radiusXl,
          border: `1px solid ${st.border}`,
          boxShadow: st.shadowLg,
          padding: 0,
          overflow: 'hidden',
        },
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      {/* HEADER SECTION */}
      <div style={{ padding: '24px 24px 20px', background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: st.radiusMd,
            background: st.neutralBg, border: `1px solid ${st.borderSubtle}`, cursor: 'pointer',
            color: st.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = st.borderSubtle; e.currentTarget.style.color = st.textPrimary; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = st.neutralBg; e.currentTarget.style.color = st.textSecondary; }}
        >
          <X size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: st.radiusMd,
            background: hexToRgba(cfg.color, 0.08), border: `1px solid ${hexToRgba(cfg.color, 0.2)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: cfg.color, flexShrink: 0, fontFamily: 'Inter, sans-serif',
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: st.textPrimary, margin: '0 0 5px', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {student.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: st.textSecondary, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                {student.studentCode}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: st.border }} />
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6,
                backgroundColor: hexToRgba(cfg.color, 0.06), border: `1px solid ${hexToRgba(cfg.color, 0.2)}`,
                color: cfg.color, fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.03em', textTransform: 'uppercase'
              }}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY SECTION */}
      <div style={{ padding: '0 24px 24px', background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        {/* Simple Grid for Info (No borders) */}
        <div className="ent-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginBottom: 28 }}>
          {[
            { label: 'Email Address', value: student.email },
            { label: 'Major', value: student.major },
            { label: 'Current Semester', value: `Semester ${student.currentSemester}` },
            { label: 'Cumulative GPA', value: student.gpa.toFixed(2), warn: student.gpa < 2.5 },
          ].map(({ label, value, warn }) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                {label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: warn ? st.warning : st.textPrimary, fontFamily: 'Inter, sans-serif', wordBreak: 'break-all' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Status Hint */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
          borderRadius: st.radiusLg, background: hexToRgba(cfg.color, 0.04),
          border: `1px solid ${hexToRgba(cfg.color, 0.15)}`,
        }}>
          <AlertCircle size={16} color={cfg.color} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, fontWeight: 500, color: st.textSecondary, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
            <span style={{ color: cfg.color, fontWeight: 700, marginRight: 4 }}>Note:</span>
            {cfg.description}
          </div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div style={{ padding: '18px 24px', borderTop: `1px solid ${st.borderSubtle}`, background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '9px 18px', borderRadius: st.radiusMd, border: `1px solid ${st.border}`,
            background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: st.textSecondary, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = st.neutralBg; e.currentTarget.style.color = st.textPrimary; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = st.surface; e.currentTarget.style.color = st.textSecondary; }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onClose(); onEdit(student); }}
          style={{
            padding: '9px 18px', borderRadius: st.radiusMd, border: 'none',
            background: st.brand, color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: st.shadowBrand,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = st.brandHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = st.brand; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Edit3 size={14} />
          Edit Student
        </button>
      </div>
    </Modal>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const renderShowTotal = (total: number, range: [number, number]) => (
  <span style={{ fontSize: 12, color: st.textMuted }}>
    Showing {range[0]}-{range[1]} of {total} students
  </span>
);
export const StudentsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [major, setMajor] = useState<string>(MAJORS[0]);
  const [acadSem, setAcadSem] = useState<string>('ALL');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<EligibleStudent | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch from real database via API
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await EligibleStudentService.getAllEligibleStudents();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load students', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchStudents();
  }, []);

  const eligibleCount = students.filter(
    (s) => deriveStatus(s.currentSemester) === 'ELIGIBLE'
  ).length;
  const eligibleTotal = eligibleCount;

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(search.toLowerCase());
      const matchMajor =
        major === 'All Majors' || s.major === major;
      const matchAcadSem = (() => {
        if (acadSem === 'ALL') return true;
        if (acadSem === '1-4')
          return s.currentSemester >= 1 && s.currentSemester <= 4;
        if (acadSem === '5') return s.currentSemester === 5;
        if (acadSem === '6') return s.currentSemester === 6;
        if (acadSem === '7+') return s.currentSemester >= 7;
        return true;
      })();
      return matchSearch && matchMajor && matchAcadSem;
    });
  }, [students, search, major, acadSem]);

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const hasActiveFilters =
    !!search || major !== 'All Majors' || acadSem !== 'ALL';

  const openDetail = (s: EligibleStudent) => {
    setSelectedStudent(s);
    setDetailModalOpen(true);
  };
  const handleEdit = (s: EligibleStudent) => {
    message.info({ content: `Editing: ${s.fullName}`, key: 'edit' });
  };

  const handleImport = async () => {
    if (!uploadedFile || !fileInputRef.current?.files?.[0]) return;
    try {
      setImporting(true);
      const activeSemester = await SemesterService.getActiveSemester();
      await EligibleStudentService.importFromExcel(
        fileInputRef.current.files[0],
        activeSemester?.semesterId ?? ''
      );
      message.success({ content: 'Import thành công!', key: 'import' });
      setImportModalOpen(false);
    } catch {
      message.error({ content: 'Lỗi khi import Excel.', key: 'import' });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const activeSemester = await SemesterService.getActiveSemester();
      const blob = await EligibleStudentService.exportToExcel(
        activeSemester?.semesterId ?? ''
      );
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OJT_Students_${
        activeSemester?.semesterCode ?? 'list'
      }.xlsx`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
      message.success({ content: 'Xuất file thành công!', key: 'export' });
    } catch {
      message.error({ content: 'Lỗi khi xuất file.', key: 'export' });
    }
  };

  const columns: ColumnsType<EligibleStudent> = [
    {
      title: <span style={thStyle}>Student ID</span>,
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 110,
      render: (code: string) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 600,
            color: st.textMuted,
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: <span style={thStyle}>Full Name</span>,
      dataIndex: 'fullName',
      key: 'fullName',
      width: 190,
      render: (name: string) => (
        <span style={{ fontSize: 13.5, fontWeight: 600, color: st.textPrimary }}>
          {name}
        </span>
      ),
    },
    {
      title: <span style={thStyle}>Major</span>,
      dataIndex: 'major',
      key: 'major',
      width: 170,
      render: (m: string) => (
        <span style={{ fontSize: 13, color: st.textSecondary, fontWeight: 500 }}>
          {m}
        </span>
      ),
    },
    {
      title: <span style={thStyle}>Sem.</span>,
      key: 'sem',
      width: 72,
      render: (_: unknown, r: EligibleStudent) => (
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: st.textPrimary,
          }}
        >
          Sem. {r.currentSemester}
        </span>
      ),
    },
    {
      title: <span style={thStyle}>GPA</span>,
      dataIndex: 'gpa',
      key: 'gpa',
      width: 70,
      render: (gpa: number) => (
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: gpa < 2.5 ? st.warning : st.textPrimary,
          }}
        >
          {gpa.toFixed(2)}
        </span>
      ),
    },
    {
      title: <span style={thStyle}>OJT Status</span>,
      key: 'status',
      width: 200,
      render: (_: unknown, r: EligibleStudent) => <StatusBadge sem={r.currentSemester} />,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'right',
      render: (_: unknown, r: EligibleStudent) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button
            onClick={() => openDetail(r)}
            title="View Details"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: st.radiusMd,
              background: st.brandSubtle,
              border: 'none',
              cursor: 'pointer',
              color: st.brand,
            }}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleEdit(r)}
            title="Edit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: st.radiusMd,
              background: 'transparent',
              border: `1px solid ${st.border}`,
              cursor: 'pointer',
              color: st.textSecondary,
            }}
          >
            <Edit3 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="students-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .students-table .ant-table-thead > tr > th {
          background: ${st.neutralBg} !important;
          border-bottom: 1px solid ${st.border} !important;
          font-size: 11px !important; font-weight: 700 !important;
          text-transform: uppercase !important; letter-spacing: 0.06em !important;
          color: ${st.textMuted} !important; padding: 10px 14px !important;
        }
        .students-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${st.borderSubtle} !important;
          padding: 12px 14px !important;
        }
        .students-table .ant-table-tbody > tr:hover > td {
          background: ${st.brandSubtle} !important;
        }
        .students-table .ant-table-tbody > tr:last-child > td { border-bottom: none !important; }
        .students-table .ant-pagination-item { border-radius: ${st.radiusMd}px !important; border-color: ${st.border} !important; }
        .students-table .ant-pagination-item-active { background: ${st.brand} !important; border-color: ${st.brand} !important; }
        .students-table .ant-pagination-item-active a { color: #fff !important; }
        .import-dragger .ant-upload-drag {
          border-radius: ${st.radiusLg}px !important; border: 2px dashed ${st.brand} !important;
          background: ${st.brandSubtle} !important;
        }
        .import-dragger .ant-upload-drag:hover { border-color: ${st.brandHover} !important; background: ${st.brandMuted} !important; }
        .students-container {
          padding: 0 24px 40px;
        }
        @media (max-width: 768px) {
          .students-container {
            padding: 0 12px 100px !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: st.textPrimary,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Student Management
        </h2>
        <p style={{ fontSize: 13, color: st.textMuted, margin: '4px 0 0' }}>
          Manage and track all students across academic semesters
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
          label="Total Students"
          value={students.length}
          icon={<Users size={18} color={st.brand} />}
          color={st.brand}
          bgMuted={st.brandMuted}
        />
        <MetricCard
          label="Eligible Students"
          value={eligibleTotal}
          icon={<UserCheck size={18} color={st.info} />}
          color={st.info}
          bgMuted={st.infoMuted}
        />
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${st.border}`,
          borderRadius: st.radiusLg,
          padding: '12px 16px',
          boxShadow: st.shadowSm,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <Input
          prefix={<Search size={14} style={{ color: st.textMuted }} />}
          placeholder="Search by Name or Student ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            flex: '1 1 220px',
            borderRadius: st.radiusMd,
            fontSize: 13,
            height: 36,
            borderColor: st.border,
          }}
          allowClear
          onClear={() => setPage(1)}
        />
        <Select
          value={major}
          onChange={(v) => {
            setMajor(v);
            setPage(1);
          }}
          options={MAJORS.map((m) => ({ value: m, label: m }))}
          style={{ flex: '0 1 190px' }}
          popupMatchSelectWidth={false}
        />
        <Select
          value={acadSem}
          onChange={(v) => {
            setAcadSem(v);
            setPage(1);
          }}
          options={ACAD_SEM_OPTIONS}
          style={{ flex: '0 1 170px' }}
          popupMatchSelectWidth={false}
        />
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch('');
              setMajor('All Majors');
              setAcadSem('ALL');
              setPage(1);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 4px',
              background: 'none',
              border: 'none',
              color: st.brand,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <X size={12} />
            Clear
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setImportModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: st.radiusMd,
              border: 'none',
              background: st.brand,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: st.shadowBrand,
            }}
          >
            <UploadIcon size={14} />
            Import
          </button>
          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: st.radiusMd,
              border: `1.5px solid ${st.brand}`,
              background: 'transparent',
              color: st.brand,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div
        style={{
          background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${st.border}`,
          borderRadius: st.radiusLg,
          boxShadow: st.shadowSm,
          overflowX: 'auto',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <Table
          className="students-table"
          rowKey="eligibleId"
          columns={columns}
          dataSource={paginatedStudents}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize,
            total: filteredStudents.length,
            showSizeChanger: false,
            showTotal: renderShowTotal,
            onChange: (p) => setPage(p),
          }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: st.textMuted }}>
                <Users size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>No students found</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
              </div>
            ),
          }}
        />
      </div>

      {/* Import Modal */}
      <Modal
        title={null}
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setUploadedFile(null);
        }}
        footer={null}
        width={500}
        centered
        styles={{ body: { padding: '24px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: st.textPrimary,
                margin: 0,
              }}
            >
              Import Students
            </h3>
            <p
              style={{
                fontSize: 13,
                color: st.textMuted,
                margin: '4px 0 0',
              }}
            >
              Upload Excel file to bulk-import eligible students
            </p>
          </div>
          <button
            onClick={() => {
              setImportModalOpen(false);
              setUploadedFile(null);
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: st.radiusMd,
              background: st.neutralBg,
              border: 'none',
              cursor: 'pointer',
              color: st.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div className="import-dragger" style={{ marginBottom: 14 }}>
          <Upload.Dragger
            name="file"
            accept=".xlsx,.xls"
            fileList={uploadedFile ? [uploadedFile] : []}
            onChange={(info) =>
              setUploadedFile(info.fileList[0] || null)
            }
            beforeUpload={() => false}
            maxCount={1}
          >
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 8 }}>
                <UploadIcon
                  size={30}
                  style={{ color: st.brand, opacity: 0.8 }}
                />
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: st.textPrimary,
                  margin: '0 0 4px',
                }}
              >
                Click or drag Excel file to upload
              </p>
              <p style={{ fontSize: 13, color: st.textMuted }}>
                Supports .xlsx, .xls formats
              </p>
            </div>
          </Upload.Dragger>
        </div>
        <div
          style={{
            background: st.infoMuted,
            border: `1px solid ${st.info}`,
            borderLeftWidth: 3,
            borderRadius: st.radiusMd,
            padding: '10px 14px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: st.infoText,
              marginBottom: 2,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            BR-19 Requirement
          </div>
          <div
            style={{
              fontSize: 12,
              color: st.infoText,
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5,
            }}
          >
            Only students with GPA{' '}
            <strong>2.0 or higher</strong> will be imported as Eligible.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setImportModalOpen(false);
              setUploadedFile(null);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: st.radiusMd,
              border: `1.5px solid ${st.brand}`,
              background: 'transparent',
              color: st.brand,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!uploadedFile || importing}
            style={{
              padding: '8px 16px',
              borderRadius: st.radiusMd,
              border: 'none',
              background: uploadedFile ? st.brand : st.textMuted,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: uploadedFile ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {importing ? (
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                }}
              />
            ) : (
              <UploadIcon size={13} />
            )}
            {importing ? 'Importing...' : 'Import Students'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <StudentDetailModal
        open={detailModalOpen}
        student={selectedStudent}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  );
};

const thStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#9CA3AF',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
