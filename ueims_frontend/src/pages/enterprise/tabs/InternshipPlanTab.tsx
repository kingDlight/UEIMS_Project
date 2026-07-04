import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Button, Input, Form, Empty, Popconfirm } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ProjectOutlined,
  ReloadOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { InternshipPlanService } from '@/services/InternshipPlanService';
import { InternshipPlanItemService } from '@/services/InternshipPlanItemService';
import { SemesterService, type SemesterResponse } from '@/services/SemesterService';

const { TextArea } = Input;

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
  status?: string;
  rejectionReason?: string;
  items: PlanItem[];
}

export const InternshipPlanTab: React.FC = () => {
  const { message } = App.useApp();
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SemesterResponse | null>(null);
  const [plan, setPlan] = useState<PlanState>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      // Enterprise tạo plan cho kỳ ACTIVE hoặc OPEN
      const all = await SemesterService.getAllSemesters();
      const editable = all.filter((s) => s.status === 'ACTIVE' || s.status === 'OPEN');
      setSemesters(editable);
      // Auto-select kỳ ACTIVE nếu có, fallback OPEN
      const active = editable.find((s) => s.status === 'ACTIVE') ?? editable[0];
      if (active) {
        setSelectedSemester(active);
        await fetchPlanForSemester(active.semesterId);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to load semesters.');
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlanForSemester = async (semesterId: string) => {
    try {
      const res = await InternshipPlanService.getByEnterpriseSemester(semesterId);
      const data = res.data?.result ?? res.data;
      if (data && data.planId) {
        setPlan({
          planId: data.planId,
          overallGoal: data.overallGoal ?? '',
          status: data.status,
          rejectionReason: data.rejectionReason,
          items: (data.tasks ?? data.items ?? []).map((it: any, idx: number) => ({
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

  const calculateSundays = (startDate: string, endDate: string): string[] => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const sundays: string[] = [];
    let current = start.clone();
    if (current.day() !== 0) {
      current = current.add(7 - current.day(), 'day');
    }
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      sundays.push(current.format('YYYY-MM-DD'));
      current = current.add(7, 'day');
    }
    return sundays;
  };

  const isReadOnly = useMemo(() => {
    // Plan PENDING_APPROVAL hoặc APPROVED thì lock (APPROVED phải liên hệ TM).
    return plan.status === 'PENDING_APPROVAL' || plan.status === 'APPROVED';
  }, [plan.status]);

  const autoFillSundays = () => {
    if (isReadOnly || !selectedSemester) return;
    const sundays = calculateSundays(selectedSemester.startDate, selectedSemester.endDate);
    if (sundays.length === 0) {
      message.warning('The semester duration does not contain any Sundays.');
      return;
    }
    const newItems: PlanItem[] = sundays.map((sunday, idx) => ({
      weekNumber: idx + 1,
      taskDescription: '',
      targetDate: sunday,
      status: 'PENDING',
    }));
    setPlan((p) => ({ ...p, items: newItems }));
    message.success(`Generated ${sundays.length} weeks based on semester duration.`);
  };

  const addItem = () => {
    if (isReadOnly) return;
    setPlan((p) => ({
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
    setPlan((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, weekNumber: i + 1 })),
    }));
  };

  const updateItem = (idx: number, patch: Partial<PlanItem>) => {
    if (isReadOnly) return;
    setPlan((p) => ({
      ...p,
      items: p.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  };

  const handleSave = async () => {
    if (!selectedSemester) return;
    if (isReadOnly) {
      message.warning('This plan is read-only (pending approval or already approved).');
      return;
    }
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
      const planPayload: any = {
        semesterId: selectedSemester.semesterId,
        overallGoal: plan.overallGoal ?? '',
      };
      if (plan.planId) planPayload.planId = plan.planId;
      const saved = await InternshipPlanService.create(planPayload);
      const newPlanId = saved.data?.result?.planId ?? saved.data?.planId ?? plan.planId;

      // Replace items: xóa cũ rồi tạo mới (đơn giản, plan có 1-10 items)
      if (plan.planId) {
        for (const it of plan.items) {
          if (it.planItemId) {
            try {
              await InternshipPlanItemService.delete(it.planItemId);
            } catch {}
          }
        }
      }
      for (let i = 0; i < plan.items.length; i++) {
        const it = plan.items[i];
        await InternshipPlanItemService.create({
          planId: newPlanId,
          weekNumber: it.weekNumber,
          taskDescription: it.taskDescription,
          targetDate: it.targetDate,
          orderIndex: i,
        });
      }
      message.success('Training plan has been saved and sent for approval.');
      await fetchPlanForSemester(selectedSemester.semesterId);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to save plan.');
    } finally {
      setSaving(false);
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
    <div className="font-sans grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 px-4 sm:px-6 pb-10">
      <aside className="bg-white border border-slate-200 rounded-2xl p-3 h-fit">
        <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1 pb-2">
          Semesters
        </div>
        {semesters.length === 0 ? (
          <div className="p-4 text-slate-500 text-xs">
            No active or open semesters. Contact TM to open a semester.
          </div>
        ) : (
          semesters.map((sem) => (
            <div
              key={sem.semesterId}
              onClick={() => {
                setSelectedSemester(sem);
                fetchPlanForSemester(sem.semesterId);
              }}
              className={`px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-colors ${
                selectedSemester?.semesterId === sem.semesterId
                  ? 'bg-[#E67E22]/10 border border-[#E67E22]'
                  : 'bg-transparent border border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="text-[13px] font-semibold text-slate-900">{sem.semesterCode}</div>
              <div className="text-[11px] text-slate-500">
                {sem.status} · {dayjs(sem.startDate).format('MMM D')} –{' '}
                {dayjs(sem.endDate).format('MMM D')}
              </div>
            </div>
          ))
        )}
      </aside>

      <main>
        {!selectedSemester ? (
          <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <ProjectOutlined className="text-[48px] mb-3 block" />
            <div className="text-[15px] font-semibold text-slate-900 mb-1">
              Select a semester to manage its training plan
            </div>
            <div className="text-[13px] text-slate-500">
              One training plan per semester, applied to all students interning at your company.
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div>
                <div className="text-[16px] font-extrabold text-slate-900">
                  Training Plan · {selectedSemester.semesterCode}
                </div>
                <div className="text-[12px] text-slate-500">
                  Status: <strong className="uppercase">{plan.status || 'DRAFT'}</strong>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => selectedSemester && fetchPlanForSemester(selectedSemester.semesterId)}
                  className="rounded-xl"
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  disabled={isReadOnly}
                  className="bg-[#E67E22] border-[#E67E22] rounded-xl font-bold hover:bg-[#D35400] hover:border-[#D35400]"
                >
                  Save & Submit
                </Button>
              </div>
            </div>

            {isReadOnly && (
              <div className="mb-3 px-3.5 py-2.5 bg-amber-50 border border-amber-500/30 rounded-xl text-[12px] text-amber-600 flex items-center gap-2">
                <LockOutlined /> This plan is read-only because it is{' '}
                {plan.status?.replace('_', ' ')}.
              </div>
            )}
            {plan.status === 'REJECTED' && (
              <div className="mb-3 px-3.5 py-2.5 bg-red-50 border border-red-500/30 rounded-xl text-[12px] text-red-600 flex items-center gap-2">
                <LockOutlined /> <strong>Rejected:</strong> {plan.rejectionReason}
              </div>
            )}

            <Form layout="vertical" disabled={isReadOnly}>
              <Form.Item label="Overall Goal" className="mb-4">
                <TextArea
                  value={plan.overallGoal ?? ''}
                  onChange={(e) => setPlan((p) => ({ ...p, overallGoal: e.target.value }))}
                  rows={2}
                  maxLength={500}
                  showCount
                  placeholder="Outline the main goal of the internship (optional)"
                  className="rounded-xl"
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-bold text-slate-900">Weekly Tasks</div>
                <div className="flex gap-2">
                  <Button
                    size="small"
                    onClick={autoFillSundays}
                    disabled={isReadOnly}
                    className="rounded-xl"
                  >
                    Auto-Fill Sundays
                  </Button>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addItem}
                    disabled={isReadOnly}
                    className="rounded-xl"
                  >
                    Add Week
                  </Button>
                </div>
              </div>

              {plan.items.length === 0 ? (
                <Empty
                  description="No weekly items yet. Click 'Auto-Fill Sundays' to generate weeks."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {plan.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[60px_1fr_120px_40px] gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="text-[12px] font-bold text-slate-500">Week {it.weekNumber}</div>
                      <Input
                        value={it.taskDescription}
                        onChange={(e) => updateItem(idx, { taskDescription: e.target.value })}
                        placeholder="Task description (required)"
                        maxLength={300}
                        className="rounded-lg"
                      />
                      <div className="text-[12px] text-slate-600 font-mono text-center bg-white px-2 py-1 rounded border border-slate-200">
                        {it.targetDate ?? 'No Date'}
                      </div>
                      <Popconfirm
                        title="Remove this week?"
                        onConfirm={() => removeItem(idx)}
                        okText="Remove"
                        cancelText="Cancel"
                        disabled={isReadOnly}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          disabled={isReadOnly}
                          className="rounded-lg"
                        />
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