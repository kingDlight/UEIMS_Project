import React, { useEffect, useMemo, useState } from 'react';
import { Spin, message, Button, Input, Select, Empty } from 'antd';
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
import { c } from '../constants';

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
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'In Progress', color: c.info, bg: hexToRgba(c.info, 0.1) },
  COMPLETED: { label: 'Completed', color: c.success, bg: hexToRgba(c.success, 0.1) },
  CANCELLED: { label: 'Canceled', color: c.error, bg: hexToRgba(c.error, 0.1) },
  CANCELED: { label: 'Canceled', color: c.error, bg: hexToRgba(c.error, 0.1) },
};

const PAGE_SIZE = 20;

export const AssignedStudentsTab: React.FC = () => {
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await EnterpriseAssignmentService.getMyEnterprise();
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Assigned Students</h2>
          <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Track students currently assigned to your enterprise</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search by name, code, or email"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            style={{ width: 160 }}
            options={[
              { value: 'ALL', label: 'All statuses' },
              { value: 'ACTIVE', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELED', label: 'Canceled' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchRows}>Refresh</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: c.textMuted, background: c.surface, borderRadius: c.radiusLg, border: `1px solid ${c.border}`, margin: '0 24px' }}>
          <TeamOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 4 }}>There are no students assigned to you at the moment.</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Once the Training Manager assigns students to your enterprise, they will appear here.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, padding: '0 24px' }}>
            {paged.map(r => {
              const meta = STATUS_META[(r.status ?? 'ACTIVE').toUpperCase()] ?? STATUS_META.ACTIVE;
              return (
                <div
                  key={r.assignmentId}
                  style={{
                    background: c.surface,
                    border: `1px solid ${c.border}`,
                    borderRadius: c.radiusLg,
                    padding: 18,
                    boxShadow: c.shadowSm,
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = c.shadowMd)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = c.shadowSm)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 48, height: 48, borderRadius: c.radiusMd,
                        background: c.brandMuted, color: c.brand,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800,
                      }}
                    >
                      {(r.studentName ?? 'ST').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 2 }}>{r.studentName ?? 'Student'}</div>
                      <div style={{ fontSize: 12, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MailOutlined /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.studentEmail ?? '—'}</span>
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: c.radiusFull, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Field icon={<IdcardOutlined />} label="Student ID" value={r.studentCode ?? '—'} />
                    <Field icon={<BookOutlined />} label="Major" value={r.major ?? '—'} />
                    {r.supervisorName && <Field icon={<UserOutlined />} label="Supervisor" value={r.supervisorName} />}
                    {r.startDate && (
                      <Field
                        icon={<CalendarOutlined />}
                        label="Period"
                        value={`${dayjs(r.startDate).format('MMM D, YYYY')} – ${r.endDate ? dayjs(r.endDate).format('MMM D, YYYY') : '—'}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <Button disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span style={{ fontSize: 12, color: c.textMuted }}>Page {safePage} of {totalPages}</span>
              <Button disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Field: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ padding: '8px 10px', background: c.bgLight, borderRadius: c.radiusSm }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: c.text, wordBreak: 'break-word' }}>{value}</div>
  </div>
);
