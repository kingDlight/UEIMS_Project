import React, { useState, useEffect } from 'react';
import { Spin, message, Modal, Form, Input, Select, Button } from 'antd';
import { c } from '../constants';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { SystemAnnouncementService } from '@/services/SystemAnnouncementService';
import { SemesterService } from '@/services/SemesterService';
import type { SystemAnnouncement, Semester } from '../types';

export const NoticesTab: React.FC = () => {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, semData] = await Promise.all([
        SystemAnnouncementService.getAll(),
        SemesterService.getAll()
      ]);
      setAnnouncements(data);
      setSemesters(semData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await SystemAnnouncementService.publish(id);
      message.success('Đã xuất bản thông báo thành công.');
      loadData();
    } catch (error) {
      message.error('Lỗi khi xuất bản thông báo.');
    }
  };

  const getTone = (status: string) => {
    if (status === 'PUBLISHED') return c.success;
    if (status === 'DRAFT') return c.warning;
    return c.textMuted;
  };

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (notice: SystemAnnouncement) => {
    setEditingId(notice.announcementId);
    form.setFieldsValue({
      title: notice.title,
      content: notice.content,
      semesterId: notice.semester?.semesterId || undefined,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await SystemAnnouncementService.update(editingId, values);
        message.success('Cập nhật thông báo thành công!');
      } else {
        await SystemAnnouncementService.create(values);
        message.success('Lưu bản nháp thành công!');
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>Notice Management</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Broadcast official school-wide notices to enterprises and students</p>
          </div>
          <button onClick={openCreateModal} style={{ padding: '10px 14px', borderRadius: 14, border: 'none', background: c.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Draft New Notice</button>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: c.textMuted }}>
            Chưa có thông báo nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map((announcement) => (
              <div key={announcement.announcementId} style={{ padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr .8fr auto', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{announcement.title}</div>
                  <div style={{ fontSize: 12.5, color: c.textMuted }}>{announcement.semester ? `Semester: ${announcement.semester.semesterCode}` : 'Toàn hệ thống'}</div>
                  <SmallPill color={getTone(announcement.status)}>{announcement.status}</SmallPill>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => openEditModal(announcement)} style={{ padding: '9px 12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: c.text, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                    {announcement.status === 'DRAFT' && (
                      <button onClick={() => handlePublish(announcement.announcementId)} style={{ padding: '9px 12px', borderRadius: 12, border: 'none', background: c.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Publish</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeuSurface>

      <Modal
        title={editingId ? "Sửa thông báo" : "Tạo thông báo mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <Input.TextArea rows={4} placeholder="Nhập nội dung" />
          </Form.Item>
          <Form.Item name="semesterId" label="Kỳ học (Tùy chọn)">
            <Select placeholder="Chọn kỳ học (để trống nếu thông báo toàn trường)" allowClear>
              {semesters.map(sem => (
                <Select.Option key={sem.semesterId} value={sem.semesterId}>
                  {sem.semesterCode}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingId ? 'Cập nhật' : 'Lưu bản nháp'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
