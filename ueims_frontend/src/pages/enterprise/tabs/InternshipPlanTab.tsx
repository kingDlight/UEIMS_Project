import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Button, Input, DatePicker, Form, Select, Empty, Popconfirm } from 'antd';
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

export const InternshipPlanTab: React.FC = () => {
  const { message } = App.useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [plan, setPlan] = useState<PlanState>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await EnterpriseAssignmentService.getMyEnterpriseAssignments();
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
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-cols-[280px_1fr] gap-4 px-6 pb-10">
      <aside className="bg-white border border-slate-200 rounded-2xl p-3 h-fit">
        <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1 pb-2">My Students</div>
        {assignments.length === 0 ? (
          <div className="p-4 text-slate-500 text-xs">No students assigned yet.</div>
        ) : (
          assignments.map(a => (
            <div
              key={a.assignmentId}
              onClick={() => {
                setSelectedAssignment(a);
                fetchPlanForStudent(a.assignmentId);
              }}
              className={`px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-colors ${
                selectedAssignment?.assignmentId === a.assignmentId
                  ? 'bg-[#E67E22]/10 border border-[#E67E22]'
                  : 'bg-transparent border border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-[13px] font-semibold text-slate-900">{a.studentName ?? '—'}</div>
              <div className="text-[11px] text-slate-500">{a.studentCode ?? ''}</div>
            </div>
          ))
        )}
      </aside>

      <main>
        {!selectedAssignment ? (
          <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <ProjectOutlined className="text-[48px] mb-3 block" />
            <div className="text-[15px] font-semibold text-slate-900 mb-1">Select a student to manage their training plan</div>
            <div className="text-[13px] text-slate-500">Pick a student from the list on the left to get started.</div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div>
                <div className="text-[16px] font-extrabold text-slate-900">{selectedAssignment.studentName}</div>
                <div className="text-[12px] text-slate-500">{selectedAssignment.studentCode} · {selectedAssignment.studentEmail}</div>
              </div>
              <div className="flex gap-2">
                <Button icon={<FilePdfOutlined />} onClick={handleExportPdf} className="rounded-xl">Export PDF</Button>
                <Button icon={<ReloadOutlined />} onClick={() => selectedAssignment && fetchPlanForStudent(selectedAssignment.assignmentId)} className="rounded-xl">Refresh</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  disabled={isReadOnly}
                  className="bg-[#E67E22] border-[#E67E22] rounded-xl font-bold hover:bg-[#D35400] hover:border-[#D35400]"
                >
                  Save Plan
                </Button>
              </div>
            </div>

            {isReadOnly && (
              <div className="mb-3 px-3.5 py-2.5 bg-amber-50 border border-amber-500/30 rounded-xl text-[12px] text-amber-600 flex items-center gap-2">
                <LockOutlined /> This plan is read-only because the internship is finished or canceled.
              </div>
            )}

            <Form layout="vertical" disabled={isReadOnly}>
              <Form.Item label="Overall Goal" className="mb-4">
                <TextArea
                  value={plan.overallGoal ?? ''}
                  onChange={e => setPlan(p => ({ ...p, overallGoal: e.target.value }))}
                  rows={2}
                  maxLength={500}
                  showCount
                  placeholder="Outline the main goal of the internship (optional)"
                  className="rounded-xl"
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-bold text-slate-900">Weekly Plan</div>
                <Button size="small" icon={<PlusOutlined />} onClick={addItem} disabled={isReadOnly} className="rounded-xl">
                  Add Week
                </Button>
              </div>

              {plan.items.length === 0 ? (
                <Empty description="No weekly items yet. Click 'Add Week' to start." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div className="flex flex-col gap-2">
                  {plan.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[60px_1fr_180px_40px] gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="text-[12px] font-bold text-slate-500">Week {it.weekNumber}</div>
                      <Input
                        value={it.taskDescription}
                        onChange={e => updateItem(idx, { taskDescription: e.target.value })}
                        placeholder="Task description (required)"
                        maxLength={300}
                        className="rounded-lg"
                      />
                      <DatePicker
                        value={it.targetDate ? dayjs(it.targetDate) : null}
                        onChange={(d: Dayjs | null) => updateItem(idx, { targetDate: d ? d.format('YYYY-MM-DD') : null })}
                        format="YYYY-MM-DD"
                        className="w-full rounded-lg"
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
                        <Button danger type="text" icon={<DeleteOutlined />} disabled={isReadOnly} className="rounded-lg" />
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
