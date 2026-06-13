import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Progress } from 'antd';
import { DashboardService } from '@/services/DashboardService';
import { SemesterService } from '@/services/SemesterService';
import type { SemesterResponse } from '@/services/SemesterService';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Upload,
  Building2,
  SendHorizontal,
  FileBarChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Activity,
  Award,
  Users,
  Briefcase,
  ChevronRight,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
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
} from 'recharts';

// ============================================================
// DESIGN TOKENS — UEIMS Command Center
// ============================================================
export const cc = {
  // Brand
  brand: '#FF7A30',
  brandHover: '#E86A20',
  brandActive: '#CC5A18',
  brandMuted: '#FFF3E8',
  brandSubtle: '#FFF8F0',
  brandStrong: '#9B4A10',

  // Semantic
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

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',

  // Surface
  surface: '#FFFFFF',
  bg: 'transparent',
  neutralBg: '#F9FAFB',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',

  // Radius
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,

  // Shadows
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
  shadowXl: '0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)',
  shadowBrand: '0 4px 12px rgba(255,122,48,0.25)',
  shadowSuccess: '0 4px 12px rgba(16,185,129,0.25)',
  shadowError: '0 4px 12px rgba(239,68,68,0.25)',
  shadowWarning: '0 4px 12px rgba(245,158,11,0.25)',
  shadowInner: 'inset 0 2px 4px rgba(0,0,0,0.04)',
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
// HELPER COMPONENTS
// ============================================================

const CardWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className = '', style, onClick, hoverable = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      animate={{
        y: hovered && hoverable ? -2 : 0,
        boxShadow: hovered && hoverable ? cc.shadowMd : cc.shadowSm,
      }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: cc.surface,
        borderRadius: cc.radiusLg,
        border: `1px solid ${cc.border}`,
        boxShadow: cc.shadowSm,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <span
    className={className}
    style={{
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: cc.textMuted,
      ...style,
    }}
  >
    {children}
  </span>
);

const SeverityBadge: React.FC<{ label: string; severity: 'critical' | 'high' | 'medium' | 'low' | 'info' }> = ({ label, severity }) => {
  const config: Record<string, { bg: string; color: string; borderColor: string }> = {
    critical: { bg: hexToRgba(cc.error, 0.15), color: cc.error, borderColor: hexToRgba(cc.error, 0.45) },
    high: { bg: hexToRgba(cc.warning, 0.15), color: cc.warning, borderColor: hexToRgba(cc.warning, 0.45) },
    medium: { bg: hexToRgba(cc.info, 0.15), color: cc.info, borderColor: hexToRgba(cc.info, 0.45) },
    low: { bg: hexToRgba(cc.textMuted, 0.15), color: cc.textMuted, borderColor: hexToRgba(cc.textMuted, 0.45) },
    info: { bg: hexToRgba(cc.info, 0.15), color: cc.info, borderColor: hexToRgba(cc.info, 0.45) },
  };
  const { bg, color, borderColor } = config[severity] ?? config.info;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: cc.radiusMd,
      backgroundColor: bg,
      border: `1px solid ${borderColor}`,
      color,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
};

const StatusDot: React.FC<{ color: string; pulse?: boolean }> = ({ color, pulse = false }) => (
  <span style={{
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 0 3px ${color}20`,
    animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none',
  }} />
);

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'amber' | 'red' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}> = ({ children, onClick, variant = 'primary', fullWidth = false, size = 'md', icon }) => {
  const variants = {
    primary: { bg: cc.brand, text: '#fff', shadow: cc.shadowBrand },
    amber: { bg: cc.warning, text: '#fff', shadow: cc.shadowWarning },
    red: { bg: cc.error, text: '#fff', shadow: cc.shadowError },
    ghost: { bg: 'transparent', text: cc.brand, shadow: 'none' },
  };
  const { bg, text: textColor, shadow } = variants[variant];
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13 },
    lg: { padding: '11px 20px', fontSize: 14 },
  };
  const { padding, fontSize } = sizes[size];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1, boxShadow: shadow }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 600,
        color: textColor,
        background: bg,
        border: variant === 'ghost' ? `1px solid ${cc.border}` : 'none',
        borderRadius: cc.radiusMd,
        boxShadow: variant === 'ghost' ? 'none' : shadow,
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      {children}
      {icon === false ? null : (icon || <ArrowRight size={size === 'sm' ? 12 : 14} />)}
    </motion.button>
  );
};

const TextLink: React.FC<{ children: React.ReactNode; onClick?: () => void; color?: string }> = ({ children, onClick, color }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ opacity: 0.8, x: 2 }}
    transition={{ duration: 0.15 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      fontWeight: 500,
      color: color || cc.brand,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'Inter, -apple-system, sans-serif',
      borderRadius: cc.radiusMd,
    }}
  >
    {children}
    <ArrowRight size={13} />
  </motion.button>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: `1px solid ${cc.border}`,
        borderRadius: `${cc.radiusMd}px`,
        padding: '8px 12px',
        boxShadow: cc.shadowMd,
        fontFamily: 'Inter, sans-serif'
      }}>
        {label && <p style={{ fontSize: '11px', fontWeight: 700, color: cc.textMuted, margin: '0 0 4px', textTransform: 'uppercase' }}>{label}</p>}
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: index > 0 ? '4px' : '0' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: pld.color || pld.fill }} />
            <span style={{ fontSize: '12.5px', color: cc.textPrimary, fontWeight: 600 }}>
              {pld.name}: {pld.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================
// MAIN COMMAND CENTER COMPONENT
// ============================================================
export const CommandCenterDashboard: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<SemesterResponse | null>(null);

  // Chart & Statistics State
  const [employmentData, setEmploymentData] = useState<any[]>([]);
  const [interviewData, setInterviewData] = useState<any[]>([]);
  const [majorData, setMajorData] = useState<any[]>([]);
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loadingCharts, setLoadingCharts] = useState(false);

  // Tabs selection in Analytics card
  const [activeTab, setActiveTab] = useState<'funnel' | 'reports' | 'employment' | 'majors' | 'grades'>('funnel');

  const navigate = useNavigate();

  // Load basic summary data and list of semesters on mount
  useEffect(() => {
    setMounted(true);
    const initDashboard = async () => {
      try {
        const summaryData = await DashboardService.getCommandCenterSummary();
        setSummary(summaryData);

        const semesterList = await SemesterService.getAllSemesters();
        setSemesters(semesterList);

        const activeSem = semesterList.find(s => s.status === 'ACTIVE') || semesterList[0];
        if (activeSem) {
          setSelectedSemesterId(activeSem.semesterId);
          setSelectedSemester(activeSem);
        }
      } catch (err) {
        console.error('Error initializing dashboard:', err);
      }
    };
    initDashboard();
  }, []);

  // Fetch charts whenever the selected semester changes
  useEffect(() => {
    if (!selectedSemesterId) return;
    const loadSemesterCharts = async () => {
      setLoadingCharts(true);
      try {
        const targetSem = semesters.find(s => s.semesterId === selectedSemesterId) || null;
        setSelectedSemester(targetSem);

        const [emp, iv, maj, grd, avg] = await Promise.allSettled([
          DashboardService.getEmploymentRateChart(selectedSemesterId),
          DashboardService.getInterviewPassRateChart(selectedSemesterId),
          DashboardService.getMajorDistributionChart(selectedSemesterId),
          DashboardService.getGradeDistributionChart(selectedSemesterId),
          DashboardService.getAverageRatingChart(selectedSemesterId)
        ]);

        if (emp.status === 'fulfilled') setEmploymentData(emp.value || []);
        if (iv.status === 'fulfilled') setInterviewData(iv.value || []);
        if (maj.status === 'fulfilled') setMajorData(maj.value || []);
        if (grd.status === 'fulfilled') setGradeData(grd.value || []);
        if (avg.status === 'fulfilled' && avg.value && avg.value[0]) {
          setAverageRating(Number(avg.value[0].value) || 0);
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error('Error loading semester charts:', err);
      } finally {
        setLoadingCharts(false);
      }
    };
    loadSemesterCharts();
  }, [selectedSemesterId, semesters]);

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(`/tm-dashboard/${route}`);
    }
  };

  if (!summary || semesters.length === 0) {
    return <div style={{ padding: 60, textAlign: 'center', color: cc.textMuted, fontFamily: 'Inter, sans-serif' }}>Loading Dashboard Data...</div>;
  }

  // Calculate percentages and counts from dynamic data
  const ojtItem = employmentData.find(d => d.label === 'OJT Students');
  const nonOjtItem = employmentData.find(d => d.label === 'Non-OJT');
  const ojtCount = ojtItem ? Number(ojtItem.value) : 0;
  const nonOjtCount = nonOjtItem ? Number(nonOjtItem.value) : 0;
  const totalStudents = ojtCount + nonOjtCount;
  const employmentRate = totalStudents > 0 ? Math.round((ojtCount / totalStudents) * 100) : 0;

  const passedItem = interviewData.find(d => d.label === 'Passed');
  const failedItem = interviewData.find(d => d.label === 'Failed');
  const passedCount = passedItem ? Number(passedItem.value) : 0;
  const failedCount = failedItem ? Number(failedItem.value) : 0;
  const totalIv = passedCount + failedCount;
  const passRate = totalIv > 0 ? Math.round((passedCount / totalIv) * 100) : 0;

  // Build timeline milestones dynamically
  const buildTimeline = () => {
    if (!selectedSemester) return [];
    const start = new Date(selectedSemester.startDate);
    const end = new Date(selectedSemester.endDate);
    const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
    const gradesDue = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lock = new Date(end.getTime() + 14 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const today = new Date();

    const getStatus = (d: Date, isLast = false) => {
      if (today > d) return 'completed';
      if (today.toDateString() === d.toDateString()) return 'current';
      // If we are between start and end, make end/mid current if relevant
      return 'upcoming';
    };

    const milestones = [
      { label: 'OJT Start', date: formatDate(start), status: getStatus(start) },
      { label: 'Mid-Review', date: formatDate(mid), status: today > start && today < end ? 'current' : getStatus(mid) },
      { label: 'OJT End', date: formatDate(end), status: getStatus(end) },
      { label: 'Grades Due', date: formatDate(gradesDue), status: getStatus(gradesDue) },
      { label: 'Lock', date: formatDate(lock), status: getStatus(lock) },
    ];

    // Find the current active one (first non-completed milestone)
    let hasCurrent = false;
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].status === 'current') {
        hasCurrent = true;
        break;
      }
    }
    if (!hasCurrent) {
      const nextUpcoming = milestones.find(m => m.status === 'upcoming');
      if (nextUpcoming) nextUpcoming.status = 'current';
    }

    return milestones;
  };

  const timelineMilestones = buildTimeline();

  // Dynamic Semester details
  const start = selectedSemester ? new Date(selectedSemester.startDate) : new Date();
  const end = selectedSemester ? new Date(selectedSemester.endDate) : new Date();
  const today = new Date();
  const diffDays = Math.ceil(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const ojtDayText = today > end ? `OJT Completed` : today < start ? `OJT Starts in ${Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days` : `OJT Day ${diffDays} of ${totalDays}`;

  const lockDaysRemaining = selectedSemester ? Math.max(0, Math.ceil(((end.getTime() + 14 * 24 * 60 * 60 * 1000) - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Pie chart colors
  const RADIAN = Math.PI / 185;
  const gradeColors = [cc.success, cc.info, cc.warning, cc.error];
  const emptyChartData = [{ name: 'No data', value: 1 }];

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
    }}>
      {/* Top Header & Semester Selector */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${cc.borderSubtle}`,
        padding: '16px 24px',
        marginBottom: 24,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
              Command Center
            </h1>
            <p style={{ fontSize: 13, color: cc.textSecondary, margin: '4px 0 0' }}>
              Monitor OJT semesters, placements, grading and corporate compliance
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Select
              value={selectedSemesterId}
              onChange={(val) => setSelectedSemesterId(val)}
              style={{ width: 180, fontWeight: 600 }}
              options={semesters.map(s => ({ value: s.semesterId, label: s.name }))}
            />
            {selectedSemester && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: selectedSemester.status === 'ACTIVE' ? cc.success : selectedSemester.status === 'LOCKED' ? cc.error : cc.warning,
                backgroundColor: selectedSemester.status === 'ACTIVE' ? hexToRgba(cc.success, 0.08) : selectedSemester.status === 'LOCKED' ? hexToRgba(cc.error, 0.08) : hexToRgba(cc.warning, 0.08),
                padding: '4px 10px',
                borderRadius: cc.radiusFull,
                border: `1px solid ${selectedSemester.status === 'ACTIVE' ? hexToRgba(cc.success, 0.2) : selectedSemester.status === 'LOCKED' ? hexToRgba(cc.error, 0.2) : hexToRgba(cc.warning, 0.2)}`,
              }}>
                <StatusDot color={selectedSemester.status === 'ACTIVE' ? cc.success : selectedSemester.status === 'LOCKED' ? cc.error : cc.warning} pulse={selectedSemester.status === 'ACTIVE'} />
                {selectedSemester.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px 40px' }}>
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* TOP STAT CARDS ROW */}
              <div className="cc-kpi-grid" style={{ marginBottom: 24 }}>
                {/* Stat 1: Employment/Placement Rate */}
                <CardWrapper style={{ padding: 18, borderLeft: `4px solid ${cc.success}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Label>Placement Rate</Label>
                      <div style={{ fontSize: 28, fontWeight: 800, color: cc.textPrimary, marginTop: 4, letterSpacing: '-0.02em' }}>
                        {employmentRate}%
                      </div>
                      <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 4 }}>
                        {ojtCount} of {totalStudents || 0} students placed
                      </div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.success, 0.16), color: cc.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={20} />
                    </div>
                  </div>
                  <Progress percent={employmentRate} size="small" strokeColor={cc.success} style={{ marginTop: 12, marginBottom: 0 }} />
                </CardWrapper>

                {/* Stat 2: Interview Pass Rate */}
                <CardWrapper style={{ padding: 18, borderLeft: `4px solid ${cc.info}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Label>Interview Pass Rate</Label>
                      <div style={{ fontSize: 28, fontWeight: 800, color: cc.textPrimary, marginTop: 4, letterSpacing: '-0.02em' }}>
                        {passRate}%
                      </div>
                      <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 4 }}>
                        {passedCount} passed of {totalIv || 0} interviews
                      </div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.info, 0.16), color: cc.info, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                  </div>
                  <Progress percent={passRate} size="small" strokeColor={cc.info} style={{ marginTop: 12, marginBottom: 0 }} />
                </CardWrapper>

                {/* Stat 3: Pending Enterprise Approvals */}
                <CardWrapper style={{ padding: 18, borderLeft: `4px solid ${cc.warning}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Label>Corporate Approvals</Label>
                      <div style={{ fontSize: 28, fontWeight: 800, color: cc.textPrimary, marginTop: 4, letterSpacing: '-0.02em' }}>
                        {summary.pendingEnterprises.length}
                      </div>
                      <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 4 }}>
                        Companies awaiting registration
                      </div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.warning, 0.16), color: cc.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <TextLink color={cc.warning} onClick={() => handleNavigate('enterprises')}>Review queue</TextLink>
                  </div>
                </CardWrapper>

                {/* Stat 4: Active Incidents */}
                <CardWrapper style={{ padding: 18, borderLeft: `4px solid ${cc.error}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Label>Active Incidents</Label>
                      <div style={{ fontSize: 28, fontWeight: 800, color: cc.textPrimary, marginTop: 4, letterSpacing: '-0.02em' }}>
                        {summary.activeIncidents.length}
                      </div>
                      <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 4 }}>
                        Open student discipline cases
                      </div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.error, 0.16), color: cc.error, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <TextLink color={cc.error} onClick={() => handleNavigate('incidents')}>Manage incidents</TextLink>
                  </div>
                </CardWrapper>
              </div>

              {/* SEMESTER SUMMARY DETAILS BAR */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: cc.radiusLg,
                border: `1px solid ${cc.borderSubtle}`,
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color={cc.textSecondary} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>
                    {selectedSemester?.name} Timeline:
                  </span>
                  <span style={{ fontSize: 13, color: cc.textSecondary }}>
                    {selectedSemester ? `${new Date(selectedSemester.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${new Date(selectedSemester.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
                  </span>
                  <span style={{ color: cc.border, fontSize: 13 }}>·</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: cc.brand }}>
                    {ojtDayText}
                  </span>
                </div>
                {selectedSemester?.status !== 'LOCKED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: cc.textSecondary }}>Semester lock:</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: cc.radiusFull,
                      backgroundColor: hexToRgba(cc.error, 0.15),
                      border: `1px solid ${hexToRgba(cc.error, 0.35)}`,
                      color: cc.error,
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {lockDaysRemaining} days remaining
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: cc.textMuted, fontWeight: 600 }}>Irrevocably locked</span>
                )}
              </div>

              {/* QUICK ACTIONS ROW (CLEAN TOP UTILITIES) */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: cc.textMuted, marginBottom: 12 }}>
                  Quick Utilities
                </div>
                <div className="cc-grid-4">
                  {[
                    { label: 'Import Students', icon: <Upload size={18} />, desc: 'Bulk load eligible list via Excel', route: 'students' },
                    { label: 'Review Enterprises', icon: <Building2 size={18} />, desc: 'Approve new host companies', route: 'enterprises' },
                    { label: 'Send Reminders', icon: <SendHorizontal size={18} />, desc: 'Alert overdue reports', route: 'incidents' },
                    { label: 'View Reports', icon: <FileBarChart size={18} />, desc: 'Analyze overall grading', route: 'reports' }
                  ].map(action => (
                    <motion.div
                      key={action.label}
                      onClick={() => handleNavigate(action.route)}
                      whileHover={{ y: -2, boxShadow: cc.shadowMd }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: '#FFFFFF',
                        border: `1px solid ${cc.border}`,
                        borderRadius: cc.radiusLg,
                        boxShadow: cc.shadowSm,
                        padding: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.brand, 0.16), color: cc.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {action.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary }}>{action.label}</div>
                        <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 1 }}>{action.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* SPLIT SCREEN WORKSPACE */}
              <div className="cc-main-grid" style={{ marginBottom: 24 }}>
                {/* LEFT COLUMN: PRIMARY WORKSPACE & CHARTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Interactive Analytics Tabs Container */}
                  <CardWrapper style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${cc.borderSubtle}`, paddingBottom: 14, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>Analytics Overview</h3>
                        <p style={{ fontSize: 12, color: cc.textSecondary, margin: '2px 0 0' }}>Visualize OJT status and performance metrics</p>
                      </div>

                      {/* Tab buttons */}
                      <div className="cc-tabs-container">
                        {[
                          { key: 'funnel', label: 'Funnel', icon: <TrendingUp size={14} /> },
                          { key: 'employment', label: 'Employment', icon: <Briefcase size={14} /> },
                          { key: 'majors', label: 'Majors', icon: <Users size={14} /> },
                          { key: 'grades', label: 'Grades', icon: <Award size={14} /> },
                        ].map(t => (
                          <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key as any)}
                            className={`cc-tab-button ${activeTab === t.key ? 'active' : ''}`}
                          >
                            {t.icon}
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Tab Render */}
                    <div style={{ position: 'relative', minHeight: 250 }}>
                      {loadingCharts ? (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.72)', zIndex: 10 }}>
                          <RefreshCw size={24} className="animate-spin" color={cc.brand} />
                        </div>
                      ) : null}

                      {/* Funnel Pipeline Tab */}
                      {activeTab === 'funnel' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontSize: 13, color: cc.textSecondary }}>Placement pipeline stages for {selectedSemester?.name}</span>
                          </div>
                          {/* Funnel display */}
                          {(() => {
                            const pipeline = summary.pipeline;
                            const stages = [
                              { label: 'ELIGIBLE', value: pipeline.eligible, color: cc.info, desc: 'Qualified students' },
                              { label: 'APPLIED', value: pipeline.applied, color: cc.warning, desc: 'Submitted CVs' },
                              { label: 'INTERVIEWED', value: pipeline.interviewed, color: cc.brand, desc: 'Completed interviews' },
                              { label: 'PLACED', value: pipeline.placed, color: cc.success, desc: 'Internship confirmed' },
                            ];
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="cc-funnel-pipeline">
                                  {stages.map((stage, i) => (
                                    <React.Fragment key={stage.label}>
                                      <div style={{
                                        flex: 1,
                                        padding: '16px 12px',
                                        borderRadius: cc.radiusLg,
                                        background: hexToRgba(stage.color, 0.15),
                                        border: `1px solid ${hexToRgba(stage.color, 0.45)}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        position: 'relative'
                                      }}>
                                        <span style={{ fontSize: 24, fontWeight: 800, color: stage.color }}>{stage.value}</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: stage.color, marginTop: 4, letterSpacing: '0.05em' }}>{stage.label}</span>
                                        <span style={{ fontSize: 10, color: cc.textPrimary, fontWeight: 500, marginTop: 2, textAlign: 'center' }}>{stage.desc}</span>
                                      </div>
                                      {i < stages.length - 1 && (
                                        <div style={{ display: 'flex', alignItems: 'center', color: cc.textSecondary }}>
                                          <ChevronRight size={20} />
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: cc.textSecondary, marginBottom: 4 }}>
                                    <span>Placement Progress Rate</span>
                                    <span style={{ fontWeight: 700, color: cc.success }}>{employmentRate}%</span>
                                  </div>
                                  <div style={{ height: 6, borderRadius: cc.radiusFull, backgroundColor: cc.borderSubtle, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${employmentRate}%`, backgroundColor: cc.success, borderRadius: cc.radiusFull }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Employment doughnut and Pass Rate Split View */}
                      {activeTab === 'employment' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                          {/* Placement Doughnut */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>OJT Placements</h4>
                            {employmentData.length > 0 ? (
                              <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={employmentData.map(d => ({ name: d.label, value: d.value }))}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={4}
                                      dataKey="value"
                                    >
                                      <Cell fill={cc.success} />
                                      <Cell fill={cc.border} />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <div style={{ height: 180, display: 'flex', alignItems: 'center', color: cc.textMuted, fontSize: 12 }}>No placement data</div>
                            )}
                            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusDot color={cc.success} /> Placed: {ojtCount}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusDot color={cc.border} /> Non-OJT: {nonOjtCount}</span>
                            </div>
                          </div>

                          {/* Interview Outcomes */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interview Results</h4>
                            {interviewData.length > 0 ? (
                              <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={interviewData.map(d => ({ name: d.label, value: d.value }))}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={4}
                                      dataKey="value"
                                    >
                                      <Cell fill={cc.info} />
                                      <Cell fill={cc.error} />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <div style={{ height: 180, display: 'flex', alignItems: 'center', color: cc.textMuted, fontSize: 12 }}>No interview data</div>
                            )}
                            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusDot color={cc.info} /> Passed: {passedCount}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusDot color={cc.error} /> Failed: {failedCount}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Major Distribution Tab */}
                      {activeTab === 'majors' && (
                        <div>
                          {majorData.length > 0 ? (
                            <div style={{ width: '100%', height: 220 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={majorData.map(d => ({ major: d.label, count: d.value }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cc.borderSubtle} />
                                  <XAxis dataKey="major" tick={{ fontSize: 11, fill: cc.textSecondary }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 11, fill: cc.textSecondary }} axisLine={false} tickLine={false} />
                                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FFF8F0' }} />
                                  <Bar dataKey="count" fill={cc.brand} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.textMuted, fontSize: 12 }}>No major distribution data available</div>
                          )}
                        </div>
                      )}

                      {/* Grade Distribution Tab */}
                      {activeTab === 'grades' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {gradeData.length > 0 && gradeData.some(d => d.value > 0) ? (
                            <>
                              <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={gradeData.map(d => ({ name: d.label, value: d.value }))}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={4}
                                      dataKey="value"
                                    >
                                      {gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={gradeColors[index % gradeColors.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 11, marginTop: 8 }}>
                                {gradeData.map((d, index) => (
                                  <span key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <StatusDot color={gradeColors[index % gradeColors.length]} />
                                    {d.label}: {d.value}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.textMuted, fontSize: 12 }}>No grades published for this semester yet</div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardWrapper>

                  {/* WEEKLY REPORTS COMPLIANCE CARD */}
                  <CardWrapper style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.info}24`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
                          <FileBarChart size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary }}>Weekly Reports Compliance</div>
                          <div style={{ fontSize: 12, color: cc.textSecondary }}>Week {summary.weeklyReports.week} Report Statuses</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cc.success, backgroundColor: hexToRgba(cc.success, 0.18), border: `1px solid ${hexToRgba(cc.success, 0.45)}`, padding: '2px 8px', borderRadius: cc.radiusFull }}>
                        Deadline: Sun 11:59 PM
                      </span>
                    </div>

                    {/* 2x2 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
                      <div style={{ padding: '10px 12px', borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.success, 0.15), border: `1px solid ${hexToRgba(cc.success, 0.35)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: cc.successText, fontWeight: 700 }}>Submitted / Approved</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: cc.success }}>{summary.weeklyReports.submitted}</span>
                      </div>
                      <div style={{ padding: '10px 12px', borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.info, 0.15), border: `1px solid ${hexToRgba(cc.info, 0.35)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: cc.infoText, fontWeight: 700 }}>Pending Review</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: cc.info }}>{summary.weeklyReports.pending}</span>
                      </div>
                      <div style={{ padding: '10px 12px', borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.error, 0.15), border: `1px solid ${hexToRgba(cc.error, 0.35)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: cc.errorText, fontWeight: 700 }}>Late Submissions</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: cc.error }}>{summary.weeklyReports.late}</span>
                      </div>
                      <div style={{ padding: '10px 12px', borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.textMuted, 0.15), border: `1px solid ${hexToRgba(cc.textMuted, 0.35)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: cc.textPrimary, fontWeight: 700 }}>Not Started</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: cc.textSecondary }}>{summary.weeklyReports.notStarted}</span>
                      </div>
                    </div>

                    {/* Students Overdue */}
                    {summary.weeklyReports.students.length > 0 && (
                      <div style={{
                        padding: '12px',
                        borderRadius: cc.radiusMd,
                        backgroundColor: hexToRgba(cc.error, 0.12),
                        border: `1px solid ${hexToRgba(cc.error, 0.35)}`,
                        marginBottom: 16
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: cc.errorText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Students Overdue (Missed Reports)
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {summary.weeklyReports.students.slice(0, 4).map((s: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 13, color: cc.textPrimary, fontWeight: 600 }}>{s.name}</span>
                              <span style={{ fontSize: 11, color: cc.errorText, fontWeight: 700 }}>{s.daysOverdue} days overdue</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: `1px solid ${cc.border}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <TextLink color={cc.brand} onClick={() => handleNavigate('reports')}>Browse reports list</TextLink>
                      <CTAButton variant="primary" size="sm" icon={<SendHorizontal size={12} />} onClick={() => handleNavigate('incidents')}>
                        Send warnings ({summary.weeklyReports.late})
                      </CTAButton>
                    </div>
                  </CardWrapper>
                </div>

                {/* RIGHT COLUMN: ACTION CENTER, TIMELINE & ALERTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* ACTION CENTER CARD */}
                  <CardWrapper style={{ padding: 20 }}>
                    <div style={{ borderBottom: `1px solid ${cc.borderSubtle}`, paddingBottom: 12, marginBottom: 16 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>Attention Required</h3>
                      <p style={{ fontSize: 12, color: cc.textSecondary, margin: '2px 0 0' }}>Pending tasks and active alerts</p>
                    </div>

                    {/* Approvals section */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cc.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Corporate Registrations ({summary.pendingEnterprises.length})</span>
                        <TextLink color={cc.warning} onClick={() => handleNavigate('enterprises')}>Review all</TextLink>
                      </div>

                      {summary.pendingEnterprises.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {summary.pendingEnterprises.slice(0, 2).map((ent: any) => (
                            <div key={ent.id} style={{ padding: '8px 10px', borderRadius: cc.radiusMd, backgroundColor: '#EBF3FC', border: `1px solid ${cc.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: cc.textPrimary }}>{ent.name}</div>
                                <div style={{ fontSize: 10, color: cc.textSecondary, fontWeight: 500 }}>{ent.sector}</div>
                              </div>
                              <span style={{ fontSize: 11, color: cc.warningText, backgroundColor: cc.warningMuted, padding: '2px 6px', borderRadius: cc.radiusMd, fontWeight: 700 }}>
                                {ent.daysWaiting}d ago
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: cc.textMuted, fontStyle: 'italic', padding: '4px 0' }}>No pending enterprises</div>
                      )}
                    </div>

                    {/* Incidents section */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cc.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active incidents ({summary.activeIncidents.length})</span>
                        <TextLink color={cc.error} onClick={() => handleNavigate('incidents')}>Resolve</TextLink>
                      </div>

                      {summary.activeIncidents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {summary.activeIncidents.slice(0, 2).map((inc: any) => (
                            <div key={inc.id} style={{ padding: '8px 10px', borderRadius: cc.radiusMd, backgroundColor: '#FDECEE', border: `1px solid ${cc.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: cc.textPrimary }}>{inc.name}</div>
                                <div style={{ fontSize: 10, color: cc.textSecondary, fontWeight: 500 }}>{inc.enterprise} · {inc.type}</div>
                              </div>
                              <SeverityBadge label={inc.severity} severity={inc.severity} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: cc.textMuted, fontStyle: 'italic', padding: '4px 0' }}>No active incidents</div>
                      )}
                    </div>
                  </CardWrapper>

                  {/* SEMESTER TIMELINE CARD */}
                  <CardWrapper style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <div style={{ width: 32, height: 32, borderRadius: cc.radiusMd, background: `${cc.info}24`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary }}>Semester Milestones</div>
                        <div style={{ fontSize: 12, color: cc.textSecondary }}>Important calendar dates</div>
                      </div>
                    </div>

                    {/* Vertical Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', paddingLeft: 12 }}>
                      {/* Line connecting milestones */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        bottom: 8,
                        left: 17,
                        width: 2,
                        backgroundColor: cc.border,
                        zIndex: 0
                      }} />

                      {timelineMilestones.map((milestone, idx) => {
                        const isCompleted = milestone.status === 'completed';
                        const isCurrent = milestone.status === 'current';
                        let dotColor = cc.textDisabled;
                        let dotBg = '#F3F4F6';
                        let textColor = cc.textSecondary;

                        if (isCompleted) {
                          dotColor = cc.success;
                          dotBg = cc.successMuted;
                          textColor = cc.textPrimary;
                        } else if (isCurrent) {
                          dotColor = cc.warning;
                          dotBg = cc.warningMuted;
                          textColor = cc.warningText;
                        }

                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                            <div style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              border: `2px solid ${dotColor}`,
                              backgroundColor: '#FFFFFF',
                              boxShadow: isCurrent ? `0 0 0 4px ${cc.warning}20` : 'none',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: isCurrent || isCompleted ? 700 : 500, color: textColor }}>
                                {milestone.label}
                              </div>
                              <div style={{ fontSize: 11, color: cc.textSecondary, fontWeight: 500 }}>{milestone.date}</div>
                            </div>
                            {isCurrent && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: cc.warning, backgroundColor: cc.warningMuted, padding: '2px 6px', borderRadius: cc.radiusFull }}>
                                Current
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardWrapper>

                  {/* RECENT ALERTS */}
                  <CardWrapper style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: cc.textPrimary }}>System Flags</span>
                      <span style={{ fontSize: 10, color: cc.textSecondary, backgroundColor: cc.border, padding: '2px 8px', borderRadius: cc.radiusFull, fontWeight: 700 }}>LIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, padding: '8px 10px', borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.error, 0.12), border: `1px solid ${hexToRgba(cc.error, 0.35)}` }}>
                        <AlertTriangle size={16} color={cc.error} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: 11.5, color: cc.errorText, fontWeight: 600 }}>
                          <strong>Critical Incident Escalated:</strong> Student attendance warning filed by FPT Software.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, padding: '8px 10px', borderRadius: cc.radiusMd, backgroundColor: hexToRgba(cc.warning, 0.12), border: `1px solid ${hexToRgba(cc.warning, 0.35)}` }}>
                        <Clock size={16} color={cc.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: 11.5, color: cc.warningText, fontWeight: 600 }}>
                          <strong>System lock warning:</strong> Locked phase starts in {lockDaysRemaining} days.
                        </div>
                      </div>
                    </div>
                  </CardWrapper>
                </div>
              </div>


            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyframe for pulsing dot */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .cc-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .cc-main-grid {
          display: grid;
          grid-template-columns: 7fr 4fr;
          gap: 24px;
        }
        .cc-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .cc-tabs-container {
          display: flex;
          background-color: #F3F4F6;
          padding: 2px;
          border-radius: 8px;
          gap: 2px;
        }
        .cc-tab-button {
          display: flex;
          alignItems: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cc-tab-button:hover {
          color: #1F2937;
        }
        .cc-tab-button.active {
          color: #FF7A30;
          background-color: #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .cc-funnel-pipeline {
          display: flex;
          gap: 8px;
        }
        @media (max-width: 1024px) {
          .cc-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cc-main-grid {
            grid-template-columns: 1fr;
          }
          .cc-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .cc-kpi-grid {
            grid-template-columns: 1fr;
          }
          .cc-grid-4 {
            grid-template-columns: 1fr;
          }
          .cc-funnel-pipeline {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CommandCenterDashboard;
