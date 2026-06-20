import React, { useState, useEffect, useCallback } from 'react';
import { Table, App, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { AtRiskStudentService } from '@/services/AtRiskStudentService';
import { SemesterService } from '@/services/SemesterService';
import type { AtRiskStudent } from '../types';

const st = {
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: 'rgba(255, 255, 255, 0.72)',
  neutralBg: '#F9FAFB',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  shadowSm: '0 1px 3px rgba(0,0,0,.08)',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
};

export const AtRiskStudentsTab: React.FC = () => {
  const { message } = App.useApp();
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const activeSem = await SemesterService.getActiveSemester();
      if (activeSem) {
        setActiveSemesterId(activeSem.semesterId);
        const data = await AtRiskStudentService.getAtRiskStudents(activeSem.semesterId);
        setStudents(data || []);
      }
    } catch (err) {
      console.error('Failed to load at-risk students', err);
      message.error('Failed to load At-Risk Students data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    if (!activeSemesterId) return;
    try {
      const blob = await AtRiskStudentService.exportAtRiskStudents(activeSemesterId);
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AtRiskStudents_List.xlsx`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
      message.success('Export successful');
    } catch {
      message.error('Export failed');
    }
  };

  const columns: ColumnsType<AtRiskStudent> = [
    {
      title: 'STUDENT CODE',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{code}</span>
      ),
    },
    {
      title: 'FULL NAME',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string) => (
        <span style={{ fontSize: 13.5, fontWeight: 600, color: st.textPrimary }}>{name}</span>
      ),
    },
    {
      title: 'COMPANY',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (company: string) => (
        <span style={{ fontSize: 13, color: st.textSecondary }}>{company || '—'}</span>
      ),
    },
    {
      title: 'SUPERVISOR',
      dataIndex: 'supervisorName',
      key: 'supervisorName',
      render: (sup: string) => (
        <span style={{ fontSize: 13, color: st.textSecondary }}>{sup || '—'}</span>
      ),
    },
    {
      title: 'MISSED REPORTS',
      dataIndex: 'missedReports',
      key: 'missedReports',
      align: 'center',
      render: (count: number) => (
        <span style={{ 
          fontSize: 13, fontWeight: 700, 
          color: count > 0 ? st.error : st.textPrimary,
          background: count > 0 ? st.errorMuted : 'transparent',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {count || 0}
        </span>
      ),
    },
    {
      title: 'REJECTED REPORTS',
      dataIndex: 'rejectedReports',
      key: 'rejectedReports',
      align: 'center',
      render: (count: number) => (
        <span style={{ 
          fontSize: 13, fontWeight: 700, 
          color: count > 0 ? st.error : st.textPrimary,
          background: count > 0 ? st.errorMuted : 'transparent',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {count || 0}
        </span>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 24px 40px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: st.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={22} color={st.error} />
            At-Risk Students
          </h2>
          <p style={{ fontSize: 13, color: st.textMuted, margin: '4px 0 0' }}>
            Monitor students at risk of failing or missing required reports during OJT
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            icon={<RefreshCw size={14} />} 
            onClick={fetchData} 
            loading={loading}
            style={{ borderRadius: st.radiusMd, fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<Download size={14} />} 
            onClick={handleExport}
            style={{ borderRadius: st.radiusMd, fontWeight: 600, background: st.textPrimary }}
          >
            Export List
          </Button>
        </div>
      </div>

      <div style={{
        background: st.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${st.border}`, borderRadius: st.radiusLg, boxShadow: st.shadowSm, overflow: 'hidden'
      }}>
        <Table
          rowKey="assignmentId"
          columns={columns}
          dataSource={students}
          loading={loading}
          pagination={{ pageSize: 15 }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: st.textMuted }}>
                <AlertTriangle size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>No at-risk students found</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>All students are currently in good standing</div>
              </div>
            )
          }}
        />
      </div>
    </div>
  );
};
