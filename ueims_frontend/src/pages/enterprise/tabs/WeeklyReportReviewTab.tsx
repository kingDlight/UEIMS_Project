import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Button, Input, Modal, Select, Empty, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  WarningOutlined,
  SearchOutlined,
  LockOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { WeeklyReportService } from '@/services/WeeklyReportService';
import { c } from '../constants';

const { TextArea } = Input;

type ReportStatus = 'NOT_SUBMITTED' | 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVIEWED';

interface WeeklyReport {
  reportId: string;
  weekNumber: number;
  tasksCompleted?: string;
  issuesChallenges?: string;
  lessonsLearned?: string;
  planNextWeek?: string;
  status?: ReportStatus;
  feedback?: string;
  submittedAt?: string;
  plagiarismScore?: number;
  isAnomaly?: boolean;
  // assignment.student info
  studentName?: string;
  studentCode?: string;
  studentEmail?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_REVIEW: { label: 'Pending Review', color: c.warning, bg: hexToRgba(c.warning, 0.1) },
  APPROVED: { label: 'Approved', color: c.success, bg: hexToRgba(c.success, 0.1) },
  REJECTED: { label: 'Rejected', color: c.error, bg: hexToRgba(c.error, 0.1) },
  DRAFT: { label: 'Draft', color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) },
  NOT_SUBMITTED: { label: 'Not Submitted', color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) },
  REVIEWED: { label: 'Reviewed', color: c.info, bg: hexToRgba(c.info, 0.1) },
};

export const WeeklyReportReviewTab: React.FC = () => {
  const { message } = App.useApp();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<WeeklyReport | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<null | 'APPROVE' | 'REJECT'>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: WeeklyReport[] = await WeeklyReportService.getByEnterprise();
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to load weekly reports.';
      setError(msg);
      message.error(msg);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const filtered = useMemo(() => {
    return reports
      .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
      .filter(r => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (r.studentName ?? '').toLowerCase().includes(q)
          || (r.studentCode ?? '').toLowerCase().includes(q);
      });
  }, [reports, search, statusFilter]);

  const handleConfirm = async () => {
    if (!selected || !confirmOpen) return;
    if (confirmOpen === 'REJECT' && !feedback.trim()) {
      message.warning('Feedback is required when rejecting a report. Please provide a reason.');
      return;
    }
    setSubmitting(true);
    try {
      if (confirmOpen === 'APPROVE') {
        await WeeklyReportService.approveReport(selected.reportId, feedback.trim() || undefined);
        message.success('Report approved. The student has been notified.');
      } else {
        await WeeklyReportService.rejectReport(selected.reportId, feedback.trim());
        message.success('Report has been rejected. Student will be notified to resubmit.');
      }
      setConfirmOpen(null);
      setFeedback('');
      await fetchReports();
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === 1033) {
        message.warning('Feedback is required when rejecting a report. Please provide a reason.');
      } else {
        message.error(msg ?? 'Failed to save review.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Weekly Reports</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Review and provide feedback on student progress</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search by student"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'PENDING_REVIEW', label: 'Pending Review' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchReports}>Refresh</Button>
        </div>
      </div>

      {error && reports.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.error, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <WarningOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Unable to load weekly reports</div>
          <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 12 }}>{error}</div>
          <Button type="primary" onClick={fetchReports} style={{ background: c.brand, borderColor: c.brand }}>Try Again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <FileTextOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No weekly reports yet</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Reports submitted by your assigned students will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 24px' }}>
          {filtered.map(r => {
            const meta = STATUS_META[r.status ?? 'PENDING_REVIEW'] ?? STATUS_META.PENDING_REVIEW;
            const isAnomaly = (r.plagiarismScore ?? 0) >= 0.85;
            return (
              <div
                key={r.reportId}
                onClick={() => setSelected(r)}
                style={{
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  borderRadius: c.radiusLg,
                  padding: 16,
                  cursor: 'pointer',
                  boxShadow: c.shadowSm,
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = c.shadowMd)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = c.shadowSm)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{r.studentName ?? 'Student'}</div>
                    <div style={{ fontSize: 12, color: c.textMuted }}>Week {r.weekNumber} · {r.submittedAt ? dayjs(r.submittedAt).format('MMM D, YYYY') : '—'}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: c.radiusFull, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                </div>
                {isAnomaly && (
                  <div style={{ fontSize: 12, color: c.error, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: c.errorMuted, borderRadius: c.radiusSm }}>
                    <WarningOutlined /> Plagiarism score: {Math.round((r.plagiarismScore ?? 0) * 100)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <Modal
          title={
            <div style={{ fontWeight: 800, color: c.text }}>
              {selected.studentName} — Week {selected.weekNumber}
            </div>
          }
          open={!!selected}
          onCancel={() => { if (!submitting) { setSelected(null); setFeedback(''); } }}
          footer={null}
          width={680}
          destroyOnHidden
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 480, overflowY: 'auto', padding: '4px 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Tag color={(STATUS_META[selected.status ?? 'PENDING_REVIEW'] ?? STATUS_META.PENDING_REVIEW).color}>
                {(STATUS_META[selected.status ?? 'PENDING_REVIEW'] ?? STATUS_META.PENDING_REVIEW).label}
              </Tag>
              {(selected.plagiarismScore ?? 0) >= 0.85 && (
                <span style={{ padding: '4px 10px', borderRadius: c.radiusSm, background: c.errorMuted, color: c.error, fontSize: 12, fontWeight: 700 }}>
                  <WarningOutlined /> Plagiarism {Math.round((selected.plagiarismScore ?? 0) * 100)}%
                </span>
              )}
            </div>
            {(selected.plagiarismScore ?? 0) >= 0.85 && (
              <div style={{ padding: '10px 12px', background: c.errorMuted, border: `1px solid ${hexToRgba(c.error, 0.3)}`, borderRadius: c.radiusMd, fontSize: 12, color: c.error }}>
                This report has been flagged for potential plagiarism (Score: {Math.round((selected.plagiarismScore ?? 0) * 100)}%). Proceed with caution.
              </div>
            )}
            <Section label="Tasks Completed" value={selected.tasksCompleted} />
            <Section label="Issues / Challenges" value={selected.issuesChallenges} />
            <Section label="Lessons Learned" value={selected.lessonsLearned} />
            <Section label="Plan for Next Week" value={selected.planNextWeek} />
            {selected.feedback && (
              <div style={{ padding: 10, background: c.bgLight, borderRadius: c.radiusSm, fontSize: 12, color: c.textSecondary }}>
                <strong>Previous feedback:</strong> {selected.feedback}
              </div>
            )}
          </div>
          {selected.status !== 'APPROVED' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.borderSubtle}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, marginBottom: 6 }}>
                Feedback / Comments {selected.status === 'PENDING_REVIEW' ? '(optional for Approve, required for Reject)' : ''}
              </div>
              <TextArea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={3}
                maxLength={500}
                showCount
                placeholder="Share thoughts, instructions, or next steps"
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <Button danger icon={<CloseCircleOutlined />} loading={submitting && confirmOpen === 'REJECT'} onClick={() => setConfirmOpen('REJECT')}>
                  Reject
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={submitting && confirmOpen === 'APPROVE'}
                  onClick={() => setConfirmOpen('APPROVE')}
                  disabled={(selected.plagiarismScore ?? 0) >= 0.85}
                  style={{ background: c.success, borderColor: c.success }}
                >
                  Approve
                </Button>
              </div>
              {(selected.plagiarismScore ?? 0) >= 0.85 && (
                <div style={{ fontSize: 11, color: c.error, marginTop: 6, textAlign: 'right' }}>
                  <LockOutlined /> Approve is disabled due to high plagiarism score. Use Reject or contact the Training Manager.
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      <Modal
        title={
          <div style={{ fontWeight: 800, color: c.text }}>
            {confirmOpen === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
          </div>
        }
        open={!!confirmOpen}
        onCancel={() => { if (!submitting) { setConfirmOpen(null); } }}
        footer={null}
        width={460}
      >
        <p style={{ fontSize: 13, color: c.textSecondary, marginBottom: 8 }}>
          Are you sure you want to <strong>{confirmOpen === 'APPROVE' ? 'approve' : 'reject'}</strong> this report?
        </p>
        <TextArea rows={2} value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={500} showCount />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button onClick={() => setConfirmOpen(null)} disabled={submitting}>Back</Button>
          <Button
            danger={confirmOpen === 'REJECT'}
            type="primary"
            loading={submitting}
            onClick={handleConfirm}
            style={confirmOpen === 'APPROVE' ? { background: c.success, borderColor: c.success } : undefined}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Section: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
    <div
      style={{ fontSize: 13, color: c.text, lineHeight: 1.6, padding: 10, background: c.bgLight, borderRadius: c.radiusSm, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      dangerouslySetInnerHTML={{ __html: value && value.trim() ? value : '<em style="color:#94A3B8">No content</em>' }}
    />
  </div>
);
