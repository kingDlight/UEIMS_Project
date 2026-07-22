import React, { useState, useEffect, useCallback } from 'react';
import { Table, App, Button, Segmented, Input, Select, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Download, AlertTriangle, RefreshCw, Mail, UserCheck, Mail as MailIcon, Eye, X, Calendar, Briefcase, AlertCircle } from 'lucide-react';
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
  const [detailRecord, setDetailRecord] = useState<AtRiskStudent | null>(null);

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
      render: (name: string, record: AtRiskStudent) => (
        <button
          onClick={() => setDetailRecord(record)}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 13.5, fontWeight: 600, color: st.textPrimary,
            fontFamily: 'Inter, sans-serif',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
          title="Click to view risk details"
        >
          {name || '—'}
          <Eye size={12} color={st.textMuted} strokeWidth={2} />
        </button>
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
      title: 'PRIORITY',
      dataIndex: 'priorityScore',
      key: 'priorityScore',
      width: 140,
      sorter: (a: AtRiskStudent, b: AtRiskStudent) => (a.priorityScore || 0) - (b.priorityScore || 0),
      defaultSortOrder: 'descend' as const,
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
      width: 110,
      align: 'center' as const,
      sorter: (a: AtRiskStudent, b: AtRiskStudent) => (a.daysAtRisk || 0) - (b.daysAtRisk || 0),
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
      width: 110,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: unknown, record: AtRiskStudent) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <Button
            size="small"
            icon={<MailIcon size={12} />}
            style={{ borderRadius: st.radiusMd, fontWeight: 600, fontSize: 11 }}
            disabled={!record.studentEmail}
            title={record.studentEmail ? `Send alert to ${record.studentEmail}` : 'No email on file'}
            onClick={() => {
              const target = record.studentEmail;
              if (!target) {
                message.warning('Student has no email on file');
                return;
              }
              Modal.confirm({
                title: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={16} color={st.error} strokeWidth={2.2} />
                    Send At-Risk alert?
                  </span>
                ),
                icon: null,
                content: (
                  <div style={{ paddingTop: 6, fontFamily: 'Inter, sans-serif' }}>
                    <p style={{ margin: '0 0 12px', fontSize: 13.5, color: st.textSecondary, lineHeight: 1.55 }}>
                      Are you sure you want to send an alert email to
                      {' '}<strong style={{ color: st.textPrimary }}>{record.studentName}</strong>{' '}
                      (<span style={{ fontFamily: 'monospace', color: st.textPrimary }}>{record.studentCode}</span>)?
                    </p>
                    <div style={{
                      background: st.neutralBg,
                      border: `1px solid ${st.border}`,
                      borderRadius: st.radiusMd,
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 12,
                    }}>
                      <Mail size={14} color={st.textMuted} strokeWidth={2} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: st.textPrimary, fontFamily: 'monospace' }}>
                        {target}
                      </span>
                    </div>
                    <div style={{
                      background: st.errorMuted,
                      border: '1px solid #FECACA',
                      borderRadius: st.radiusMd,
                      padding: '10px 12px',
                      display: 'flex', gap: 8,
                    }}>
                      <AlertCircle size={14} color={st.error} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: 12, color: st.error, lineHeight: 1.45 }}>
                        <strong>Risk:</strong> {RISK_CATEGORY_LABELS[record.riskCategory || ''] || record.riskCategory || 'UNKNOWN'} ·
                        {' '}<strong>Priority:</strong> {record.priorityScore || 0}/100 ·
                        {' '}<strong>Reason:</strong> {record.riskReason || '—'}
                      </div>
                    </div>
                  </div>
                ),
                okText: 'Yes, send email',
                cancelText: 'No',
                okButtonProps: {
                  icon: <MailIcon size={12} />,
                  style: { background: st.textPrimary, borderColor: st.textPrimary, fontWeight: 600 },
                },
                cancelButtonProps: { style: { fontWeight: 600 } },
                centered: true,
                async onOk() {
                  if (!activeSemesterId) return;
                  try {
                    const res = await AtRiskStudentService.sendAlertEmail(
                      record.studentId,
                      activeSemesterId
                    );
                    message.success(res.message || `Alert email sent to ${target}`);
                  } catch (err: unknown) {
                    const msg =
                      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                      'Failed to send alert email';
                    message.error(msg);
                  }
                },
              });
            }}
          >
            Email
          </Button>
        </div>
      ),
    },
  ];

  const tabCounts = ALL_TABS.map(tab => ({
    value: tab,
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
          scroll={{ x: 900 }}
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

      {/* Risk Details Modal */}
      <Modal
        open={!!detailRecord}
        onCancel={() => setDetailRecord(null)}
        footer={null}
        width={560}
        centered
        closeIcon={<X size={18} strokeWidth={2} />}
        title={
          detailRecord ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: st.errorMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={20} color={st.error} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: st.textPrimary, lineHeight: 1.2 }}>
                  Risk Details
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: st.textMuted, marginTop: 2 }}>
                  {detailRecord.studentName} · {detailRecord.studentCode}
                </div>
              </div>
            </div>
          ) : null
        }
      >
        {detailRecord && (
          <div style={{ fontFamily: 'Inter, sans-serif', paddingTop: 8 }}>
            {/* Risk Category + Priority */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {(() => {
                const cat = detailRecord.riskCategory || '';
                const style = RISK_CATEGORY_COLORS[cat] || { bg: st.neutralBg, text: st.textMuted, border: st.border };
                return (
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    color: style.text, background: style.bg,
                    border: `1px solid ${style.border}`,
                    padding: '4px 10px', borderRadius: 999,
                  }}>
                    {RISK_CATEGORY_LABELS[cat] || cat || 'UNKNOWN'}
                  </span>
                );
              })()}
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: (detailRecord.priorityScore || 0) >= 80 ? st.error :
                       (detailRecord.priorityScore || 0) >= 50 ? st.warning : st.success,
                background: (detailRecord.priorityScore || 0) >= 80 ? st.errorMuted :
                            (detailRecord.priorityScore || 0) >= 50 ? st.warningMuted : st.successMuted,
                border: '1px solid transparent',
                padding: '4px 10px', borderRadius: 999,
              }}>
                Priority {detailRecord.priorityScore || 0}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: (detailRecord.daysAtRisk || 0) >= 14 ? st.error :
                       (detailRecord.daysAtRisk || 0) >= 7 ? st.warning : st.textPrimary,
                background: st.neutralBg,
                padding: '4px 10px', borderRadius: 999,
              }}>
                {detailRecord.daysAtRisk || 0} days at risk
              </span>
            </div>

            {/* Risk Reason (full text) */}
            <div style={{
              background: st.errorMuted,
              border: `1px solid #FECACA`,
              borderRadius: st.radiusLg,
              padding: '14px 16px',
              marginBottom: 18,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: st.error, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Risk Reason
              </div>
              <div style={{ fontSize: 13.5, color: st.textPrimary, lineHeight: 1.55 }}>
                {detailRecord.riskReason || 'No reason provided.'}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
              <div style={{
                background: st.neutralBg, border: `1px solid ${st.border}`,
                borderRadius: st.radiusMd, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 11, color: st.textMuted, fontWeight: 600, marginBottom: 4 }}>Missed Reports</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: (detailRecord.missedReports || 0) > 0 ? st.error : st.textPrimary, lineHeight: 1 }}>
                  {detailRecord.missedReports || 0}
                </div>
              </div>
              <div style={{
                background: st.neutralBg, border: `1px solid ${st.border}`,
                borderRadius: st.radiusMd, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 11, color: st.textMuted, fontWeight: 600, marginBottom: 4 }}>Rejected</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: (detailRecord.rejectedReports || 0) > 0 ? st.error : st.textPrimary, lineHeight: 1 }}>
                  {detailRecord.rejectedReports || 0}
                </div>
              </div>
              <div style={{
                background: st.neutralBg, border: `1px solid ${st.border}`,
                borderRadius: st.radiusMd, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 11, color: st.textMuted, fontWeight: 600, marginBottom: 4 }}>Applications</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: st.textPrimary, lineHeight: 1 }}>
                  {detailRecord.applicationCount || 0}
                </div>
              </div>
            </div>

            {/* Enterprise / Supervisor */}
            <div style={{
              background: st.neutralBg, border: `1px solid ${st.border}`,
              borderRadius: st.radiusLg, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={14} color={st.textMuted} strokeWidth={2} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: st.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Enterprise</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: st.textPrimary, marginTop: 2 }}>
                    {detailRecord.companyName || '—'}
                  </div>
                </div>
              </div>
              {detailRecord.supervisorName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: `1px solid ${st.borderSubtle}` }}>
                  <UserCheck size={14} color={st.textMuted} strokeWidth={2} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: st.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supervisor</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: st.textPrimary, marginTop: 2 }}>
                      {detailRecord.supervisorName}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: `1px solid ${st.borderSubtle}` }}>
                <Calendar size={14} color={st.textMuted} strokeWidth={2} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: st.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semester</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: st.textPrimary, marginTop: 2 }}>
                    {detailRecord.semesterCode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
