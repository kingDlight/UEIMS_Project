import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Modal, Button, Input } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { InterviewService } from '@/services/InterviewService';

const { TextArea } = Input;

interface InterviewRow {
  interviewId: string;
  studentName?: string;
  jobTitle?: string;
  enterpriseName?: string;
  scheduledTime?: string;
  status?: string;
  result?: string;
  feedback?: string;
}

export const InterviewResultTab: React.FC = () => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionOpen, setDecisionOpen] = useState<{ row: InterviewRow; decision: 'PASS' | 'FAIL' } | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await InterviewService.getMyEnterprise();
      const data: InterviewRow[] = res.data?.result ?? res.data ?? [];
      // Only show completed interviews that don't yet have a result
      setRows(
        (Array.isArray(data) ? data : []).filter(i => (i.status ?? '').toUpperCase() === 'COMPLETED' && !i.result)
      );
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to load interviews.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const handleConfirm = async () => {
    if (!decisionOpen) return;
    if (decisionOpen.decision === 'FAIL' && !notes.trim()) {
      message.warning('Justification notes when failing a candidate.');
      return;
    }
    setSubmitting(true);
    try {
      await InterviewService.recordResult(
        decisionOpen.row.interviewId,
        decisionOpen.decision,
        notes.trim() || undefined
      );
      message.success('Recruitment results saved.');
      setDecisionOpen(null);
      setNotes('');
      await fetchRows();
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === 1033) {
        message.warning('Justification notes when failing a candidate.');
      } else {
        message.error(msg ?? 'Failed to record result.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = useMemo(
    () => [...rows].sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '')),
    [rows]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <div className="px-6 pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">Interview Results</h2>
          <p className="text-[13px] text-slate-500 m-0">Record Pass / Fail for candidates who have completed their interview</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchRows} className="rounded-xl">Refresh</Button>
      </div>

      {sorted.length === 0 ? (
        <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <TrophyOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">No completed interviews to grade</div>
          <div className="text-[13px] text-slate-500">Once a candidate completes an interview, they will appear here for final evaluation.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-6">
          {sorted.map(r => (
            <div
              key={r.interviewId}
              className="grid grid-cols-[1fr_auto] gap-3 items-center bg-white border border-slate-200 rounded-xl px-4.5 py-3.5 hover:shadow-sm transition-shadow"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-bold text-slate-900">{r.studentName ?? 'Student'}</span>
                  <span className="text-[12px] text-slate-500">· {r.jobTitle ?? '—'}</span>
                </div>
                <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
                  <CalendarOutlined className="text-slate-400" /> {r.scheduledTime ? dayjs(r.scheduledTime).format('ddd, MMM D YYYY · HH:mm') : '—'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => { setDecisionOpen({ row: r, decision: 'PASS' }); setNotes(''); }}
                  className="bg-emerald-500 border-emerald-500 rounded-xl font-bold"
                >
                  Pass
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => { setDecisionOpen({ row: r, decision: 'FAIL' }); setNotes(''); }}
                  className="rounded-xl font-bold"
                >
                  Fail
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={
          <div className="font-extrabold text-slate-900 font-sans">
            Confirm {decisionOpen?.decision === 'PASS' ? 'Pass' : 'Fail'}
          </div>
        }
        open={!!decisionOpen}
        onCancel={() => { if (!submitting) { setDecisionOpen(null); setNotes(''); } }}
        footer={null}
        width={460}
        destroyOnHidden
      >
        <p className="text-[13px] text-slate-600 mb-3">
          Are you sure you want to record <strong>{decisionOpen?.decision}</strong> for{' '}
          <strong>{decisionOpen?.row.studentName}</strong>?
        </p>
        {decisionOpen?.decision === 'FAIL' && (
          <div className="mb-3">
            <div className="text-[12px] font-bold text-slate-500 mb-1.5">
              Evaluation Notes / Feedback <span className="text-red-500">*</span>
            </div>
            <TextArea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={500}
              showCount
              placeholder="Required: explain why this candidate is being failed"
              className="rounded-xl"
            />
          </div>
        )}
        {decisionOpen?.decision === 'PASS' && (
          <div className="mb-3">
            <div className="text-[12px] font-bold text-slate-500 mb-1.5">
              Notes (optional)
            </div>
            <TextArea rows={2} value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} className="rounded-xl" />
          </div>
        )}
        <div className="flex gap-2 justify-end mt-2">
          <Button onClick={() => { setDecisionOpen(null); setNotes(''); }} disabled={submitting} className="rounded-xl">Cancel</Button>
          <Button
            danger={decisionOpen?.decision === 'FAIL'}
            type="primary"
            loading={submitting}
            onClick={handleConfirm}
            className={decisionOpen?.decision === 'PASS' ? "bg-emerald-500 border-emerald-500 rounded-xl font-bold" : "rounded-xl font-bold"}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};
