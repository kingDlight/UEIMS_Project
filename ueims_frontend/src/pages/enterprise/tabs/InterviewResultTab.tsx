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
import { c } from '../constants';

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

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Interview Results</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Record Pass / Fail for candidates who have completed their interview</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchRows}>Refresh</Button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <TrophyOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No completed interviews to grade</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Once a candidate completes an interview, they will appear here for final evaluation.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 24px' }}>
          {sorted.map(r => (
            <div
              key={r.interviewId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: c.radiusMd,
                padding: '14px 18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{r.studentName ?? 'Student'}</span>
                  <span style={{ fontSize: 12, color: c.textMuted }}>· {r.jobTitle ?? '—'}</span>
                </div>
                <div style={{ fontSize: 12, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined /> {r.scheduledTime ? dayjs(r.scheduledTime).format('ddd, MMM D YYYY · HH:mm') : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => { setDecisionOpen({ row: r, decision: 'PASS' }); setNotes(''); }}
                  style={{ background: c.success, borderColor: c.success }}
                >
                  Pass
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => { setDecisionOpen({ row: r, decision: 'FAIL' }); setNotes(''); }}
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
          <div style={{ fontWeight: 800, color: c.text }}>
            Confirm {decisionOpen?.decision === 'PASS' ? 'Pass' : 'Fail'}
          </div>
        }
        open={!!decisionOpen}
        onCancel={() => { if (!submitting) { setDecisionOpen(null); setNotes(''); } }}
        footer={null}
        width={460}
        destroyOnHidden
      >
        <p style={{ fontSize: 13, color: c.textSecondary, marginBottom: 12 }}>
          Are you sure you want to record <strong>{decisionOpen?.decision}</strong> for{' '}
          <strong>{decisionOpen?.row.studentName}</strong>?
        </p>
        {decisionOpen?.decision === 'FAIL' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, marginBottom: 6 }}>
              Evaluation Notes / Feedback <span style={{ color: c.error }}>*</span>
            </div>
            <TextArea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={500}
              showCount
              placeholder="Required: explain why this candidate is being failed"
            />
          </div>
        )}
        {decisionOpen?.decision === 'PASS' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, marginBottom: 6 }}>
              Notes (optional)
            </div>
            <TextArea rows={2} value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => { setDecisionOpen(null); setNotes(''); }} disabled={submitting}>Cancel</Button>
          <Button
            danger={decisionOpen?.decision === 'FAIL'}
            type="primary"
            loading={submitting}
            onClick={handleConfirm}
            style={decisionOpen?.decision === 'PASS' ? { background: c.success, borderColor: c.success } : undefined}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};
