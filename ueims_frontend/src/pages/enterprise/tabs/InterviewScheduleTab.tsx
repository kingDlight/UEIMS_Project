import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Modal, Button, Input, Select, DatePicker, InputNumber, Form } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  EditOutlined,
  StopOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { InterviewService } from '@/services/InterviewService';
import { ApplicationService } from '@/services/ApplicationService';
import { c } from '../constants';

const { TextArea } = Input;

type InterviewStatus = 'SCHEDULED' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELED' | 'COMPLETED' | 'RESULT_RECORDED' | 'CANCELLED';
type StatusFilter = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELED';

interface InterviewRow {
  interviewId: string;
  applicationId?: string;
  studentName?: string;
  jobTitle?: string;
  enterpriseName?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  status?: InterviewStatus;
  result?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'Scheduled', color: c.info, bg: hexToRgba(c.info, 0.1) },
  CONFIRMED: { label: 'Confirmed', color: c.success, bg: hexToRgba(c.success, 0.1) },
  RESCHEDULED: { label: 'Rescheduled', color: c.warning, bg: hexToRgba(c.warning, 0.1) },
  CANCELED: { label: 'Canceled', color: c.error, bg: hexToRgba(c.error, 0.1) },
  CANCELLED: { label: 'Canceled', color: c.error, bg: hexToRgba(c.error, 0.1) },
  COMPLETED: { label: 'Completed', color: c.textSecondary, bg: hexToRgba(c.textSecondary, 0.1) },
  RESULT_RECORDED: { label: 'Result recorded', color: c.success, bg: hexToRgba(c.success, 0.1) },
};

function statusOf(i: InterviewRow): InterviewStatus {
  return (i.status ?? 'SCHEDULED') as InterviewStatus;
}

function matchesFilter(i: InterviewRow, filter: StatusFilter): boolean {
  const s = statusOf(i);
  if (filter === 'ALL') return true;
  if (filter === 'UPCOMING')
    return s === 'SCHEDULED' || s === 'CONFIRMED' || s === 'RESCHEDULED';
  if (filter === 'COMPLETED') return s === 'COMPLETED' || s === 'RESULT_RECORDED';
  if (filter === 'CANCELED') return s === 'CANCELED' || s === 'CANCELLED';
  return true;
}

export const InterviewScheduleTab: React.FC = () => {
  const { message } = App.useApp();
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InterviewRow | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [proposedSlots, setProposedSlots] = useState<string[]>([]);
  const [proposing, setProposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [rescheduleForm] = Form.useForm();

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await InterviewService.getMyEnterprise();
      const data: InterviewRow[] = res.data?.result ?? res.data ?? [];
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // UC-42 42.0.E1
      const msg = err?.response?.data?.message ?? 'Unable to sync calendar schedules. Please refresh your browser or try again later.';
      setError(msg);
      message.error(msg);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await ApplicationService.getMyEnterprise();
      const data: any[] = res.data?.result ?? res.data ?? [];
      setApplications(
        (Array.isArray(data) ? data : []).filter(
          (a: any) => a.status === 'SCREENING_PASSED' || a.status === 'INTERVIEW_SCHEDULED'
        )
      );
    } catch {
      setApplications([]);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, []);

  const filtered = useMemo(() => {
    return interviews
      .filter(i => matchesFilter(i, filter))
      .filter(i => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (i.studentName ?? '').toLowerCase().includes(q)
          || (i.jobTitle ?? '').toLowerCase().includes(q);
      });
  }, [interviews, filter, search]);

  const handlePropose = async (applicationId: string) => {
    if (!applicationId) return;
    setProposing(true);
    try {
      const res = await InterviewService.proposeSlots(applicationId);
      const data: string[] = res.data?.result ?? res.data ?? [];
      setProposedSlots(Array.isArray(data) ? data : []);
      if (data.length === 0) message.info('No free slots found in the next 2 weeks.');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to fetch proposed slots.');
    } finally {
      setProposing(false);
    }
  };

  const handleSubmitSchedule = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const dt: Dayjs = values.scheduledTime;
      const payload = {
        application: { applicationId: values.applicationId },
        scheduledTime: dt.toISOString(),
        durationMinutes: values.durationMinutes ?? 60,
        location: values.location,
        meetingLink: values.meetingLink,
        status: 'SCHEDULED',
      };
      await InterviewService.create(payload);
      message.success('Interview scheduled successfully.');
      setScheduleOpen(false);
      form.resetFields();
      setProposedSlots([]);
      await fetchInterviews();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === 1053) {
        message.error('Interview time cannot be scheduled in the past. Please select a future time.');
      } else if (code === 1055) {
        message.error('This time overlaps an existing appointment. Please pick a different slot.');
      } else if (code === 1054) {
        message.error('Only applicants who passed the screening phase are eligible for interview scheduling.');
      } else if (code === 1072) {
        message.error(msg ?? 'Interview is not in a valid state.');
      } else {
        message.error(msg ?? 'Failed to schedule interview.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!selected) return;
    try {
      const values = await rescheduleForm.validateFields();
      setSubmitting(true);
      await InterviewService.reschedule(
        selected.interviewId,
        (values.newTime as Dayjs).toISOString(),
        values.reason
      );
      message.success('Interview rescheduled. The student will be notified.');
      setRescheduleOpen(false);
      rescheduleForm.resetFields();
      await fetchInterviews();
    } catch (err: any) {
      if (err?.errorFields) return;
      const msg = err?.response?.data?.message;
      message.error(msg ?? 'Failed to reschedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    if (!cancelReason.trim()) {
      message.warning('Please provide a reason for cancellation.');
      return;
    }
    setSubmitting(true);
    try {
      await InterviewService.cancel(selected.interviewId, cancelReason);
      message.success('Interview canceled. The student will be notified.');
      setCancelOpen(false);
      setCancelReason('');
      await fetchInterviews();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to cancel interview.');
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Interview Schedule</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Manage all upcoming and past interview appointments</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search by student or job"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={filter}
            onChange={(v: StatusFilter) => setFilter(v)}
            style={{ width: 140 }}
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'UPCOMING', label: 'Upcoming' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELED', label: 'Canceled' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchInterviews}>Refresh</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setProposedSlots([]);
              setScheduleOpen(true);
            }}
            style={{ background: c.brand, borderColor: c.brand }}
          >
            Schedule Interview
          </Button>
        </div>
      </div>

      {error && interviews.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.error, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <CalendarOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Unable to sync calendar schedules</div>
          <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 12 }}>{error}</div>
          <Button type="primary" onClick={fetchInterviews} style={{ background: c.brand, borderColor: c.brand }}>Try Again</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <CalendarOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No interviews match your filter</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Try changing the filter or schedule a new interview above.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 24px' }}>
          {filtered.map(i => {
            const meta = STATUS_META[statusOf(i)] ?? STATUS_META.SCHEDULED;
            return (
              <div
                key={i.interviewId}
                onClick={() => setSelected(i)}
                style={{
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  borderRadius: c.radiusLg,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: selected?.interviewId === i.interviewId ? c.shadowMd : c.shadowSm,
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = c.shadowMd)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = selected?.interviewId === i.interviewId ? c.shadowMd : c.shadowSm)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{i.studentName ?? 'Student'}</div>
                    <div style={{ fontSize: 12, color: c.textMuted }}>{i.jobTitle ?? '—'}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: c.radiusFull, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: c.textSecondary }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ color: c.textMuted }} />
                    {i.scheduledTime ? dayjs(i.scheduledTime).format('ddd, MMM D YYYY · HH:mm') : '—'}
                  </div>
                  {i.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <EnvironmentOutlined style={{ color: c.textMuted }} /> {i.location}
                    </div>
                  )}
                  {i.meetingLink && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LinkOutlined style={{ color: c.textMuted }} /> <a href={i.meetingLink} target="_blank" rel="noreferrer">Open meeting</a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div style={{ position: 'fixed', right: 0, top: 64, bottom: 0, width: 360, background: c.surface, borderLeft: `1px solid ${c.border}`, padding: 20, overflowY: 'auto', boxShadow: '-8px 0 24px rgba(15,23,42,0.08)', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Interview Details</div>
            <Button size="small" onClick={() => setSelected(null)}>Close</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <Row label="Student" value={selected.studentName ?? '—'} />
            <Row label="Job post" value={selected.jobTitle ?? '—'} />
            <Row label="Enterprise" value={selected.enterpriseName ?? '—'} />
            <Row label="Time" value={selected.scheduledTime ? dayjs(selected.scheduledTime).format('ddd, MMM D YYYY · HH:mm') : '—'} />
            <Row label="Duration" value={selected.durationMinutes ? `${selected.durationMinutes} min` : '—'} />
            <Row label="Location" value={selected.location ?? '—'} />
            <Row label="Meeting link" value={selected.meetingLink ?? '—'} />
            <Row label="Status" value={STATUS_META[statusOf(selected)]?.label ?? statusOf(selected)} />
            {selected.result && <Row label="Result" value={selected.result} />}
          </div>
          {(() => {
            const s = statusOf(selected);
            if (s === 'CANCELED' || s === 'CANCELLED' || s === 'COMPLETED' || s === 'RESULT_RECORDED') return null;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
                <Button block icon={<EditOutlined />} onClick={() => { rescheduleForm.resetFields(); setRescheduleOpen(true); }}>
                  Reschedule
                </Button>
                <Button block danger icon={<StopOutlined />} onClick={() => { setCancelReason(''); setCancelOpen(true); }}>
                  Cancel Interview
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Schedule new modal */}
      <Modal
        title={<div style={{ fontWeight: 800, color: c.text }}>Schedule Interview</div>}
        open={scheduleOpen}
        onCancel={() => { if (!submitting) { setScheduleOpen(false); setProposedSlots([]); } }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="Candidate / Application" name="applicationId" rules={[{ required: true, message: 'Please pick an application' }]}>
            <Select
              placeholder="Select a screened candidate"
              showSearch
              optionFilterProp="label"
              options={applications.map(a => ({
                value: a.applicationId ?? a.id,
                label: `${a.studentName ?? 'Student'} — ${a.jobPostTitle ?? a.jobTitle ?? 'Post'}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Date & time" name="scheduledTime" rules={[{ required: true, message: 'Required' }]}>
            <DatePicker
              showTime={{ format: 'HH:mm', minuteStep: 15 }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={d => d && d.isBefore(dayjs().startOf('day'))}
            />
          </Form.Item>
          <Form.Item label="Duration (minutes)" name="durationMinutes" initialValue={60}>
            <InputNumber min={15} max={240} step={15} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Location" name="location">
            <Input placeholder="Office address (optional if online)" />
          </Form.Item>
          <Form.Item label="Online meeting link" name="meetingLink" rules={[{ type: 'url', message: 'Must be a valid URL', warningOnly: true }]}>
            <Input placeholder="https://meet..." />
          </Form.Item>
          <div style={{ marginBottom: 12 }}>
            <Button
              size="small"
              loading={proposing}
              onClick={async () => {
                const appId = form.getFieldValue('applicationId');
                if (!appId) {
                  message.warning('Pick an application first.');
                  return;
                }
                await handlePropose(appId);
              }}
            >
              Propose open slots
            </Button>
            {proposedSlots.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proposedSlots.map(s => (
                  <Button
                    key={s}
                    size="small"
                    onClick={() => form.setFieldsValue({ scheduledTime: dayjs(s) })}
                    style={{ borderColor: c.brand, color: c.brand }}
                  >
                    {dayjs(s).format('MMM D · HH:mm')}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setScheduleOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmitSchedule} style={{ background: c.brand, borderColor: c.brand }}>
              Save Schedule
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        title={<div style={{ fontWeight: 800, color: c.text }}>Reschedule Interview</div>}
        open={rescheduleOpen}
        onCancel={() => { if (!submitting) setRescheduleOpen(false); }}
        footer={null}
        width={460}
        destroyOnHidden
      >
        <Form form={rescheduleForm} layout="vertical" preserve={false}>
          <Form.Item label="New date & time" name="newTime" rules={[{ required: true }]}>
            <DatePicker
              showTime={{ format: 'HH:mm', minuteStep: 15 }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={d => d && d.isBefore(dayjs().startOf('day'))}
            />
          </Form.Item>
          <Form.Item label="Reason (optional)" name="reason">
            <TextArea rows={2} maxLength={300} placeholder="Why are you rescheduling?" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setRescheduleOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleReschedule} style={{ background: c.brand, borderColor: c.brand }}>
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Cancel modal */}
      <Modal
        title={<div style={{ fontWeight: 800, color: c.text }}>Cancel Interview</div>}
        open={cancelOpen}
        onCancel={() => { if (!submitting) setCancelOpen(false); }}
        footer={null}
        width={460}
        destroyOnHidden
      >
        <p style={{ fontSize: 13, color: c.textSecondary, marginBottom: 8 }}>
          Please provide a reason. The student will be notified via email.
        </p>
        <TextArea
          rows={3}
          maxLength={500}
          showCount
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation"
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={submitting}>Back</Button>
          <Button danger loading={submitting} onClick={handleCancel}>Confirm cancellation</Button>
        </div>
      </Modal>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', background: c.bgLight, borderRadius: c.radiusSm }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: 13, color: c.text, wordBreak: 'break-word' }}>{value}</div>
  </div>
);
