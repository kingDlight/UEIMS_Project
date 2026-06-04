import React, { useState, useEffect } from 'react';
import { Spin, message, Modal, Form, Input, Button } from 'antd';
import { c } from '../constants';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { EligibleStudentService } from '@/services/EligibleStudentService';
import { SemesterService } from '@/services/SemesterService';
import type { EligibleStudent } from '../types';

export const OJTTab: React.FC = () => {
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  // We should know the active semester for locking or exporting, but let's just use the first student's semester or fetch active.
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allStudents, activeSem] = await Promise.all([
        EligibleStudentService.getAll(),
        SemesterService.getActiveSemester()
      ]);
      // Only show students who are going to OJT or cancelled
      const filtered = allStudents.filter(s => ['MATCHED', 'ACCEPTED', 'OJT', 'CANCELLED'].includes(s.status));
      setStudents(filtered);
      if (activeSem) setActiveSemesterId(activeSem.semesterId);
    } catch (error) {
      message.error('Lỗi khi tải danh sách OJT.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveList = async () => {
    const idsToApprove = students.filter(s => ['MATCHED', 'ACCEPTED'].includes(s.status)).map(s => s.eligibleId);
    if (idsToApprove.length === 0) {
      message.info('Không có sinh viên nào cần duyệt (tất cả đã OJT hoặc Huỷ).');
      return;
    }
    
    Modal.confirm({
      title: 'Duyệt danh sách OJT chính thức',
      content: `Bạn có chắc chắn duyệt ${idsToApprove.length} sinh viên sang trạng thái OJT?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await EligibleStudentService.finalizeOjtList(idsToApprove);
          message.success('Duyệt danh sách thành công!');
          loadData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra.');
        }
      }
    });
  };

  const handleLockSemester = () => {
    if (!activeSemesterId) {
      message.error('Không tìm thấy kỳ học ACTIVE hiện tại.');
      return;
    }
    Modal.confirm({
      title: 'Khóa dữ liệu kỳ học',
      content: 'Sau khi khóa, dữ liệu sinh viên của kỳ này sẽ không thể thay đổi. Bạn có chắc chắn không?',
      okText: 'Khóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await SemesterService.lockSemester(activeSemesterId);
          message.success('Đã khóa kỳ học thành công!');
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Lỗi khi khóa kỳ học.');
        }
      }
    });
  };

  const openCancelModal = (student: EligibleStudent) => {
    setSelectedStudent(student);
    form.resetFields();
    setCancelModalOpen(true);
  };

  const handleCancelResult = async (values: any) => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await EligibleStudentService.cancelOjtResult(selectedStudent.eligibleId, values.reason);
      message.success('Đã huỷ kết quả thực tập!');
      setCancelModalOpen(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi huỷ kết quả.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>Official OJT List</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Finalize students who have secured internship placements and control semester lock actions</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleApproveList} style={{ padding: '10px 14px', borderRadius: 14, border: 'none', background: c.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Approve Official List</button>
            <button onClick={handleLockSemester} style={{ padding: '10px 14px', borderRadius: 14, border: 'none', background: c.warning, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Lock Semester Data</button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: c.textMuted }}>
            Không có sinh viên nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {students.map((app) => (
              <div key={app.eligibleId} style={{ padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1.2fr .8fr auto', gap: 14, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: c.text }}>{app.fullName}</div>
                    <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>{app.studentCode}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>{app.major}</div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>GPA: {app.gpa}</div>
                  <SmallPill color={app.status === 'CANCELLED' ? c.danger : app.status === 'OJT' ? c.success : c.warning}>{app.status}</SmallPill>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {app.status !== 'CANCELLED' && (
                      <button onClick={() => openCancelModal(app)} style={{ padding: '8px 12px', borderRadius: 12, border: 'none', background: '#fee2e2', color: c.danger, fontWeight: 700, cursor: 'pointer' }}>Cancel Result</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeuSurface>

      {/* Cancel Modal */}
      <Modal title="Huỷ kết quả OJT" open={cancelModalOpen} onCancel={() => setCancelModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCancelResult}>
          <Form.Item name="reason" label="Lý do huỷ kết quả (Bắt buộc)" rules={[{ required: true, message: 'Vui lòng nhập lý do huỷ' }]}>
            <Input.TextArea rows={4} placeholder="Sinh viên vi phạm quy chế..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCancelModalOpen(false)} style={{ marginRight: 8 }}>Đóng</Button>
            <Button type="primary" danger htmlType="submit" loading={submitting}>Xác nhận huỷ</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
