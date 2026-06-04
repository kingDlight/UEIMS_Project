import React, { useState, useEffect, useRef } from 'react';
import { Spin, message } from 'antd';
import { c } from '../constants';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { EligibleStudentService } from '@/services/EligibleStudentService';
import { SemesterService } from '@/services/SemesterService';
import type { EligibleStudent } from '../types';

export const StudentsTab: React.FC = () => {
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await EligibleStudentService.getAllEligibleStudents();
      setStudents(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      message.loading({ content: 'Đang xử lý file Excel...', key: 'import' });
      
      const activeSemester = await SemesterService.getActiveSemester();
      if (!activeSemester) {
        throw new Error('Không tìm thấy Học kỳ ACTIVE nào để Import.');
      }

      await EligibleStudentService.importFromExcel(file, activeSemester.semesterId);
      message.success({ content: 'Import dữ liệu thành công!', key: 'import' });
      loadStudents();
    } catch (error: any) {
      const backendMsg = error.response?.data?.message;
      message.error({ content: backendMsg || error.message || 'Lỗi khi import Excel.', key: 'import' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    try {
      message.loading({ content: 'Đang xuất file...', key: 'export' });
      const activeSemester = await SemesterService.getActiveSemester();
      if (!activeSemester) {
        throw new Error('Không tìm thấy Học kỳ ACTIVE nào để Export.');
      }

      const blob = await EligibleStudentService.exportToExcel(activeSemester.semesterId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `OJT_Students_${activeSemester.semesterCode}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success({ content: 'Xuất file thành công!', key: 'export' });
    } catch (error: any) {
      message.error({ content: error.message || 'Lỗi khi xuất file.', key: 'export' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>Danh sách Sinh viên</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Quản lý danh sách sinh viên đủ điều kiện thực tập OJT</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '10px 14px', borderRadius: 14, border: 'none', background: c.primary, color: '#fff', fontWeight: 800, cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.7 : 1 }}
            >
              {importing ? 'Đang Import...' : 'Import Excel'}
            </button>
            <button
              onClick={handleExport}
              style={{ padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(233,101,0,.16)', background: '#fff', color: c.primaryDark, fontWeight: 800, cursor: 'pointer' }}
            >
              Export Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: c.textMuted }}>
            Chưa có dữ liệu sinh viên. Vui lòng Import từ file Excel.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {students.map((student) => (
              <div key={student.eligibleId} style={{ padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.4fr .8fr .8fr', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{student.studentCode}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: c.text }}>{student.fullName}</div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>{student.major}</div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>GPA {student.gpa}</div>
                  <SmallPill color={student.status === 'ELIGIBLE' ? c.success : c.purple}>{student.status}</SmallPill>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeuSurface>
    </div>
  );
};
