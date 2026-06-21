import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Button, Input, Modal, Select, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  WarningOutlined,
  SearchOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { WeeklyReportService } from '@/services/WeeklyReportService';

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
  studentName?: string;
  studentCode?: string;
  studentEmail?: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; tagColor: string }> = {
  PENDING_REVIEW: { label: 'Pending Review', color: 'text-amber-500', bg: 'bg-amber-500/10', tagColor: 'orange' },
  APPROVED: { label: 'Approved', color: 'text-emerald-500', bg: 'bg-emerald-500/10', tagColor: 'success' },
  REJECTED: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10', tagColor: 'error' },
  DRAFT: { label: 'Draft', color: 'text-slate-500', bg: 'bg-slate-500/10', tagColor: 'default' },
  NOT_SUBMITTED: { label: 'Not Submitted', color: 'text-slate-500', bg: 'bg-slate-500/10', tagColor: 'default' },
  REVIEWED: { label: 'Reviewed', color: 'text-blue-500', bg: 'bg-blue-500/10', tagColor: 'processing' },
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
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <div className="px-6 pb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">Weekly Reports</h2>
          <p className="text-sm text-slate-500 m-0">Review and provide feedback on student progress</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Search by student"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-60"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-44"
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
        <div className="p-16 text-center text-red-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <WarningOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">Unable to load weekly reports</div>
          <div className="text-sm text-slate-500 mb-3">{error}</div>
          <Button type="primary" onClick={fetchReports} className="bg-[#E67E22] border-[#E67E22]">Try Again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <FileTextOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">No weekly reports yet</div>
          <div className="text-sm text-slate-500">Reports submitted by your assigned students will appear here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-6">
          {filtered.map(r => {
            const meta = STATUS_META[r.status ?? 'PENDING_REVIEW'] ?? STATUS_META.PENDING_REVIEW;
            const isAnomaly = (r.plagiarismScore ?? 0) >= 0.85;
            return (
              <div
                key={r.reportId}
                onClick={() => setSelected(r)}
                className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{r.studentName ?? 'Student'}</div>
                    <div className="text-xs text-slate-500">Week {r.weekNumber} · {r.submittedAt ? dayjs(r.submittedAt).format('MMM D, YYYY') : '—'}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.bg} ${meta.color}`}>{meta.label}</span>
                </div>
                {isAnomaly && (
                  <div className="text-xs text-red-500 flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 rounded-lg">
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
            <div className="font-extrabold text-slate-900">
              {selected.studentName} — Week {selected.weekNumber}
            </div>
          }
          open={!!selected}
          onCancel={() => { if (!submitting) { setSelected(null); setFeedback(''); } }}
          footer={null}
          width={680}
          destroyOnHidden
        >
          <div className="flex flex-col gap-3.5 max-h-[480px] overflow-y-auto px-0.5 py-1">
            <div className="flex items-center justify-between gap-2">
              <Tag color={(STATUS_META[selected.status ?? 'PENDING_REVIEW'] ?? STATUS_META.PENDING_REVIEW).tagColor}>
                {(STATUS_META[selected.status ?? 'PENDING_REVIEW'] ?? STATUS_META.PENDING_REVIEW).label}
              </Tag>
              {(selected.plagiarismScore ?? 0) >= 0.85 && (
                <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-bold">
                  <WarningOutlined /> Plagiarism {Math.round((selected.plagiarismScore ?? 0) * 100)}%
                </span>
              )}
            </div>
            {(selected.plagiarismScore ?? 0) >= 0.85 && (
              <div className="px-3 py-2.5 bg-red-50 border border-red-500/30 rounded-xl text-xs text-red-500">
                This report has been flagged for potential plagiarism (Score: {Math.round((selected.plagiarismScore ?? 0) * 100)}%). Proceed with caution.
              </div>
            )}
            <Section label="Tasks Completed" value={selected.tasksCompleted} />
            <Section label="Issues / Challenges" value={selected.issuesChallenges} />
            <Section label="Lessons Learned" value={selected.lessonsLearned} />
            <Section label="Plan for Next Week" value={selected.planNextWeek} />
            {selected.feedback && (
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600">
                <strong>Previous feedback:</strong> {selected.feedback}
              </div>
            )}
          </div>
          {selected.status !== 'APPROVED' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 mb-1.5">
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
              <div className="flex gap-2 justify-end mt-3">
                <Button danger icon={<CloseCircleOutlined />} loading={submitting && confirmOpen === 'REJECT'} onClick={() => setConfirmOpen('REJECT')}>
                  Reject
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={submitting && confirmOpen === 'APPROVE'}
                  onClick={() => setConfirmOpen('APPROVE')}
                  disabled={(selected.plagiarismScore ?? 0) >= 0.85}
                  className="bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600"
                >
                  Approve
                </Button>
              </div>
              {(selected.plagiarismScore ?? 0) >= 0.85 && (
                <div className="text-[11px] text-red-500 mt-1.5 text-right">
                  <LockOutlined /> Approve is disabled due to high plagiarism score. Use Reject or contact the Training Manager.
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      <Modal
        title={
          <div className="font-extrabold text-slate-900">
            {confirmOpen === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
          </div>
        }
        open={!!confirmOpen}
        onCancel={() => { if (!submitting) { setConfirmOpen(null); } }}
        footer={null}
        width={460}
      >
        <p className="text-[13px] text-slate-600 mb-2">
          Are you sure you want to <strong>{confirmOpen === 'APPROVE' ? 'approve' : 'reject'}</strong> this report?
        </p>
        <TextArea rows={2} value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={500} showCount />
        <div className="flex gap-2 justify-end mt-3">
          <Button onClick={() => setConfirmOpen(null)} disabled={submitting}>Back</Button>
          <Button
            danger={confirmOpen === 'REJECT'}
            type="primary"
            loading={submitting}
            onClick={handleConfirm}
            className={confirmOpen === 'APPROVE' ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600" : ""}
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
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
    <div
      className="text-[13px] text-slate-900 leading-relaxed p-2.5 bg-slate-50 rounded-lg whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: value && value.trim() ? value : '<em style="color:#94A3B8">No content</em>' }}
    />
  </div>
);
