import React, { useEffect, useMemo, useState } from 'react';
import { Spin, message, Button, Input, DatePicker, Form, Select, Empty, Popconfirm } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ProjectOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import { InternshipPlanService } from '@/services/InternshipPlanService';
import { InternshipPlanItemService } from '@/services/InternshipPlanItemService';
import { c } from '../constants';

const { TextArea } = Input;

interface Assignment {
  assignmentId: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentCode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface PlanItem {
  planItemId?: string;
  weekNumber: number;
  taskDescription: string;
  targetDate?: string | null;
  status?: string;
  orderIndex?: number;
}

interface PlanState {
  planId?: string;
  overallGoal?: string;
  isLocked?: boolean;
  items: PlanItem[];
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const InternshipPlanTab: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [plan, setPlan] = useState<PlanState>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await EnterpriseAssignmentService.getMyAssignment();
      const data: Assignment[] = res.data?.result ?? res.data ?? [];
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to load students.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const fetchPlanForStudent = async (assignmentId: string) => {
    try {
      const res = await InternshipPlanService.getByAssignment(assignmentId);
      const data = res.data?.result ?? res.data;
      if (data && data.planId) {
        setPlan({
          planId: data.planId,
          overallGoal: data.overallGoal ?? '',
          isLocked: data.isLocked ?? false,
          items: (data.items ?? []).map((it: any, idx: number) => ({
            planItemId: it.planItemId,
            weekNumber: it.weekNumber ?? idx + 1,
            taskDescription: it.taskDescription ?? '',
            targetDate: it.targetDate ?? null,
            status: it.status ?? 'PENDING',
            orderIndex: it.orderIndex ?? idx,
          })),
        });
      } else {
        setPlan({ items: [] });
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to load plan.');
      setPlan({ items: [] });
    }
  };

  const isReadOnly = useMemo(() => {
    const s = (selectedAssignment?.status ?? 'ACTIVE').toUpperCase();
    return s === 'COMPLETED' || s === 'CANCELED' || s === 'CANCELLED' || plan.isLocked;
  }, [selectedAssignment, plan.isLocked]);

  const addItem = () => {
    if (isReadOnly) return;
    setPlan(p => ({
      ...p,
      items: [
        ...p.items,
        {
          weekNumber: p.items.length + 1,
          taskDescription: '',
          targetDate: null,
          status: 'PENDING',
        },
      ],
    }));
  };

  const removeItem = (idx: number) => {
    if (isReadOnly) return;
    setPlan(p => ({
      ...p,
      items: p.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, weekNumber: i + 1 })),
    }));
  };

  const updateItem = (idx: number, patch: Partial<PlanItem>) => {
    if (isReadOnly) return;
    setPlan(p => ({
      ...p,
      items: p.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };

  const handleSave = async () => {
    if (!selectedAssignment) return;
    if (isReadOnly) {
      message.warning('This plan is read-only (internship finished or canceled).');
      return;
    }
    // Client-side pre-check (BR-38) for nicer UX
    for (const it of plan.items) {
      if (!it.taskDescription || !it.taskDescription.trim()) {
        message.warning('Each week must have a Task Description.');
        return;
      }
      if (!it.targetDate) {
        message.warning('Each week must have a Target Date.');
        return;
      }
    }
    setSaving(true);
    try {
      // 1. Save the plan shell
      const planPayload: any = {
        assignment: { assignmentId: selectedAssignment.assignmentId },
        overallGoal: plan.overallGoal ?? '',
      };
      if (plan.planId) planPayload.planId = plan.planId;
      const saved = await InternshipPlanService.create(planPayload);
      const newPlanId = saved.data?.result?.planId ?? saved.data?.planId ?? plan.planId;

      // 2. Replace items: delete removed, save new/updated
      const existingIds = new Set<string>();
      for (const it of plan.items) {
        if (it.planItemId) existingIds.add(it.planItemId);
      }
      // The plan.service create is generic, but we need to save items one by one
      for (let i = 0; i < plan.items.length; i++) {
        const it = plan.items[i];
        await InternshipPlanItemService.create({
          plan: { planId: newPlanId },
          planItemId: it.planItemId,
          weekNumber: it.weekNumber,
          taskDescription: it.taskDescription,
          targetDate: it.targetDate,
          orderIndex: i,
        });
      }
      message.success('Internship plan has been saved successfully.');
      await fetchPlanForStudent(selectedAssignment.assignmentId);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === 1033) {
        message.warning(msg ?? 'Please fill all required fields.');
      } else if (code === 1026) {
        message.error(msg ?? 'Target date must be within the semester boundaries.');
      } else {
        message.error(msg ?? 'Failed to save plan.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    // Lightweight browser-side export: print-style HTML
    if (!selectedAssignment) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>Internship Plan - ${selectedAssignment.studentName}</title>
        <style>
          body { font-family: Inter, sans-serif; padding: 24px; color: #0F172A; }
          h1 { color: #E67E22; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
          th { background: #F1F5F9; }
        </style></head>
        <body>
          <h1>Internship Training Plan</h1>
          <p><strong>Student:</strong> ${selectedAssignment.studentName ?? '—'}</p>
          <p><strong>Student ID:</strong> ${selectedAssignment.studentCode ?? '—'}</p>
          <p><strong>Overall Goal:</strong> ${plan.overallGoal ?? '—'}</p>
          <table>
            <thead><tr><th>Week</th><th>Task Description</th><th>Target Date</th><th>Status</th></tr></thead>
            <tbody>
              ${plan.items
                .map(
                  (it) => `<tr>
                    <td>${it.weekNumber}</td>
                    <td>${it.taskDescription ?? ''}</td>
                    <td>${it.targetDate ? dayjs(it.targetDate).format('YYYY-MM-DD') : '—'}</td>
                    <td>${it.status ?? 'PENDING'}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, padding: '0 24px 40px' }}>
      <aside style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: c.radiusLg, padding: 12, height: 'fit-content' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px 8px' }}>My Students</div>
        {assignments.length === 0 ? (
          <div style={{ padding: 16, color: c.textMuted, fontSize: 12 }}>No students assigned yet.</div>
        ) : (
          assignments.map(a => (
            <div
              key={a.assignmentId}
              onClick={() => {
                setSelectedAssignment(a);
                fetchPlanForStudent(a.assignmentId);
              }}
              style={{
                padding: '10px 12px',
                borderRadius: c.radiusSm,
                cursor: 'pointer',
                background: selectedAssignment?.assignmentId === a.assignmentId ? c.brandMuted : 'transparent',
                border: selectedAssignment?.assignmentId === a.assignmentId ? `1px solid ${c.brand}` : '1px solid transparent',
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{a.studentName ?? '—'}</div>
              <div style={{ fontSize: 11, color: c.textMuted }}>{a.studentCode ?? ''}</div>
            </div>
          ))
        )}
      </aside>

      <main>
        {!selectedAssignment ? (
          <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}` }}>
            <ProjectOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>Select a student to manage their training plan</div>
            <div style={{ fontSize: 13, color: c.textMuted }}>Pick a student from the list on the left to get started.</div>
          </div>
        ) : (
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: c.radiusLg, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{selectedAssignment.studentName}</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{selectedAssignment.studentCode} · {selectedAssignment.studentEmail}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>Export PDF</Button>
                <Button icon={<ReloadOutlined />} onClick={() => selectedAssignment && fetchPlanForStudent(selectedAssignment.assignmentId)}>Refresh</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  disabled={isReadOnly}
                  style={{ background: c.brand, borderColor: c.brand }}
                >
                  Save Plan
                </Button>
              </div>
            </div>

            {isReadOnly && (
              <div style={{ marginBottom: 12, padding: '10px 14px', background: hexToRgba(c.warning, 0.1), border: `1px solid ${hexToRgba(c.warning, 0.3)}`, borderRadius: c.radiusMd, fontSize: 12, color: c.warning, display: 'flex', alignItems: 'center', gap: 8 }}>
                <LockOutlined /> This plan is read-only because the internship is finished or canceled.
              </div>
            )}

            <Form layout="vertical" disabled={isReadOnly}>
              <Form.Item label="Overall Goal" style={{ marginBottom: 16 }}>
                <TextArea
                  value={plan.overallGoal ?? ''}
                  onChange={e => setPlan(p => ({ ...p, overallGoal: e.target.value }))}
                  rows={2}
                  maxLength={500}
                  showCount
                  placeholder="Outline the main goal of the internship (optional)"
                />
              </Form.Item>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Weekly Plan</div>
                <Button size="small" icon={<PlusOutlined />} onClick={addItem} disabled={isReadOnly}>
                  Add Week
                </Button>
              </div>

              {plan.items.length === 0 ? (
                <Empty description="No weekly items yet. Click 'Add Week' to start." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 180px 40px',
                        gap: 8,
                        alignItems: 'center',
                        padding: 12,
                        background: c.bgLight,
                        borderRadius: c.radiusMd,
                        border: `1px solid ${c.borderSubtle}`,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted }}>Week {it.weekNumber}</div>
                      <Input
                        value={it.taskDescription}
                        onChange={e => updateItem(idx, { taskDescription: e.target.value })}
                        placeholder="Task description (required)"
                        maxLength={300}
                      />
                      <DatePicker
                        value={it.targetDate ? dayjs(it.targetDate) : null}
                        onChange={(d: Dayjs | null) => updateItem(idx, { targetDate: d ? d.format('YYYY-MM-DD') : null })}
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                        disabledDate={d => {
                          if (!d) return false;
                          if (d.isBefore(dayjs().startOf('day'))) return true;
                          if (selectedAssignment?.startDate && d.isBefore(dayjs(selectedAssignment.startDate))) return true;
                          if (selectedAssignment?.endDate && d.isAfter(dayjs(selectedAssignment.endDate))) return true;
                          return false;
                        }}
                      />
                      <Popconfirm
                        title="Remove this week?"
                        onConfirm={() => removeItem(idx)}
                        okText="Remove"
                        cancelText="Cancel"
                        disabled={isReadOnly}
                      >
                        <Button danger type="text" icon={<DeleteOutlined />} disabled={isReadOnly} />
                      </Popconfirm>
                    </div>
                  ))}
                </div>
              )}
            </Form>
          </div>
        )}
      </main>
    </div>
  );
};
