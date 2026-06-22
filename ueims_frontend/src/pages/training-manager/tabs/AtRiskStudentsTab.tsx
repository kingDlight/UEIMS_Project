import React, { useState, useEffect, useCallback } from 'react';
import { Table, App, Button, Segmented, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Download, AlertTriangle, RefreshCw, Mail, UserCheck, Mail as MailIcon, Info } from 'lucide-react';
import { AtRiskStudentService } from '@/services/AtRiskStudentService';
import { SemesterService } from '@/services/SemesterService';
import type { AtRiskStudent } from '../types';

const st = {
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
  shadowSm: '0 1px 3px rgba(0,0,0,.08)',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  success: '#10B981',
  successMuted: '#D1FAE5',
  purple: '#8B5CF6',
  purpleMuted: '#EDE9FE',
  blue: '#3B82F6',
  blueMuted: '#DBEAFE',
};

const RISK_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  REPORT: { bg: st.blueMuted, text: st.blue, border: '#BFDBFE' },
  UNPLACED: { bg: st.warningMuted, text: st.warning, border: '#FDE68A' },
  BLOCKED: { bg: st.errorMuted, text: st.error, border: '#FECACA' },
  DEADLINE: { bg: st.purpleMuted, text: st.purple, border: '#C4B5FD' },
};

const RISK_CATEGORY_LABELS: Record<string, string> = {
  REPORT: 'Report Missed',
  UNPLACED: 'Unplaced',
  BLOCKED: 'Blocked',
  DEADLINE: 'Deadline Risk',
};

const ALL_TABS = ['ALL', 'UNPLACED', 'REPORT', 'BLOCKED', 'DEADLINE'];

export const AtRiskStudentsTab: React.FC = () => {
  const { message } = App.useApp();
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchData = useCallback(async () => {
    if (!activeSemesterId) return;
    try {
      setLoading(true);
      const data = await AtRiskStudentService.getAtRiskStudents(activeSemesterId);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load at-risk students', err);
      message.error('Failed to load At-Risk Students data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [activeSemesterId, message]);

  useEffect(() => {
    const init = async () => {
      try {
        const activeSem = await SemesterService.getActiveSemester();
        if (activeSem) {
          setActiveSemesterId(activeSem.semesterId);
        }
      } catch (err) {
        console.error('Failed to load semester', err);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    if (activeSemesterId) {
      void fetchData();
    }
  }, [activeSemesterId, fetchData]);

  useEffect(() => {
    let result = students;
    if (activeTab !== 'ALL') {
      result = result.filter(s => s.riskCategory === activeTab);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        s =>
          s.studentName?.toLowerCase().includes(kw) ||
          s.studentCode?.toLowerCase().includes(kw) ||
          s.companyName?.toLowerCase().includes(kw) ||
          s.riskReason?.toLowerCase().includes(kw)
      );
    }
    setFilteredStudents(result);
  }, [students, activeTab, searchKeyword]);

  const handleExport = async () => {
    if (!activeSemesterId) return;
    try {
      const blob = await AtRiskStudentService.exportAtRiskStudents(activeSemesterId);
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AtRiskStudents_List_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
      message.success('Export successful');
    } catch {
      message.error('Export failed');
    }
  };

  const countByCategory = (cat: string) =>
    cat === 'ALL' ? students.length : students.filter(s => s.riskCategory === cat).length;

  const PriorityBar: React.FC<{ score?: number }> = ({ score }) => {
    const pct = Math.min(100, score || 0);
    const color = pct >= 80 ? st.error : pct >= 50 ? st.warning : st.success;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <div style={{ flex: 1, height: 6, background: st.borderSubtle, borderRadius: 999 }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>{pct}</span>
      </div>
    );
  };

  const columns: ColumnsType<AtRiskStudent> = [
    {
      title: 'STUDENT CODE',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{code || '—'}</span>
      ),
    },
    {
      title: 'FULL NAME',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string) => (
        <span style={{ fontSize: 13.5, fontWeight: 600, color: st.textPrimary }}>{name || '—'}</span>
      ),
    },
    {
      title: 'ENTERPRISE',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 160,
      render: (company: string) => (
        <span style={{ fontSize: 13, color: st.textSecondary }}>{company || '—'}</span>
      ),
    },
    {
      title: 'RISK CATEGORY',
      dataIndex: 'riskCategory',
      key: 'riskCategory',
      width: 140,
      render: (cat: string) => {
        const style = RISK_CATEGORY_COLORS[cat] || { bg: st.neutralBg, text: st.textMuted, border: st.border };
        return (
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            color: style.text,
            background: style.bg,
            border: `1px solid ${style.border}`,
            padding: '2px 8px',
            borderRadius: 999,
          }}>
            {RISK_CATEGORY_LABELS[cat] || cat || 'UNKNOWN'}
          </span>
        );
      },
    },
    {
      title: 'RISK REASON',
      dataIndex: 'riskReason',
      key: 'riskReason',
      width: 280,
      render: (reason: string) => (
        <span style={{ fontSize: 12.5, color: st.textSecondary, lineHeight: 1.4 }} title={reason}>
          {reason ? (reason.length > 60 ? reason.slice(0, 60) + '…' : reason) : '—'}
        </span>
      ),
    },
    {
      title: 'PRIORITY',
      dataIndex: 'priorityScore',
      key: 'priorityScore',
      width: 140,
      render: (score: number) => <PriorityBar score={score} />,
    },
    {
      title: 'MISSED / REJECTED',
      key: 'reports',
      width: 140,
      align: 'center' as const,
      render: (_: unknown, record: AtRiskStudent) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: (record.missedReports || 0) > 0 ? st.error : st.textPrimary,
            background: (record.missedReports || 0) > 0 ? st.errorMuted : 'transparent',
            padding: '2px 6px', borderRadius: 4,
          }}>
            {(record.missedReports || 0)} missed
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: (record.rejectedReports || 0) > 0 ? st.error : st.textPrimary,
            background: (record.rejectedReports || 0) > 0 ? st.errorMuted : 'transparent',
            padding: '2px 6px', borderRadius: 4,
          }}>
            {(record.rejectedReports || 0)} rejected
          </span>
        </div>
      ),
    },
    {
      title: 'DAYS AT RISK',
      dataIndex: 'daysAtRisk',
      key: 'daysAtRisk',
      width: 100,
      align: 'center' as const,
      render: (days: number) => (
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: (days || 0) >= 14 ? st.error : (days || 0) >= 7 ? st.warning : st.textPrimary,
        }}>
          {(days || 0) > 0 ? `${days}d` : '—'}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: AtRiskStudent) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {record.riskCategory === 'UNPLACED' && (
            <Button
              size="small"
              icon={<UserCheck size={12} />}
              style={{ borderRadius: st.radiusMd, fontWeight: 600, fontSize: 11 }}
              onClick={() => message.info('Manual Match: coming soon')}
            >
              Match
            </Button>
          )}
          <Button
            size="small"
            icon={<MailIcon size={12} />}
            style={{ borderRadius: st.radiusMd, fontWeight: 600, fontSize: 11 }}
            onClick={() => {
              const subject = encodeURIComponent(`[UEIMS] At-Risk: ${record.studentName} (${record.studentCode})`);
              window.location.href = `mailto:?subject=${subject}`;
            }}
          >
            Email
          </Button>
          <Button
            size="small"
            icon={<Info size={12} />}
            style={{ borderRadius: st.radiusMd, fontWeight: 600, fontSize: 11 }}
            onClick={() => message.info(`Detail: ${record.riskReason}`)}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  const tabCounts = ALL_TABS.map(tab => ({
    key: tab,
    label: tab === 'ALL'
      ? `All (${countByCategory('ALL')})`
      : `${RISK_CATEGORY_LABELS[tab] || tab} (${countByCategory(tab)})`,
  }));

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 24px 40px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: st.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={22} color={st.error} />
            At-Risk Students
          </h2>
          <p style={{ fontSize: 13, color: st.textMuted, margin: '4px 0 0' }}>
            Monitor students at risk of failing or missing required reports during OJT.
            Covers: unplaced, report missed, blocked, and deadline risks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            icon={<RefreshCw size={14} />}
            onClick={() => void fetchData()}
            loading={loading}
            style={{ borderRadius: st.radiusMd, fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<Download size={14} />}
            onClick={handleExport}
            style={{ borderRadius: st.radiusMd, fontWeight: 600, background: st.textPrimary }}
          >
            Export List
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: st.surface, backdropFilter: 'blur(16px)',
        border: `1px solid ${st.border}`, borderRadius: st.radiusLg,
        padding: '14px 16px', marginBottom: 16, display: 'flex',
        gap: 12, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <Segmented
          value={activeTab}
          onChange={(val) => setActiveTab(val as string)}
          options={tabCounts}
          style={{ fontWeight: 600 }}
        />
        <div style={{ marginLeft: 'auto' }}>
          <Input.Search
            placeholder="Search student name, code, enterprise…"
            allowClear
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: 280, borderRadius: st.radiusMd }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { key: 'UNPLACED', label: 'Unplaced', color: st.warning },
          { key: 'REPORT', label: 'Report Missed', color: st.blue },
          { key: 'BLOCKED', label: 'Blocked', color: st.error },
          { key: 'DEADLINE', label: 'Deadline Risk', color: st.purple },
        ].map(item => {
          const count = countByCategory(item.key);
          return (
            <div key={item.key} style={{
              background: RISK_CATEGORY_COLORS[item.key]?.bg || st.neutralBg,
              border: `1px solid ${RISK_CATEGORY_COLORS[item.key]?.border || st.border}`,
              borderRadius: st.radiusMd, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: item.color, marginTop: 4, opacity: 0.8 }}>{item.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${st.border}`, borderRadius: st.radiusLg,
        boxShadow: st.shadowSm, overflow: 'hidden',
      }}>
        <Table
          rowKey="studentId"
          columns={columns}
          dataSource={filteredStudents}
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: st.textMuted }}>
                <AlertTriangle size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>No at-risk students found</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {activeTab !== 'ALL' ? `No students in category "${activeTab}"` : 'All students are currently in good standing'}
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};
