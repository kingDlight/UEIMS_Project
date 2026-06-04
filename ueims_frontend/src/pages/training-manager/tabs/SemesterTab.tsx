import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Button, Spin, message, Popconfirm } from 'antd';
import { c } from '../constants';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { SemesterService } from '@/services/SemesterService';
import type { SemesterResponse } from '@/services/SemesterService';

export const SemesterTab: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadSemesters = async () => {
    try {
      setLoading(true);
      const data = await SemesterService.getAllSemesters();
      setSemesters(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách Học kỳ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        semesterCode: values.semesterCode,
        name: values.name,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        weeklyReportDeadlineDay: 'SUNDAY',
        weeklyReportDeadlineTime: '23:59:00',
      };
      await SemesterService.createSemester(payload);
      message.success('Tạo học kỳ thành công!');
      setIsModalOpen(false);
      form.resetFields();
      loadSemesters();
    } catch (error) {
      message.error('Lỗi khi tạo Học kỳ mới.');
    }
  };

  const handleActivate = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'DRAFT') {
        // Backend yêu cầu phải chuyển sang OPEN trước khi ACTIVE
        await SemesterService.openSemester(id);
      }
      await SemesterService.activateSemester(id);
      message.success('Đã kích hoạt học kỳ!');
      loadSemesters();
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Lỗi khi kích hoạt Học kỳ.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return c.success;
      case 'OPEN': return c.primary;
      case 'LOCKED': return c.danger;
      default: return c.textMuted;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>Quản lý Học kỳ</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Tạo học kỳ mới và quản lý trạng thái (Chỉ 1 học kỳ được ACTIVE cùng lúc)</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '10px 14px', borderRadius: 14, border: 'none', background: c.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}
          >
            Tạo Học kỳ
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spin size="large" /></div>
        ) : semesters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: c.textMuted }}>
            Chưa có học kỳ nào. Vui lòng bấm Tạo Học kỳ.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {semesters.map((semester) => (
              <div key={semester.semesterId} style={{ padding: '16px 18px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr .8fr auto', gap: 16, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{semester.name}</div>
                    <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>{semester.semesterCode}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>{semester.startDate} → {semester.endDate}</div>
                  <SmallPill color={getStatusColor(semester.status)}>{semester.status}</SmallPill>
                  
                  {semester.status !== 'ACTIVE' ? (
                    <Popconfirm
                      title="Kích hoạt Học kỳ này?"
                      description="Học kỳ đang Active hiện tại sẽ bị chuyển trạng thái. Bạn có chắc không?"
                      onConfirm={() => handleActivate(semester.semesterId, semester.status)}
                      okText="Kích hoạt"
                      cancelText="Hủy"
                    >
                      <button style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: c.success, fontWeight: 700, cursor: 'pointer' }}>
                        Set Active
                      </button>
                    </Popconfirm>
                  ) : (
                    <button disabled style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: c.textMuted, fontWeight: 700, cursor: 'not-allowed' }}>
                      Đang Active
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </NeuSurface>

      <Modal
        title={<span style={{ fontWeight: 800, fontSize: 18 }}>Tạo Học kỳ Mới</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 24 }}>
          <Form.Item name="semesterCode" label={<b>Mã Học kỳ (Code)</b>} rules={[{ required: true, message: 'Vui lòng nhập mã học kỳ!' }]}>
            <Input placeholder="Ví dụ: SU26" size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="name" label={<b>Tên Học kỳ</b>} rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="Ví dụ: Summer 2026" size="large" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="dateRange" label={<b>Thời gian diễn ra</b>} rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
            <DatePicker.RangePicker size="large" style={{ width: '100%', borderRadius: 10 }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8, borderRadius: 10, fontWeight: 600 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ borderRadius: 10, fontWeight: 600, background: c.primary }}>Tạo mới</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
