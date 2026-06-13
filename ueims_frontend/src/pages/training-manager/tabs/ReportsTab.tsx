import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Table, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FileSpreadsheet,
  FileText,
  FileBarChart2,
  Plus,
  Download,
  Trash2,
  LayoutDashboard,
  ChevronDown,
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
interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  format: 'Excel' | 'PDF';
  formatColor: string;
  formatBg: string;
  downloadCount: number;
}

// Deterministically picks a brand color from the token set based on template title
function getFormatPalette(tpl: Pick<ReportTemplate, 'id' | 'format'>): { color: string; bg: string } {
  const id = tpl.id;
  if (tpl.format === 'PDF' || id === 'tpl-2') {
    return { color: st.info, bg: hexToRgba(st.info, 0.06) };
  }
  if (id === 'tpl-3') {
    return { color: st.warning, bg: hexToRgba(st.warning, 0.06) };
  }
  return { color: st.success, bg: hexToRgba(st.success, 0.06) };
}

interface ReportHistoryItem {
  key: string;
  name: string;
  category: string;
  categoryColor: string;
  date: string;
  size: string;
  sizeBytes: number;
}

// ============================================================
// MOCK DATA — Report Templates
// ============================================================
const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tpl-1',
    title: 'OJT Placement Summary',
    description: 'Student placement rates, enterprise distribution, and outcome breakdown for the selected semester.',
    icon: <FileSpreadsheet size={28} color={st.success} strokeWidth={1.6} />,
    format: 'Excel',
    formatColor: st.success,
    formatBg: 'ghost',
    downloadCount: 124,
  },
  {
    id: 'tpl-2',
    title: 'Final GPA & Evaluation',
    description: 'Comprehensive final grade report including rubric scores, supervisor evaluation, and pass/fail summary.',
    icon: <FileText size={28} color={st.info} strokeWidth={1.6} />,
    format: 'PDF',
    formatColor: st.info,
    formatBg: 'ghost',
    downloadCount: 98,
  },
  {
    id: 'tpl-3',
    title: 'Enterprise Feedback Report',
    description: 'Aggregated enterprise supervisor feedback scores, strengths, and improvement areas per student cohort.',
    icon: <FileBarChart2 size={28} color={st.warning} strokeWidth={1.6} />,
    format: 'Excel',
    formatColor: st.warning,
    formatBg: 'ghost',
    downloadCount: 76,
  },
];

// ============================================================
// MOCK DATA — Report History
// ============================================================
// REPORT_HISTORY removed to use dynamic state instead


// ============================================================
// REPORT TEMPLATE CARD
// ============================================================
const TemplateCard: React.FC<{
  template: ReportTemplate;
  index: number;
  onExport: (t: ReportTemplate) => void;
}> = ({ template, index, onExport }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: st.surface,
        border: `1px solid ${hovered ? st.brand + '60' : st.border}`,
        borderRadius: st.radiusXl,
        padding: '24px',
        boxShadow: hovered ? st.shadowMd : st.shadowSm,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brand glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at top left, ${st.brandMuted}40 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Icon + Format badge row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: st.radiusMd,
          background: st.neutralBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${st.borderSubtle}`,
          flexShrink: 0,
        }}>
          {template.icon}
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: template.formatColor,
          backgroundColor: hexToRgba(template.formatColor, 0.06),
          border: `1px solid ${hexToRgba(template.formatColor, 0.2)}`,
          padding: '3px 8px',
          borderRadius: st.radiusMd,
          letterSpacing: '0.04em',
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
        }}>
          {template.format}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 15,
        fontWeight: 800,
        color: st.textPrimary,
        margin: '0 0 8px',
        letterSpacing: '-0.01em',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.3,
      }}>
        {template.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 12.5,
        color: st.textMuted,
        margin: '0 0 20px',
        lineHeight: 1.6,
        fontFamily: 'Inter, sans-serif',
      }}>
        {template.description}
      </p>

      {/* Footer: download count + action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 11,
          color: st.textMuted,
          fontFamily: 'Inter, sans-serif',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {template.downloadCount.toLocaleString()} downloads
        </span>
        <button
          onClick={() => onExport(template)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 12px',
            borderRadius: st.radiusMd,
            border: `1px solid ${hovered ? st.brand : st.border}`,
            background: hovered ? st.brand : 'transparent',
            color: hovered ? '#fff' : st.textSecondary,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
            boxShadow: hovered ? st.shadowBrand : 'none',
          }}
        >
          <Download size={13} strokeWidth={2} />
          Export {template.format}
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export const ReportsTab: React.FC = () => {
  const [semester, setSemester] = useState<string>('SUMMER_2026');
  const [category, setCategory] = useState<string>('ALL');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);

  // Suppress unused variable warning if your linter complains about exportingId
  console.debug('Exporting:', exportingId);

  const handleExport = (template: ReportTemplate) => {
    setExportingId(template.id);
    setTimeout(() => {
      setExportingId(null);
      void message.success({
        content: `${template.title} (${template.format}) is being generated — check your downloads.`,
        duration: 3,
      });
      
      const newHistory: ReportHistoryItem = {
        key: `h-${Date.now()}`,
        name: `${template.title} — ${semester.replace('_', ' ')}`,
        category: template.title.includes('Placement') ? 'Placement' : (template.title.includes('Feedback') ? 'Enterprise Feedback' : 'End-of-Term'),
        categoryColor: template.formatColor,
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
        size: '1.2 MB',
        sizeBytes: 1200000,
      };
      setReportHistory(prev => [newHistory, ...prev]);
    }, 1200);
  };

  const handleDownload = (record: ReportHistoryItem) => {
    void message.success({ content: `Downloading "${record.name}"...`, duration: 2 });
  };

  const handleDelete = (record: ReportHistoryItem) => {
    setReportHistory(prev => prev.filter(r => r.key !== record.key));
    void message.info({ content: `"${record.name}" removed from history.`, duration: 2 });
  };

  const historyColumns: ColumnsType<ReportHistoryItem> = [
    {
      title: (
        <span style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
          Report Name
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: st.textPrimary, fontFamily: 'Inter, sans-serif' }}>
          {text}
        </span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
          Category
        </span>
      ),
      key: 'category',
      render: (_: unknown, record: ReportHistoryItem) => (
        <span
          style={{
            borderRadius: st.radiusFull,
            border: `1px solid ${hexToRgba(record.categoryColor, 0.2)}`,
            backgroundColor: hexToRgba(record.categoryColor, 0.06),
            color: record.categoryColor,
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 10px',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
            display: 'inline-block',
          }}
        >
          {record.category}
        </span>
      ),
      width: 150,
    },
    {
      title: (
        <span style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
          Date Generated
        </span>
      ),
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        <span style={{ fontSize: 12.5, color: st.textSecondary, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {text}
        </span>
      ),
      width: 170,
    },
    {
      title: (
        <span style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
          File Size
        </span>
      ),
      dataIndex: 'size',
      key: 'size',
      align: 'right',
      render: (text: string) => (
        <span style={{ fontSize: 12.5, fontWeight: 700, color: st.textPrimary, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {text}
        </span>
      ),
      width: 100,
    },
    {
      title: (
        <span style={{ fontSize: 11, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
          Actions
        </span>
      ),
      key: 'actions',
      align: 'center',
      render: (_: unknown, record: ReportHistoryItem) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button
            onClick={() => handleDownload(record)}
            title="Download"
            style={{
              width: 30,
              height: 30,
              borderRadius: st.radiusMd,
              border: `1px solid ${st.border}`,
              background: st.surface,
              color: st.textSecondary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = st.successMuted;
              (e.currentTarget as HTMLButtonElement).style.color = st.success;
              (e.currentTarget as HTMLButtonElement).style.borderColor = st.success;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = st.surface;
              (e.currentTarget as HTMLButtonElement).style.color = st.textSecondary;
              (e.currentTarget as HTMLButtonElement).style.borderColor = st.border;
            }}
          >
            <Download size={13} strokeWidth={2} />
          </button>
          <button
            onClick={() => handleDelete(record)}
            title="Delete"
            style={{
              width: 30,
              height: 30,
              borderRadius: st.radiusMd,
              border: `1px solid ${st.border}`,
              background: st.surface,
              color: st.textSecondary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = st.errorMuted;
              (e.currentTarget as HTMLButtonElement).style.color = st.error;
              (e.currentTarget as HTMLButtonElement).style.borderColor = st.error;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = st.surface;
              (e.currentTarget as HTMLButtonElement).style.color = st.textSecondary;
              (e.currentTarget as HTMLButtonElement).style.borderColor = st.border;
            }}
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      ),
      width: 90,
    },
  ];

  return (
    <div className="reports-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .reports-tab-table .ant-table-thead > tr > th {
          background: ${st.neutralBg} !important;
          border-bottom: 1px solid ${st.border} !important;
          padding: 10px 14px !important;
        }
        .reports-tab-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${st.borderSubtle} !important;
          padding: 13px 14px !important;
        }
        .reports-tab-table .ant-table-tbody > tr:hover > td {
          background: ${st.neutralBg} !important;
        }
        .reports-tab-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .reports-tab-table .ant-table-wrapper .ant-table-pagination {
          padding: 12px 14px !important;
          border-top: 1px solid ${st.border} !important;
          margin: 0 !important;
        }
        .reports-tab-table .ant-select-selector {
          border-radius: ${st.radiusMd}px !important;
          font-family: Inter, sans-serif !important;
          font-size: 13px !important;
          height: 36px !important;
          line-height: 34px !important;
        }
        .reports-tab-table .ant-select-selection-item {
          font-family: Inter, sans-serif !important;
          font-size: 13px !important;
          line-height: 34px !important;
        }
        .reports-tab-table .ant-select-selection-placeholder {
          font-family: Inter, sans-serif !important;
          font-size: 13px !important;
          line-height: 34px !important;
          color: ${st.textMuted} !important;
        }
        .reports-container {
          padding: 0 24px 40px;
        }
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 1024px) {
          .reports-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .reports-container {
            padding: 0 12px 100px; /* Extra padding for floating bottom bar */
          }
          .reports-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <LayoutDashboard size={18} color={st.brand} strokeWidth={2} />
          <h2 style={{
            fontSize: 20,
            fontWeight: 800,
            color: st.textPrimary,
            margin: 0,
            letterSpacing: '-0.01em',
            fontFamily: 'Inter, sans-serif',
          }}>
            System Reports &amp; Exports
          </h2>
        </div>
        <p style={{ fontSize: 13, color: st.textMuted, margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>
          Generate and download official OJT documentation and statistics
        </p>
      </div>

      {/* ── Action Bar ───────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
      }}>
        {/* Left: Generate button */}
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 16px',
          borderRadius: st.radiusMd,
          border: 'none',
          background: st.brand,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          boxShadow: st.shadowBrand,
          transition: 'all 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
          letterSpacing: '-0.01em',
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = st.brandHover;
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(255,122,48,.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = st.brand;
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = st.shadowBrand;
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Generate Custom Report
        </button>

        {/* Right: Filters */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label htmlFor="semesterSelect" style={{ fontSize: 10.5, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
              Semester
            </label>
            <Select
              id="semesterSelect"
              value={semester}
              onChange={setSemester}
              style={{ width: 160 }}
              popupMatchSelectWidth={false}
              suffixIcon={<ChevronDown size={13} color={st.textMuted} />}
              options={[
                { value: 'SUMMER_2026', label: 'Summer 2026' },
                { value: 'SPRING_2026', label: 'Spring 2026' },
                { value: 'FALL_2025', label: 'Fall 2025' },
                { value: 'AY_2025_26', label: 'AY 2025–2026' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <label htmlFor="categorySelect" style={{ fontSize: 10.5, fontWeight: 700, color: st.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
              Category
            </label>
            <Select
              id="categorySelect"
              value={category}
              onChange={setCategory}
              style={{ width: 170 }}
              popupMatchSelectWidth={false}
              suffixIcon={<ChevronDown size={13} color={st.textMuted} />}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'END_OF_TERM', label: 'End-of-Term' },
                { value: 'PLACEMENT', label: 'Placement' },
                { value: 'ENTERPRISE_FEEDBACK', label: 'Enterprise Feedback' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Templates Section ───────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: st.textPrimary, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            Quick Templates
          </h3>
          <span style={{ fontSize: 10.5, color: st.textMuted, fontFamily: 'Inter, sans-serif' }}>
            One-click export for the most common report types
          </span>
        </div>
        <div className="reports-grid">
          {REPORT_TEMPLATES.map((tpl, i) => (
            <TemplateCard key={tpl.id} template={tpl} index={i} onExport={handleExport} />
          ))}
        </div>
      </div>

      {/* ── Report History Table ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <div style={{
          background: st.surface,
          border: `1px solid ${st.border}`,
          borderRadius: st.radiusXl,
          boxShadow: st.shadowSm,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: `1px solid ${st.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: st.textPrimary, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
                Recent Generated Reports
              </div>
              <div style={{ fontSize: 12, color: st.textMuted, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>
                Downloads and management history
              </div>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: st.textMuted,
              background: st.neutralBg,
              padding: '3px 9px',
              borderRadius: st.radiusFull,
              fontFamily: 'Inter, sans-serif',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {reportHistory.length} reports
            </span>
          </div>

          <div style={{ overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
            <Table
              className="reports-tab-table"
              columns={historyColumns}
              dataSource={reportHistory}
              rowKey="key"
              pagination={false}
              size="middle"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No reports generated yet.' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsTab;
