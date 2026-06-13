import React, { useState, useCallback, useEffect } from 'react';
import { Table, Select, Modal, message, Spin } from 'antd';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import type { ColumnsType } from 'antd/es/table';
import {
  Sparkles,
  Inbox,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';

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
type PlacementStatus = 'UNPLACED' | 'PENDING_APPROVAL' | 'INTERVIEWING' | 'PLACED';
type PlacementSource = 'SELF_SOURCED' | 'SYSTEM_MATCHED';

interface PlacementRecord {
  key: string;
  id: string;
  studentName: string;
  studentCode: string;
  avatar: string;
  major: string;
  gpa: number;
  targetRole: string;
  source: PlacementSource;
  status: PlacementStatus;
  enterprise: string | null;
  enterpriseInitials: string | null;
  enterpriseColor: string | null;
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
const STATUS_CONFIG: Record<PlacementStatus, {
  label: string; color: string; bg: string; borderColor: string;
}> = {
  UNPLACED:        { label: 'Unplaced',      color: cc.neutral,  bg: hexToRgba(cc.neutral,  0.06), borderColor: hexToRgba(cc.neutral,  0.25) },
  PENDING_APPROVAL:{ label: 'Pending',        color: cc.info,    bg: hexToRgba(cc.info,    0.06), borderColor: hexToRgba(cc.info,    0.25) },
  INTERVIEWING:    { label: 'Interviewing',   color: cc.warning, bg: hexToRgba(cc.warning, 0.06), borderColor: hexToRgba(cc.warning, 0.25) },
  PLACED:          { label: 'Placed',        color: cc.success, bg: hexToRgba(cc.success, 0.06), borderColor: hexToRgba(cc.success, 0.25) },
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
const StatusBadge: React.FC<{ status: PlacementStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
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

// ============================================================
// MAIN COMPONENT
// ============================================================
const renderPaginationTotal = (total: number, range: [number, number]) => (
  <span style={{ fontSize: 12, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>
    {range[0]}–{range[1]} of {total} students
  </span>
);

export const OJTTab: React.FC = () => {
  const [majorFilter, setMajorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [running, setRunning] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PlacementRecord | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [placementData, setPlacementData] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setLoading(true);
        const { data } = await EnterpriseAssignmentService.getAll();
        const mapped: PlacementRecord[] = data.result?.map((item: any) => ({
          key: item.assignmentId,
          id: item.assignmentId,
          studentName: item.student?.fullName || 'Unknown Student',
          studentCode: item.student?.studentCode || 'Unknown',
          avatar: item.student?.fullName?.substring(0, 2).toUpperCase() || 'ST',
          major: item.student?.studentProfile?.major || 'N/A',
          gpa: item.student?.studentProfile?.gpa || 0,
          targetRole: 'Intern',
          source: 'SYSTEM_MATCHED',
          status: item.status === 'ACTIVE' ? 'PLACED' : 'UNPLACED',
          enterprise: item.enterprise?.companyName || null,
          enterpriseInitials: item.enterprise?.companyName?.substring(0, 2).toUpperCase() || null,
          enterpriseColor: null,
        })) || [];
        setPlacementData(mapped);
      } catch (err) {
        console.error('Failed to load OJT placements', err);
        setPlacementData([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchPlacements();
  }, []);
  const pendingCount = placementData.filter((p) => p.status === 'PENDING_APPROVAL').length;

  const ENTERPRISES = [
    { name: 'FPT Software',  initials: 'FP', ...getEnterpriseColor('FPT Software')  },
    { name: 'VinBigData',    initials: 'VB', ...getEnterpriseColor('VinBigData')   },
    { name: 'VNG Corporation', initials: 'VN', ...getEnterpriseColor('VNG Corporation') },
    { name: 'NashTech VN',   initials: 'NT', ...getEnterpriseColor('NashTech VN') },
  ];

  const handleAutoMatch = useCallback(async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1800));
    setPlacementData((prev) => {
      const next = [...prev];
      let unplacedCount = 0;
      for (let i = 0; i < next.length; i++) {
        const p = next[i];
        if (p.status === 'UNPLACED' && unplacedCount < 3) {
          unplacedCount++;
          const ent = ENTERPRISES[Math.floor(Math.random() * ENTERPRISES.length)];
          next[i] = {
            ...p,
            status: 'INTERVIEWING',
            source: 'SYSTEM_MATCHED',
            enterprise: ent.name,
            enterpriseInitials: ent.initials,
            enterpriseColor: ent.color,
          };
        }
      }
      return next;
    });
    setRunning(false);
    message.success({ content: 'Successfully matched unplaced students!', duration: 3 });
  }, []);

  const openManualMatch = useCallback((record: PlacementRecord) => {
    setSelectedRecord(record);
    setMatchModalOpen(true);
  }, []);

  const openApprove = useCallback((record: PlacementRecord) => {
    setSelectedRecord(record);
    setApproveModalOpen(true);
  }, []);

  const openUpdate = useCallback((record: PlacementRecord) => {
    setSelectedRecord(record);
    setUpdateModalOpen(true);
  }, []);

  const handleViewContract = useCallback((record: PlacementRecord) => {
    message.info({ content: `Opening contract for ${record.studentName} at ${record.enterprise}…`, duration: 2 });
  }, []);

  const filteredData = placementData.filter((p) => {
    if (majorFilter !== 'ALL' && p.major !== majorFilter) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (sourceFilter !== 'ALL' && p.source !== sourceFilter) return false;
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
      render: (_: unknown, record: PlacementRecord) => (
        <div style={row}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 7px', borderRadius: 6,
            backgroundColor: record.source === 'SELF_SOURCED' ? hexToRgba(cc.info, 0.06) : hexToRgba(cc.purple, 0.06),
            border: `1px solid ${record.source === 'SELF_SOURCED' ? hexToRgba(cc.info, 0.25) : hexToRgba(cc.purple, 0.25)}`,
            color: record.source === 'SELF_SOURCED' ? cc.info : cc.purple,
            fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {record.source === 'SELF_SOURCED' ? 'Self-Sourced' : 'System-Matched'}
          </span>
        </div>
      ),
    },
    {
      title: <HeaderBadge>Enterprise</HeaderBadge>,
      key: 'enterprise',
      align: 'left' as const,
      width: 170,
      render: (_: unknown, record: PlacementRecord) => (
        <div style={row}>
          {record.enterprise ? (
            <>
              <Avatar initials={record.enterpriseInitials ?? '??'} color={record.enterpriseColor ?? undefined} />
              <span style={{ ...cellBase, fontSize: 12, fontWeight: 600, color: cc.textPrimary, marginLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {record.enterprise}
              </span>
            </>
          ) : (
            <span style={{ ...cellBase, fontSize: 12, color: cc.textMuted, fontStyle: 'italic' }}>—</span>
          )}
        </div>
      ),
    },
    {
      title: <HeaderBadge align="right">Status</HeaderBadge>,
      dataIndex: 'status',
      key: 'status',
      align: 'right' as const,
      width: 120,
      render: (status: PlacementStatus) => (
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
      width: 130,
      render: (_: unknown, record: PlacementRecord) => {
        if (record.status === 'UNPLACED') {
          return (
            <div style={{ ...row, justifyContent: 'flex-end' }}>
              <button
                onClick={() => openManualMatch(record)}
                style={{
                  padding: '5px 12px', borderRadius: cc.radiusMd,
                  border: `1.5px solid ${cc.brand}`, background: 'transparent', color: cc.brand,
                  fontSize: 11.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = cc.brand; b.style.color = '#fff';
                  b.style.transform = 'translateY(-1px)';
                  b.style.boxShadow = '0 3px 10px rgba(255,122,48,.22)';
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = 'transparent'; b.style.color = cc.brand;
                  b.style.transform = 'translateY(0)'; b.style.boxShadow = 'none';
                }}
              >
                Match
              </button>
            </div>
          );
        }

        if (record.status === 'PENDING_APPROVAL') {
          return (
            <div style={{ ...row, justifyContent: 'flex-end' }}>
              <button
                onClick={() => openApprove(record)}
                style={{
                  padding: '5px 12px', borderRadius: cc.radiusMd,
                  border: 'none', background: cc.success, color: '#fff',
                  fontSize: 11.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(16,185,129,.18)',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = '#0D9668'; b.style.transform = 'translateY(-1px)';
                  b.style.boxShadow = '0 4px 12px rgba(16,185,129,.25)';
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = cc.success; b.style.transform = 'translateY(0)';
                  b.style.boxShadow = '0 2px 6px rgba(16,185,129,.18)';
                }}
              >
                Approve
              </button>
            </div>
          );
        }

        if (record.status === 'INTERVIEWING') {
          return (
            <div style={{ ...row, justifyContent: 'flex-end' }}>
              <button
                onClick={() => openUpdate(record)}
                style={{
                  padding: '5px 12px', borderRadius: cc.radiusMd,
                  border: `1.5px solid ${cc.warning}`, background: 'transparent', color: cc.warning,
                  fontSize: 11.5, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = cc.warning; b.style.color = '#fff';
                  b.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = 'transparent'; b.style.color = cc.warning;
                  b.style.transform = 'translateY(0)';
                }}
              >
                Update
              </button>
            </div>
          );
        }

        return (
          <div style={{ ...row, justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleViewContract(record)}
              style={{
                padding: '5px 12px', borderRadius: cc.radiusMd,
                border: 'none', background: 'transparent', color: cc.textMuted,
                fontSize: 11.5, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', transition: 'color 0.15s ease', whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = cc.textSecondary; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = cc.textMuted; }}
            >
              View Contract
            </button>
          </div>
        );
      },
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
        background: cc.surface, border: `1px solid ${cc.border}`,
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

          {/* Summary — mono-tint pill chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, borderLeft: `1px solid ${cc.border}`, marginLeft: 4, flexWrap: 'wrap' }}>
            {([
              { label: 'Unplaced', n: filteredData.filter((p) => p.status === 'UNPLACED').length },
              { label: 'Pending', n: filteredData.filter((p) => p.status === 'PENDING_APPROVAL').length },
              { label: 'Interviewing', n: filteredData.filter((p) => p.status === 'INTERVIEWING').length },
              { label: 'Placed', n: filteredData.filter((p) => p.status === 'PLACED').length },
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
            style={{ width: 135, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'UNPLACED', label: 'Unplaced' },
              { value: 'PENDING_APPROVAL', label: 'Pending' },
              { value: 'INTERVIEWING', label: 'Interviewing' },
              { value: 'PLACED', label: 'Placed' },
            ]}
          />
          <Select
            value={sourceFilter}
            onChange={setSourceFilter}
            suffixIcon={<ChevronDown size={11} />}
            style={{ width: 130, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
            options={[
              { value: 'ALL', label: 'All Sources' },
              { value: 'SELF_SOURCED', label: 'Self-Sourced' },
              { value: 'SYSTEM_MATCHED', label: 'System-Matched' },
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
        onCancel={() => setMatchModalOpen(false)} footer={null}
        width={440} centered
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
                {selectedRecord.studentName}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface }}>
          <p style={{ fontSize: 12.5, color: cc.textSecondary, marginBottom: 14, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            Assign an enterprise to this student. Status will move to <strong style={{ color: cc.warning }}>Interviewing</strong>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { name: 'FPT Software',    initials: 'FP', ...getEnterpriseColor('FPT Software')     },
              { name: 'VinBigData',     initials: 'VB', ...getEnterpriseColor('VinBigData')      },
              { name: 'VNG Corporation', initials: 'VN', ...getEnterpriseColor('VNG Corporation') },
              { name: 'NashTech VN',    initials: 'NT', ...getEnterpriseColor('NashTech VN')     },
            ].map((ent) => (
              <button
                key={ent.name}
                onClick={() => {
                  setMatchModalOpen(false);
                  void message.success({ content: `${selectedRecord?.studentName} → ${ent.name}`, duration: 2.5 });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: cc.radiusMd,
                  border: `1px solid ${cc.border}`, background: cc.surface,
                  cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = cc.neutralBg; b.style.borderColor = cc.neutral;
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = cc.surface; b.style.borderColor = cc.border;
                }}
              >
                <Avatar initials={ent.initials} color={ent.color} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                  {ent.name}
                </span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button
              onClick={() => setMatchModalOpen(false)}
              style={{
                padding: '6px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Approve Company ───────────────────────── */}
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
                {selectedRecord.studentName} &middot; {selectedRecord.enterprise}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface }}>
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
                  {selectedRecord.enterprise}
                </div>
                <div style={{ fontSize: 11.5, color: cc.textMuted, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                  {selectedRecord.targetRole} &middot; GPA {selectedRecord.gpa.toFixed(1)}
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Approve & Place', sub: 'Finalizes placement, generates contract', c: cc.success, bg: cc.successMuted, b: '#6EE7B7' },
              { label: 'Request Documents', sub: 'Ask for enterprise verification docs', c: cc.warning, bg: cc.warningMuted, b: '#FCD34D' },
              { label: 'Reject', sub: 'Student must find another enterprise', c: cc.error, bg: cc.errorMuted, b: '#FCA5A5' },
            ].map(({ label, sub, c, bg, b }) => (
              <button
                key={label}
                onClick={() => {
                  setApproveModalOpen(false);
                  if (label === 'Approve & Place') {
                    void message.success({ content: `${selectedRecord?.studentName} placed at ${selectedRecord?.enterprise}!`, duration: 3 });
                  } else if (label === 'Request Documents') {
                    void message.info({ content: `Request sent to ${selectedRecord?.studentName}`, duration: 2.5 });
                  } else {
                    void message.warning({ content: `Placement rejected for ${selectedRecord?.studentName}`, duration: 2.5 });
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderRadius: cc.radiusMd,
                  border: `1px solid ${b}`, background: bg,
                  cursor: 'pointer', transition: 'transform 0.15s ease', textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: c, fontFamily: 'Inter, sans-serif' }}>{label}</span>
                <span style={{ fontSize: 11, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>{sub}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button
              onClick={() => setApproveModalOpen(false)}
              style={{
                padding: '6px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Update Status ─────────────────────────── */}
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
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif' }}>Update Interview Status</div>
            {selectedRecord && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.80)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                {selectedRecord.studentName} &middot; {selectedRecord.enterprise}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: cc.surface }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Mark as Placed', sub: 'Generate OJT contract', c: cc.success, bg: cc.successMuted, b: '#6EE7B7' },
              { label: 'Keep Interviewing', sub: 'Student remains in pipeline', c: cc.warning, bg: cc.warningMuted, b: '#FCD34D' },
              { label: 'Mark as Unplaced', sub: 'Remove from current enterprise', c: cc.error, bg: cc.errorMuted, b: '#FCA5A5' },
            ].map(({ label, sub, c, bg, b }) => (
              <button
                key={label}
                onClick={() => {
                  setUpdateModalOpen(false);
                  void message.success({ content: `${selectedRecord?.studentName}: ${label}`, duration: 2.5 });
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderRadius: cc.radiusMd,
                  border: `1px solid ${b}`, background: bg,
                  cursor: 'pointer', transition: 'transform 0.15s ease', textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: c, fontFamily: 'Inter, sans-serif' }}>{label}</span>
                <span style={{ fontSize: 11, color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>{sub}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button
              onClick={() => setUpdateModalOpen(false)}
              style={{
                padding: '6px 14px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, background: 'transparent', color: cc.textSecondary,
                fontSize: 12.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              Cancel
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
        <div style={{ padding: '16px 20px', background: cc.surface, maxHeight: 380, overflowY: 'auto' }}>
          {placementData
            .filter((p) => p.status === 'PENDING_APPROVAL')
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
                    {record.studentCode} &middot; {record.targetRole}
                  </div>
                </div>
                <Avatar initials={record.enterpriseInitials ?? '??'} color={record.enterpriseColor ?? undefined} />
                <span style={{ fontSize: 12, fontWeight: 600, color: cc.textSecondary, fontFamily: 'Inter, sans-serif', minWidth: 90 }}>
                  {record.enterprise}
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
    </div>
  );
};

export default OJTTab;
