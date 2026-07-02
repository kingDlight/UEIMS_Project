import React, { useEffect, useMemo, useState } from 'react';
import { Spin, App, Button, Input, Select, Empty } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  SearchOutlined,
  ReloadOutlined,
  IdcardOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';

interface AssignmentRow {
  assignmentId: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentCode?: string;
  major?: string;
  gpa?: number;
  status?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  startDate?: string;
  endDate?: string;
  evaluationId?: string;
  finalReportUrl?: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-50' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  CANCELLED: { label: 'Canceled', color: 'text-red-500', bg: 'bg-red-50' },
  CANCELED: { label: 'Canceled', color: 'text-red-500', bg: 'bg-red-50' },
};

const PAGE_SIZE = 20;

export const AssignedStudentsTab: React.FC = () => {
  const { message } = App.useApp();
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await EnterpriseAssignmentService.getMyEnterpriseAssignments();
      const data: AssignmentRow[] = res.data?.result ?? res.data ?? [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to load assigned students.';
      message.error(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const filtered = useMemo(() => {
    return rows
      .filter(r => {
        if (statusFilter === 'ALL') return true;
        return (r.status ?? 'ACTIVE').toUpperCase() === statusFilter.toUpperCase();
      })
      .filter(r => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (r.studentName ?? '').toLowerCase().includes(q)
          || (r.studentCode ?? '').toLowerCase().includes(q)
          || (r.studentEmail ?? '').toLowerCase().includes(q);
      });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
          <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">Assigned Students</h2>
          <p className="text-[13px] text-slate-500 m-0">Track students currently assigned to your enterprise</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Input
            placeholder="Search by name, code, or email"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-[280px] rounded-xl"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            className="w-[160px]"
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'ACTIVE', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELED', label: 'Canceled' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchRows} className="rounded-xl">Refresh</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-[60px] text-center text-slate-500 bg-white rounded-2xl border border-slate-200 mx-6">
          <TeamOutlined className="text-[48px] mb-3 block" />
          <div className="text-[15px] font-semibold text-slate-900 mb-1">There are no students assigned to you at the moment.</div>
          <div className="text-[13px] text-slate-500">Once the Training Manager assigns students to your enterprise, they will appear here.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 px-6">
            {paged.map(r => {
              const meta = STATUS_META[(r.status ?? 'ACTIVE').toUpperCase()] ?? STATUS_META.ACTIVE;
              const name = r.studentName ?? 'Student';
              const initials = name
                .split(' ')
                .map(p => p[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'ST';
              return (
                <div
                  key={r.assignmentId}
                  className="group bg-white border border-slate-200 rounded-2xl px-5 pt-5 pb-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]/15 flex items-center justify-center text-[13px] font-extrabold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold text-slate-900 truncate mb-0.5">{name}</div>
                      <div className="text-[12px] text-slate-500 flex items-center gap-1.5 min-w-0">
                        <MailOutlined className="shrink-0" />
                        <span className="truncate">{r.studentEmail ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 grid grid-cols-2 gap-x-3 gap-y-3">
                    <Field icon={<IdcardOutlined />} label="Student ID" value={r.studentCode ?? '—'} />
                    <Field icon={<BookOutlined />} label="Major" value={r.major ?? '—'} />
                    {r.supervisorName && (
                      <Field
                        icon={<UserOutlined />}
                        label="Supervisor"
                        value={r.supervisorName}
                        fullWidth
                      />
                    )}
                    {r.startDate && (
                      <Field
                        icon={<CalendarOutlined />}
                        label="Period"
                        value={`${dayjs(r.startDate).format('MMM D, YYYY')} – ${r.endDate ? dayjs(r.endDate).format('MMM D, YYYY') : '—'}`}
                        fullWidth
                      />
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                    <div className="flex gap-2">
                      {r.finalReportUrl && (
                        <a href={`http://localhost:8080${r.finalReportUrl}`} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:border-blue-200 cursor-pointer inline-block no-underline">
                          View Final Report
                        </a>
                      )}
                      {r.evaluationId && (
                        <a href={`/enterprise-dashboard/evaluation?assignmentId=${r.assignmentId}`} className="text-[12px] font-semibold text-[#E67E22] hover:text-[#D35400] transition-colors bg-[#E67E22]/10 px-3 py-1.5 rounded-lg border border-[#E67E22]/20 hover:border-[#E67E22]/30 cursor-pointer inline-block no-underline">
                          View Evaluation
                        </a>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.bg} ${meta.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button disabled={safePage <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">Prev</Button>
              <span className="text-[12px] text-slate-500">Page {safePage} of {totalPages}</span>
              <Button disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl">Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Field: React.FC<{ icon: React.ReactNode; label: string; value: string; fullWidth?: boolean }> = ({ icon, label, value, fullWidth }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
      <span className="text-[#E67E22]">{icon}</span> {label}
    </div>
    <div className="text-[12.5px] font-semibold text-slate-900 break-words leading-snug">{value}</div>
  </div>
);
