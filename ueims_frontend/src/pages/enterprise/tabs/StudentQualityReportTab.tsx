import React, { useEffect, useMemo, useState } from 'react';
import { App, Spin, Select, Empty, Tag } from 'antd';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import {
    BookOpen,
    Users,
    Award,
    CheckCircle2,
    XCircle,
    TrendingUp,
    RefreshCw,
    Layers,
} from 'lucide-react';
import { SemesterService, type SemesterResponse } from '@/services/SemesterService';
import {
    EnterpriseAnalyticsService,
    type MajorQualityRow,
} from '@/services/EnterpriseAnalyticsService';
import { cc, hexToRgba } from './dashboardTokens';

// ============================================================
// HELPERS
// ============================================================
const ALL_SEMESTERS = '__ALL__';

function gpaColor(gpa: number | null): { color: string; bg: string; label: string } {
    if (gpa == null) return { color: cc.textMuted, bg: cc.neutralBg, label: 'N/A' };
    if (gpa >= 3.6) return { color: '#065F46', bg: '#D1FAE5', label: gpa.toFixed(2) };
    if (gpa >= 3.0) return { color: '#1E40AF', bg: '#DBEAFE', label: gpa.toFixed(2) };
    if (gpa >= 2.0) return { color: '#92400E', bg: '#FEF3C7', label: gpa.toFixed(2) };
    return { color: '#991B1B', bg: '#FEE2E2', label: gpa.toFixed(2) };
}

function passRateColor(rate: number): string {
    if (rate >= 70) return cc.success;
    if (rate >= 40) return cc.warning;
    return cc.error;
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
const CardWrapper: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
    hoverable?: boolean;
}> = ({ children, style, hoverable = false }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => hoverable && setHovered(true)}
            onMouseLeave={() => hoverable && setHovered(false)}
            style={{
                backgroundColor: cc.surface,
                borderRadius: cc.radiusLg,
                border: `1px solid ${cc.border}`,
                boxShadow: hovered && hoverable ? cc.shadowMd : cc.shadowSm,
                transition: 'box-shadow 0.15s ease',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

const SectionTitle: React.FC<{ icon?: React.ReactNode; title: string; subtitle?: string }> = ({
    icon,
    title,
    subtitle,
}) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && (
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: cc.radiusMd,
                        backgroundColor: hexToRgba(cc.brand, 0.1),
                        color: cc.brand,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </div>
            )}
            <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: cc.textPrimary }}>
                    {title}
                </h3>
                {subtitle && (
                    <div style={{ fontSize: 12, color: cc.textSecondary, marginTop: 2 }}>{subtitle}</div>
                )}
            </div>
        </div>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export const StudentQualityReportTab: React.FC = () => {
    const { message } = App.useApp();

    const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>(ALL_SEMESTERS);
    const [rows, setRows] = useState<MajorQualityRow[]>([]);
    const [loadingSemesters, setLoadingSemesters] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);

    // Load semesters once
    useEffect(() => {
        const load = async () => {
            try {
                const list = await SemesterService.getAllSemesters();
                setSemesters(list);

                // Default: prefer ACTIVE semester; fall back to most recent
                const active = list.find((s) => s.status === 'ACTIVE');
                const fallback =
                    active ?? [...list].sort((a, b) => (b.semesterCode || '').localeCompare(a.semesterCode || ''))[0];
                if (fallback) {
                    setSelectedSemester(fallback.semesterId);
                }
            } catch (err: any) {
                message.error('Failed to load semesters.');
            } finally {
                setLoadingSemesters(false);
            }
        };
        load();
    }, [message]);

    // Load report whenever selected semester changes
    const fetchReport = async (semesterId: string) => {
        setLoadingReport(true);
        try {
            const isAll = semesterId === ALL_SEMESTERS;
            const data = await EnterpriseAnalyticsService.getStudentQualityByMajor(
                isAll ? undefined : semesterId,
            );
            setRows(Array.isArray(data) ? data : []);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to load student quality report.';
            message.error(msg);
            setRows([]);
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        if (!loadingSemesters && selectedSemester) {
            fetchReport(selectedSemester);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSemester, loadingSemesters]);

    // ----- Derived aggregations -----
    const summary = useMemo(() => {
        if (rows.length === 0) {
            return {
                totalStudents: 0,
                avgGpa: 0,
                avgFinalGrade: 0,
                totalPassed: 0,
                totalFailed: 0,
                overallPassRate: 0,
                majorCount: 0,
            };
        }
        const totalStudents = rows.reduce((s, r) => s + r.totalStudents, 0);
        const totalPassed = rows.reduce((s, r) => s + r.interviewsPassed, 0);
        const totalFailed = rows.reduce((s, r) => s + r.interviewsFailed, 0);
        const totalInterview = totalPassed + totalFailed;

        // GPA weighted by student count
        const gpaWeightedSum = rows.reduce((s, r) => s + (r.avgGpa ?? 0) * r.totalStudents, 0);
        const avgGpa = totalStudents > 0 ? gpaWeightedSum / totalStudents : 0;

        // Final grade weighted average
        const gradeWeightedSum = rows.reduce(
            (s, r) => s + (r.avgFinalGrade ?? 0) * r.totalStudents,
            0,
        );
        const finalStudents = rows.filter((r) => r.avgFinalGrade != null).reduce((s, r) => s + r.totalStudents, 0);
        const avgFinalGrade = finalStudents > 0 ? gradeWeightedSum / finalStudents : 0;

        return {
            totalStudents,
            avgGpa,
            avgFinalGrade,
            totalPassed,
            totalFailed,
            overallPassRate: totalInterview > 0 ? (totalPassed / totalInterview) * 100 : 0,
            majorCount: rows.length,
        };
    }, [rows]);

    // Chart data: grouped by semester for "All", single semester for specific
    const chartData = useMemo(() => {
        if (selectedSemester === ALL_SEMESTERS) {
            // Group by semesterCode → bars for total students and aggregated pass/fail
            const map = new Map<
                string,
                { semester: string; students: number; passed: number; failed: number; passRate: number }
            >();
            rows.forEach((r) => {
                const key = r.semesterCode;
                const existing = map.get(key) ?? {
                    semester: key,
                    students: 0,
                    passed: 0,
                    failed: 0,
                    passRate: 0,
                };
                existing.students += r.totalStudents;
                existing.passed += r.interviewsPassed;
                existing.failed += r.interviewsFailed;
                existing.passRate =
                    existing.passed + existing.failed > 0
                        ? (existing.passed / (existing.passed + existing.failed)) * 100
                        : 0;
                map.set(key, existing);
            });
            return Array.from(map.values()).map((d) => ({
                semester: d.semester,
                students: d.students,
                passRate: Number(d.passRate.toFixed(1)),
            }));
        }
        // Specific semester → bar per major
        return rows.map((r) => ({
            semester: r.major,
            students: r.totalStudents,
            passRate: r.interviewPassRate,
        }));
    }, [rows, selectedSemester]);

    // ----- Render -----
    if (loadingSemesters) {
        return (
            <div style={{ padding: 80, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 32px', fontFamily: 'Inter, sans-serif' }}>
            {/* ===== Header with semester selector ===== */}
            <CardWrapper style={{ padding: 20, marginBottom: 20 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 22,
                                fontWeight: 800,
                                color: cc.textPrimary,
                            }}
                        >
                            <BookOpen
                                size={22}
                                style={{ verticalAlign: '-4px', marginRight: 8, color: cc.brand }}
                            />
                            Student Quality Report
                        </h2>
                        <div
                            style={{
                                fontSize: 13,
                                color: cc.textSecondary,
                                marginTop: 6,
                            }}
                        >
                            Statistical breakdown of student quality by major that the enterprise has hosted or is currently hosting.
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: cc.textSecondary, fontWeight: 600 }}>
                            Semester:
                        </span>
                        <Select
                            value={selectedSemester}
                            onChange={(val) => setSelectedSemester(val)}
                            style={{ minWidth: 240 }}
                            options={[
                                { value: ALL_SEMESTERS, label: 'All semesters' },
                                ...semesters.map((s) => ({
                                    value: s.semesterId,
                                    label: `${s.name} ${s.status === 'ACTIVE' ? '(Active)' : ''}`,
                                })),
                            ]}
                        />
                        <button
                            onClick={() => fetchReport(selectedSemester)}
                            style={{
                                border: `1px solid ${cc.border}`,
                                backgroundColor: cc.surface,
                                borderRadius: cc.radiusMd,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                color: cc.textSecondary,
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                </div>
            </CardWrapper>

            {/* ===== KPI Row ===== */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 14,
                    marginBottom: 20,
                }}
            >
                <KpiCard
                    icon={<Users size={18} />}
                    label="Total students hosted"
                    value={summary.totalStudents.toLocaleString()}
                    color={cc.info}
                    bg="#EFF6FF"
                />
                <KpiCard
                    icon={<Layers size={18} />}
                    label="Majors"
                    value={summary.majorCount.toString()}
                    color={cc.brand}
                    bg="#FFF8F0"
                />
                <KpiCard
                    icon={<TrendingUp size={18} />}
                    label="Average GPA"
                    value={summary.avgGpa.toFixed(2)}
                    color="#7C3AED"
                    bg="#F5F3FF"
                />
                <KpiCard
                    icon={<CheckCircle2 size={18} />}
                    label="Interview pass rate"
                    value={`${summary.overallPassRate.toFixed(1)}%`}
                    color={passRateColor(summary.overallPassRate)}
                    bg={hexToRgba(passRateColor(summary.overallPassRate), 0.08)}
                    sublabel={`${summary.totalPassed} pass / ${summary.totalFailed} fail`}
                />
                <KpiCard
                    icon={<Award size={18} />}
                    label="Average final grade"
                    value={summary.avgFinalGrade > 0 ? summary.avgFinalGrade.toFixed(2) : '—'}
                    color="#0891B2"
                    bg="#ECFEFF"
                />
            </div>

            {/* ===== Chart ===== */}
            <CardWrapper style={{ padding: 20, marginBottom: 20 }}>
                <SectionTitle
                    icon={<TrendingUp size={16} />}
                    title={
                        selectedSemester === ALL_SEMESTERS
                            ? 'Student count & pass rate by semester'
                            : 'Student count & pass rate by major'
                    }
                />
                {loadingReport ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin />
                    </div>
                ) : chartData.length === 0 ? (
                    <Empty description="No data for the selected semester." />
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={cc.borderSubtle} />
                            <XAxis
                                dataKey="semester"
                                tick={{ fontSize: 12, fill: cc.textSecondary }}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12, fill: cc.textSecondary }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                                tick={{ fontSize: 12, fill: cc.textSecondary }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: cc.radiusMd,
                                    border: `1px solid ${cc.border}`,
                                    boxShadow: cc.shadowMd,
                                }}
                                formatter={(value: any, name: any) => {
                                    if (name === 'Pass Rate (%)') {
                                        return [`${Number(value).toFixed(1)}%`, name];
                                    }
                                    return [value, name];
                                }}
                            />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="students"
                                name="Students"
                                fill={cc.brand}
                                radius={[6, 6, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="passRate"
                                name="Pass Rate (%)"
                                fill={cc.success}
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardWrapper>

            {/* ===== Detailed table by major × semester ===== */}
            <CardWrapper style={{ padding: 20 }}>
                <SectionTitle
                    icon={<Layers size={16} />}
                    title={
                        selectedSemester === ALL_SEMESTERS
                            ? 'Breakdown by major × semester'
                            : 'Breakdown by major'
                    }
                    subtitle={
                        selectedSemester === ALL_SEMESTERS
                            ? 'Each row is a (semester, major) pair the enterprise has hosted students for.'
                            : 'All majors within the selected semester.'
                    }
                />
                {loadingReport ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin />
                    </div>
                ) : rows.length === 0 ? (
                    <Empty description="No data available." />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: cc.neutralBg }}>
                                    {selectedSemester === ALL_SEMESTERS && (
                                        <Th>Semester</Th>
                                    )}
                                    <Th>Major</Th>
                                    <Th align="center">Students</Th>
                                    <Th align="center">Avg GPA</Th>
                                    <Th align="center">Pass</Th>
                                    <Th align="center">Fail</Th>
                                    <Th align="center">Pass Rate</Th>
                                    <Th align="center">Avg Final Grade</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, idx) => {
                                    const gc = gpaColor(r.avgGpa);
                                    const totalIv = r.interviewsPassed + r.interviewsFailed;
                                    return (
                                        <tr
                                            key={`${r.semesterId}-${r.major}-${idx}`}
                                            style={{
                                                borderTop: `1px solid ${cc.borderSubtle}`,
                                            }}
                                        >
                                            {selectedSemester === ALL_SEMESTERS && (
                                                <Td>
                                                    <Tag color="orange">{r.semesterCode}</Tag>
                                                </Td>
                                            )}
                                            <Td>
                                                        <span
                                                            style={{ fontWeight: 600, color: cc.textPrimary }}
                                                        >
                                                            {r.major}
                                                        </span>
                                            </Td>
                                            <Td align="center">{r.totalStudents}</Td>
                                            <Td align="center">
                                                <span
                                                    style={{
                                                        color: gc.color,
                                                        backgroundColor: gc.bg,
                                                        padding: '2px 10px',
                                                        borderRadius: cc.radiusFull,
                                                        fontWeight: 700,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {gc.label}
                                                </span>
                                            </Td>
                                            <Td align="center">
                                                <span
                                                    style={{
                                                        color: cc.success,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {r.interviewsPassed}
                                                </span>
                                            </Td>
                                            <Td align="center">
                                                <span
                                                    style={{
                                                        color: r.interviewsFailed > 0 ? cc.error : cc.textMuted,
                                                        fontWeight: r.interviewsFailed > 0 ? 600 : 400,
                                                    }}
                                                >
                                                    {r.interviewsFailed}
                                                </span>
                                            </Td>
                                            <Td align="center">
                                                {totalIv === 0 ? (
                                                    <span style={{ color: cc.textMuted }}>—</span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: passRateColor(r.interviewPassRate),
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {r.interviewPassRate.toFixed(1)}%
                                                    </span>
                                                )}
                                            </Td>
                                            <Td align="center">
                                                {r.avgFinalGrade != null ? (
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color:
                                                                r.avgFinalGrade >= 5
                                                                    ? cc.success
                                                                    : r.avgFinalGrade >= 3.5
                                                                    ? cc.warning
                                                                    : cc.error,
                                                        }}
                                                    >
                                                        {r.avgFinalGrade.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: cc.textMuted }}>—</span>
                                                )}
                                            </Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardWrapper>
        </div>
    );
};

// ============================================================
// SUB COMPONENTS
// ============================================================
const KpiCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    bg: string;
    sublabel?: string;
}> = ({ icon, label, value, color, bg, sublabel }) => (
    <CardWrapper style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: cc.radiusMd,
                    backgroundColor: bg,
                    color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </div>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: cc.textSecondary,
                }}
            >
                {label}
            </div>
        </div>
        <div
            style={{
                fontSize: 26,
                fontWeight: 800,
                color: cc.textPrimary,
                lineHeight: 1.1,
            }}
        >
            {value}
        </div>
        {sublabel && (
            <div
                style={{
                    fontSize: 11,
                    color: cc.textMuted,
                    marginTop: 4,
                }}
            >
                {sublabel}
            </div>
        )}
    </CardWrapper>
);

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'center' }> = ({
    children,
    align = 'left',
}) => (
    <th
        style={{
            padding: '10px 12px',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: cc.textSecondary,
            textAlign: align,
            borderBottom: `1px solid ${cc.border}`,
        }}
    >
        {children}
    </th>
);

const Td: React.FC<{ children: React.ReactNode; align?: 'left' | 'center' }> = ({
    children,
    align = 'left',
}) => (
    <td
        style={{
            padding: '12px',
            color: cc.textPrimary,
            textAlign: align,
            verticalAlign: 'middle',
        }}
    >
        {children}
    </td>
);
