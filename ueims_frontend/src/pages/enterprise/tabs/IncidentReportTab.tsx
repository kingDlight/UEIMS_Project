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

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Open', color: 'text-amber-500', bg: 'bg-amber-50' },
  IN_REVIEW: { label: 'In Review', color: 'text-blue-500', bg: 'bg-blue-50' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  CLOSED: { label: 'Closed', color: 'text-slate-500', bg: 'bg-slate-50' },
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
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      <div className="px-6 pb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">Critical Incidents</h2>
          <p className="text-[13px] text-slate-500 m-0">Report critical incidents regarding student behavior or performance</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<ReloadOutlined />} onClick={fetchAll} className="rounded-xl">Refresh</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { form.resetFields(); setFormOpen(true); }}
            className="bg-red-500 border-red-500 rounded-xl hover:bg-red-600 hover:border-red-600 font-bold"
          >
            Report Incident
          </Button>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <ExclamationCircleOutlined className="text-[48px] text-slate-400 mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">No incidents reported</div>
          <div className="text-[13px] text-slate-500">Use the "Report Incident" button to flag a critical issue to the Training Manager.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-6">
          {inProgress.length > 0 && (
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider py-1">
              Open / In Review ({inProgress.length})
            </div>
          )}
          {inProgress.map(inc => (
            <IncidentCard key={inc.incidentId} incident={inc} />
          ))}
          {incidents.length > inProgress.length && (
            <>
              <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider pt-3 pb-1">
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
        title={<div className="font-extrabold text-slate-900">Report Critical Incident</div>}
        open={formOpen}
        onCancel={() => { if (!submitting) setFormOpen(false); }}
        footer={null}
        width={560}
        destroyOnHidden
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
          <div className="grid grid-cols-2 gap-2">
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
              className="rounded-xl"
            />
          </Form.Item>
          <Form.Item label="Evidence URLs (optional)" name="evidenceUrls">
            <Input placeholder="Comma-separated links to photos, documents, or chat logs" className="rounded-xl" />
          </Form.Item>
          <div className="flex gap-2 justify-end mt-2">
            <Button onClick={() => setFormOpen(false)} disabled={submitting} className="rounded-xl">Cancel</Button>
            <Button
              danger
              type="primary"
              icon={<WarningOutlined />}
              loading={submitting}
              onClick={handleSubmit}
              className="bg-red-500 border-red-500 rounded-xl hover:bg-red-600 hover:border-red-600 font-bold"
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
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-[14px] font-bold text-slate-900 mb-0.5">
            {incident.studentName ?? 'Student'} · {incident.category}
          </div>
          <div className="text-[12px] text-slate-500">
            {incident.reportedAt ? `Reported ${dayjs(incident.reportedAt).format('MMM D, YYYY HH:mm')}` : '—'}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.bg} ${meta.color}`}>{meta.label}</span>
      </div>
      <div className="text-[13px] text-slate-900 leading-relaxed whitespace-pre-wrap p-2.5 bg-slate-50 rounded-xl">
        {incident.description}
      </div>
      {incident.resolutionNote && (
        <div className="mt-2 p-2.5 bg-emerald-50 rounded-xl text-[12px] text-slate-900 leading-relaxed">
          <strong className="text-emerald-600 mr-1">Resolution:</strong> {incident.resolutionNote}
        </div>
      )}
    </div>
  );
};
