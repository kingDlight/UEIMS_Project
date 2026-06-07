import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Table, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  GraduationCap,
  Building2,
  Users,
} from 'lucide-react';

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
};

// Alias for backward compatibility with ReportsTab & WeeklyReportsTab
export const st = cc;

// ============================================================
// DATA
// ============================================================
const PLACEMENT_DATA = [
  { name: 'Placed', value: 88, color: cc.success },
  { name: 'Searching', value: 12, color: cc.warning },
];

const GPA_DATA = [
  { major: 'SE', avgGpa: 3.4 },
  { major: 'IA', avgGpa: 3.2 },
  { major: 'AI', avgGpa: 3.6 },
  { major: 'Graphic Design', avgGpa: 3.1 },
  { major: 'CS', avgGpa: 3.5 },
  { major: 'CE', avgGpa: 2.9 },
];

const TREND_DATA = [
  { month: 'Jan', placed: 62, searching: 18 },
  { month: 'Feb', placed: 68, searching: 14 },
  { month: 'Mar', placed: 71, searching: 11 },
  { month: 'Apr', placed: 75, searching: 9 },
  { month: 'May', placed: 80, searching: 6 },
  { month: 'Jun', placed: 88, searching: 4 },
];

const MAJOR_TABLE_DATA = [
  { key: '1', major: 'Software Engineering (SE)', total: 186, placed: 171, rate: 92, avgGpa: 3.4 },
  { key: '2', major: 'Information Assurance (IA)', total: 124, placed: 108, rate: 87, avgGpa: 3.2 },
  { key: '3', major: 'Artificial Intelligence (AI)', total: 98, placed: 92, rate: 94, avgGpa: 3.6 },
  { key: '4', major: 'Graphic Design', total: 76, placed: 61, rate: 80, avgGpa: 3.1 },
  { key: '5', major: 'Computer Science (CS)', total: 142, placed: 128, rate: 90, avgGpa: 3.5 },
  { key: '6', major: 'Computer Engineering (CE)', total: 89, placed: 71, rate: 80, avgGpa: 2.9 },
];

// ============================================================
// CUSTOM TOOLTIP — SaaS styled white card
// ============================================================
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  payload?: { rate?: number };
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  unit?: string;
}> = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: cc.surface,
        border: `1px solid ${cc.border}`,
        borderRadius: cc.radiusLg,
        boxShadow: cc.shadowMd,
        padding: '10px 14px',
        fontFamily: 'Inter, sans-serif',
        minWidth: 120,
      }}
    >
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 5 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: cc.textSecondary, fontWeight: 500 }}>
            {entry.name}
          </span>
          <span style={{ fontSize: 12.5, color: cc.textPrimary, fontWeight: 700, marginLeft: 'auto', paddingLeft: 16 }}>
            {entry.value}{unit}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// METRIC CARD
// ============================================================
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  bgMuted: string;
  index: number;
}> = ({ label, value, suffix, icon, color, bgMuted, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }}
    style={{
      background: cc.surface,
      border: `1px solid ${cc.border}`,
      borderRadius: cc.radiusLg,
      padding: '18px 20px',
      boxShadow: cc.shadowSm,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: '1 1 200px',
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, lineHeight: 1 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: cc.textPrimary, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 14, fontWeight: 700, color: cc.textSecondary, fontFamily: 'Inter, sans-serif' }}>
            {suffix}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: cc.textMuted, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
        {label}
      </div>
    </div>
  </motion.div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export const StatsTab: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPlaced = MAJOR_TABLE_DATA.reduce((s, r) => s + r.placed, 0);
  const totalStudents = MAJOR_TABLE_DATA.reduce((s, r) => s + r.total, 0);
  const overallRate = Math.round((totalPlaced / totalStudents) * 100);

  const columns: ColumnsType<typeof MAJOR_TABLE_DATA[0]> = [
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Major</span>,
      dataIndex: 'major',
      key: 'major',
      render: (text: string) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>{text}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total</span>,
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (v: number) => <span style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{v}</span>,
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Placed</span>,
      dataIndex: 'placed',
      key: 'placed',
      align: 'right',
      render: (v: number) => <span style={{ fontSize: 13, fontWeight: 700, color: cc.success, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{v}</span>,
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Avg GPA</span>,
      dataIndex: 'avgGpa',
      key: 'avgGpa',
      align: 'center',
      render: (v: number) => (
        <span style={{ fontSize: 13, fontWeight: 700, color: v < 2.5 ? cc.warning : cc.textPrimary, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {v.toFixed(1)}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Placement Rate</span>,
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
          <Progress
            percent={rate}
            size="small"
            strokeColor={cc.success}
            trailColor={cc.borderSubtle}
            format={() => (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: cc.success, fontFamily: 'Inter, sans-serif' }}>
                {rate}%
              </span>
            )}
            style={{ width: 120 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="stats-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .stats-table .ant-table-thead > tr > th {
          background: ${cc.neutralBg} !important;
          border-bottom: 1px solid ${cc.border} !important;
          padding: 10px 14px !important;
        }
        .stats-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${cc.borderSubtle} !important;
          padding: 13px 14px !important;
        }
        .stats-table .ant-table-tbody > tr:hover > td {
          background: ${cc.brandSubtle} !important;
          transition: background 0.15s ease;
        }
        .stats-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .stats-table .ant-progress-inner {
          background: ${cc.borderSubtle} !important;
        }
        .stats-table .ant-progress-text {
          display: none !important;
        }
        .stats-table .ant-progress-bg {
          transition: width 0.6s cubic-bezier(0.32, 0.72, 0, 1) !important;
        }
        .stats-container {
          padding: 0 24px 40px;
        }
        .stats-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .stats-container {
            padding: 0 12px 100px;
          }
          .stats-charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: cc.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
          Statistics &amp; Analytics
        </h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: '4px 0 0' }}>
          OJT placement performance, GPA distribution, and enterprise participation
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <MetricCard index={0} label="Placement Rate" value={overallRate} suffix="%" icon={<TrendingUp size={20} color={cc.success} />} color={cc.success} bgMuted={cc.successMuted} />
        <MetricCard index={1} label="Avg GPA" value="3.2" icon={<GraduationCap size={20} color={cc.info} />} color={cc.info} bgMuted={cc.infoMuted} />
        <MetricCard index={2} label="Total Enterprises" value={124} icon={<Building2 size={20} color={cc.brand} />} color={cc.brand} bgMuted={cc.brandMuted} />
        <MetricCard index={3} label="Student Participation" value="92" suffix="%" icon={<Users size={20} color={cc.warning} />} color={cc.warning} bgMuted={cc.warningMuted} />
      </div>

      {/* Charts Section — 2-column grid */}
      <div ref={containerRef} className="stats-charts-grid">
        {/* LEFT: Donut Chart */}
        <div style={{ background: cc.surface, border: `1px solid ${cc.border}`, borderRadius: cc.radiusLg, boxShadow: cc.shadowSm, padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: cc.textPrimary, marginBottom: 4 }}>Placement Overview</div>
          <div style={{ fontSize: 12, color: cc.textMuted, marginBottom: 20 }}>Placed vs. still searching — current semester</div>
          <div style={{ height: 220, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLACEMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={98}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={true}
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {PLACEMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={4} />
                  ))}
                </Pie>
                <text x="50%" y="43%" textAnchor="middle" dominantBaseline="central" fill={cc.textPrimary} fontSize={28} fontWeight={800} fontFamily="Inter, sans-serif" letterSpacing="-0.03em">
                  {overallRate}%
                </text>
                <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" fill={cc.textMuted} fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif">
                  Placed
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8, padding: '0 8px' }}>
            {PLACEMENT_DATA.map((entry) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: cc.textSecondary, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{entry.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>{entry.value}%</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginLeft: 'auto' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: cc.border, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: cc.textSecondary, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Total</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>{totalStudents}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Bar Chart */}
        <div style={{ background: cc.surface, border: `1px solid ${cc.border}`, borderRadius: cc.radiusLg, boxShadow: cc.shadowSm, padding: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: cc.textPrimary, marginBottom: 4 }}>GPA by Major</div>
          <div style={{ fontSize: 12, color: cc.textMuted, marginBottom: 16 }}>Average GPA distribution across majors</div>
          <div style={{ height: 220, minHeight: 0, paddingRight: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GPA_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A30" />
                    <stop offset="100%" stopColor="#FFB088" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={cc.borderSubtle} strokeDasharray="4 4" />
                <XAxis dataKey="major" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: cc.textMuted, fontFamily: 'Inter, sans-serif' }} />
                <YAxis domain={[0, 4]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: cc.textMuted, fontFamily: 'Inter, sans-serif' }} tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip content={<CustomTooltip unit=" GPA" />} cursor={{ fill: cc.brandSubtle, radius: 6 }} />
                <Bar 
                  dataKey="avgGpa" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={52} 
                  isAnimationActive={true}
                  animationBegin={400}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom: Trend Area Chart */}
      <div style={{ background: cc.surface, border: `1px solid ${cc.border}`, borderRadius: cc.radiusLg, boxShadow: cc.shadowSm, padding: 20, marginBottom: 16, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>Placement Trend</div>
            <div style={{ fontSize: 12, color: cc.textMuted, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>Monthly placement progress — current academic year</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ label: 'Placed', color: cc.success }, { label: 'Searching', color: cc.warning }].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: cc.textSecondary, fontFamily: 'Inter, sans-serif' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 160, minHeight: 0, paddingRight: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="placedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cc.success} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={cc.success} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cc.warning} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={cc.warning} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={cc.borderSubtle} strokeDasharray="4 4" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: cc.textMuted, fontFamily: 'Inter, sans-serif' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: cc.textMuted, fontFamily: 'Inter, sans-serif' }} />
              <Tooltip content={<CustomTooltip unit=" students" />} />
              <Area 
                type="monotone" 
                dataKey="placed" 
                stroke={cc.success} 
                strokeWidth={2.5} 
                fill="url(#placedGrad)" 
                dot={{ r: 4, fill: cc.success, strokeWidth: 0 }} 
                activeDot={{ r: 5, fill: cc.success, strokeWidth: 0 }} 
                isAnimationActive={true}
                animationBegin={600}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Area 
                type="monotone" 
                dataKey="searching" 
                stroke={cc.warning} 
                strokeWidth={2.5} 
                fill="url(#searchGrad)" 
                dot={{ r: 4, fill: cc.warning, strokeWidth: 0 }} 
                activeDot={{ r: 5, fill: cc.warning, strokeWidth: 0 }} 
                isAnimationActive={true}
                animationBegin={800}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Table */}
      <div style={{ background: cc.surface, border: `1px solid ${cc.border}`, borderRadius: cc.radiusLg, boxShadow: cc.shadowSm, overflowX: 'auto', maxWidth: '100%', minWidth: 0 }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${cc.borderSubtle}` }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: cc.textPrimary, fontFamily: 'Inter, sans-serif' }}>Performance by Major</div>
          <div style={{ fontSize: 12, color: cc.textMuted, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>OJT placement rates and GPA averages across all majors — AY 2025–2026</div>
        </div>
        <Table
          className="stats-table"
          columns={columns}
          dataSource={MAJOR_TABLE_DATA}
          rowKey="key"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  );
};

export default StatsTab;
