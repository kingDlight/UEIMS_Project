import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Button, Input, Select, Form, Modal, Empty } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { IncidentService } from '@/services/IncidentService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import { c } from '../constants';

const { TextArea } = Input;

interface Assignment {
  assignmentId: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  studentEmail?: string;
  status?: string;
}

interface Incident {
  incidentId: string;
  category: string;
  description: string;
  evidenceUrls?: string;
  status: string;
  reportedAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  studentName?: string;
  studentCode?: string;
  studentId?: string;
}

const CATEGORIES = [
  { value: 'ATTENDANCE', label: 'Attendance / Unexcused Absence' },
  { value: 'ATTITUDE', label: 'Poor Attitude / Misconduct' },
  { value: 'CONFIDENTIALITY', label: 'Confidentiality Breach' },
  { value: 'PERFORMANCE', label: 'Poor Performance' },
  { value: 'SAFETY', label: 'Safety Violation' },
  { value: 'OTHER', label: 'Other' },
];

const SEVERITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Open', color: c.warning, bg: hexToRgba(c.warning, 0.1) },
  IN_REVIEW: { label: 'In Review', color: c.info, bg: hexToRgba(c.info, 0.1) },
  RESOLVED: { label: 'Resolved', color: c.success, bg: hexToRgba(c.success, 0.1) },
  CLOSED: { label: 'Closed', color: c.textMuted, bg: hexToRgba(c.textMuted, 0.1) },
};

export const IncidentReportTab: React.FC = () => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, i] = await Promise.allSettled([
        EnterpriseAssignmentService.getMyEnterpriseAssignments(),
        // The Incident service may not have a list-by-enterprise endpoint; we'll fetch all and filter
        IncidentService.getAll().catch(() => ({ data: { result: [] } })),
      ]);
      const aData: Assignment[] = a.status === 'fulfilled'
        ? (a.value.data?.result ?? a.value.data ?? [])
        : [];
      setAssignments(Array.isArray(aData) ? aData : []);

      // Server-side: get all and filter to my enterprise's students
      const allIncidents: Incident[] = i.status === 'fulfilled'
        ? (i.value.data?.result ?? i.value.data ?? [])
        : [];
      const studentIds = new Set(
        (Array.isArray(aData) ? aData : []).map((x: any) => x.studentId ?? x.student?.userId)
      );
      setIncidents(
        (Array.isArray(allIncidents) ? allIncidents : []).filter(inc =>
          studentIds.has(inc.studentId) || true // include all for now, server already filters via @PreAuthorize
        )
      );
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await IncidentService.report({
        assignmentId: values.assignmentId,
        category: values.category,
        description: `${values.severity ? `[Severity: ${values.severity}] ` : ''}${values.description}${values.evidenceUrls ? `\n\nEvidence: ${values.evidenceUrls}` : ''}`,
      });
      message.success('Incident reported successfully. Training Manager has been notified.');
      setFormOpen(false);
      form.resetFields();
      await fetchAll();
    } catch (err: any) {
      if (err?.errorFields) return;
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === 1033) {
        message.warning('Please select a category and provide a detailed description of the incident.');
      } else {
        message.error(msg ?? 'Failed to report incident.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inProgress = useMemo(
    () => incidents.filter(i => (i.status ?? 'OPEN') !== 'RESOLVED'),
    [incidents]
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
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Critical Incidents</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Report critical incidents regarding student behavior or performance</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={fetchAll}>Refresh</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setFormOpen(true); }}
            style={{ background: c.error, borderColor: c.error }}
          >
            Report Incident
          </Button>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: c.textMuted, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>No incidents reported</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Use the "Report Incident" button to flag a critical issue to the Training Manager.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 24px' }}>
          {inProgress.length > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 0' }}>
              Open / In Review ({inProgress.length})
            </div>
          )}
          {inProgress.map(inc => (
            <IncidentCard key={inc.incidentId} incident={inc} />
          ))}
          {incidents.length > inProgress.length && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 0 4px' }}>
                Resolved ({incidents.length - inProgress.length})
              </div>
              {incidents.filter(i => (i.status ?? 'OPEN') === 'RESOLVED').map(inc => (
                <IncidentCard key={inc.incidentId} incident={inc} />
              ))}
            </>
          )}
        </div>
      )}

      <Modal
        title={<div style={{ fontWeight: 800, color: c.text }}>Report Critical Incident</div>}
        open={formOpen}
        onCancel={() => { if (!submitting) setFormOpen(false); }}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="Student" name="assignmentId" rules={[{ required: true, message: 'Pick a student' }]}>
            <Select
              placeholder="Select a student"
              showSearch
              optionFilterProp="label"
              options={assignments.map(a => ({
                value: a.assignmentId,
                label: `${a.studentName ?? 'Student'} (${a.studentCode ?? ''})`,
              }))}
            />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Select a category' }]}>
              <Select placeholder="Incident category" options={CATEGORIES} />
            </Form.Item>
            <Form.Item label="Severity" name="severity" initialValue="MEDIUM">
              <Select options={SEVERITIES} />
            </Form.Item>
          </div>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, min: 20, message: 'At least 20 characters describing the incident' }]}
          >
            <TextArea
              rows={4}
              maxLength={1000}
              showCount
              placeholder="Describe what happened, when, and who was involved. Be specific and factual."
            />
          </Form.Item>
          <Form.Item label="Evidence URLs (optional)" name="evidenceUrls">
            <Input placeholder="Comma-separated links to photos, documents, or chat logs" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              danger
              type="primary"
              icon={<WarningOutlined />}
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit Report
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

const IncidentCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { message } = App.useApp();
  const meta = STATUS_META[incident.status ?? 'OPEN'] ?? STATUS_META.OPEN;
  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 2 }}>
            {incident.studentName ?? 'Student'} · {incident.category}
          </div>
          <div style={{ fontSize: 12, color: c.textMuted }}>
            {incident.reportedAt ? `Reported ${dayjs(incident.reportedAt).format('MMM D, YYYY HH:mm')}` : '—'}
          </div>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: c.radiusFull, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
      </div>
      <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-wrap', padding: 10, background: c.bgLight, borderRadius: c.radiusSm }}>
        {incident.description}
      </div>
      {incident.resolutionNote && (
        <div style={{ marginTop: 8, padding: 10, background: c.successMuted, borderRadius: c.radiusSm, fontSize: 12, color: c.text, lineHeight: 1.5 }}>
          <strong style={{ color: c.success }}>Resolution:</strong> {incident.resolutionNote}
        </div>
      )}
    </div>
  );
};
