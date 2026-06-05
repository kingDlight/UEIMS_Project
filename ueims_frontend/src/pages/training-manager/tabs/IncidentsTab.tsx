import React, { useState, useEffect } from 'react';
import { Spin, message, Modal, Form, Input, Button } from 'antd';
import { c } from '../constants';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { IncidentService } from '@/services/IncidentService';
import { TrainingWarningService } from '@/services/TrainingWarningService';
import type { Incident } from '../types';
import { useAuthStore } from '@/stores/useAuthStore';

export const IncidentsTab: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await IncidentService.getAll();
      setIncidents(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sự cố.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openResolveModal = (incident: Incident) => {
    setSelectedIncident(incident);
    form.resetFields();
    setResolveModalOpen(true);
  };

  const openWarningModal = (incident: Incident) => {
    setSelectedIncident(incident);
    form.resetFields();
    setWarningModalOpen(true);
  };

  const handleResolve = async (values: any) => {
    if (!selectedIncident) return;
    setSubmitting(true);
    try {
      await IncidentService.resolve(selectedIncident.incidentId, { resolutionNote: values.resolutionNote });
      message.success('Đã giải quyết sự cố.');
      setResolveModalOpen(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWarning = async (values: any) => {
    if (!selectedIncident) return;
    setSubmitting(true);
    try {
      // Gọi API gửi warning.
      // Dựa trên controller POST /api/training-warnings
      await TrainingWarningService.create({
        studentId: selectedIncident.assignment?.student?.userId, // Assuming assignment has student userId
        tmId: user?.userId,
        semesterId: selectedIncident.assignment?.student?.semester?.semesterId,
        weekNumber: 1, // Default or require input
        warningMessage: values.warningMessage
      });
      message.success('Đã gửi cảnh cáo.');
      setWarningModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi gửi cảnh cáo.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverity = (category: string) => {
    if (category.toLowerCase().includes('harassment') || category.toLowerCase().includes('accident')) return 'high';
    if (category.toLowerCase().includes('attendance')) return 'medium';
    return 'low';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>At-Risk Students & Incident Reports</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Handle lazy reporting, negative company feedback, and close incident cases</p>
          </div>
          <SmallPill color={c.danger}>{incidents.filter(i => i.status === 'OPEN').length} active issues</SmallPill>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: c.textMuted }}>
            Không có sự cố nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {incidents.map((incident) => {
              const severity = getSeverity(incident.category);
              const isClosed = incident.status !== 'OPEN';
              return (
                <div key={incident.incidentId} style={{ opacity: isClosed ? 0.7 : 1, padding: '14px 16px', borderRadius: 18, background: severity === 'high' ? '#fef2f2' : '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr .9fr auto', gap: 14, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: c.text }}>{incident.assignment?.student?.fullName || 'N/A'}</div>
                      <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>{incident.assignment?.student?.studentCode || 'N/A'}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: c.textMuted }}>{incident.assignment?.enterprise?.companyName || 'N/A'}</div>
                    <SmallPill color={severity === 'high' ? c.danger : severity === 'medium' ? c.warning : c.info}>{severity}</SmallPill>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {!isClosed && (
                        <>
                          <button onClick={() => openWarningModal(incident)} style={{ padding: '9px 12px', borderRadius: 12, border: 'none', background: c.warning, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Send Warning</button>
                          <button onClick={() => openResolveModal(incident)} style={{ padding: '9px 12px', borderRadius: 12, border: 'none', background: c.success, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Resolve Incident</button>
                        </>
                      )}
                      {isClosed && <SmallPill color={c.success}>Resolved</SmallPill>}
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.6, marginTop: 10 }}>Type: {incident.category} · Reported on {new Date(incident.createdAt).toLocaleDateString()}</div>
                  <div style={{ fontSize: 13, color: c.text, marginTop: 4 }}>{incident.description}</div>
                </div>
              );
            })}
          </div>
        )}
      </NeuSurface>

      {/* Modal Resolve */}
      <Modal title="Giải quyết sự cố" open={resolveModalOpen} onCancel={() => setResolveModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleResolve}>
          <Form.Item name="resolutionNote" label="Lý do giải quyết (Bắt buộc)" rules={[{ required: true, message: 'Vui lòng nhập ghi chú giải quyết' }]}>
            <Input.TextArea rows={4} placeholder="Nhập ghi chú xử lý..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setResolveModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Lưu</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Warning */}
      <Modal title="Gửi cảnh cáo" open={warningModalOpen} onCancel={() => setWarningModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSendWarning}>
          <Form.Item name="warningMessage" label="Nội dung cảnh cáo" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <Input.TextArea rows={4} placeholder="Sinh viên vi phạm nghiêm trọng quy định..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setWarningModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" danger htmlType="submit" loading={submitting}>Gửi</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
