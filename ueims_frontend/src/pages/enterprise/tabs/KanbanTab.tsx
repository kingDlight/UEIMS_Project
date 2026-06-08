import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Typography, Button, Modal, DatePicker, Form, Input, Empty, Spin } from 'antd';
import { CalendarOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { api } from '@/services/api';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const cc = {
  brand: '#E96500',
  brandMuted: '#FFF3E8',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  borderSubtle: '#F3F4F6',
  border: '#E5E7EB',
  success: '#10B981',
  successMuted: '#D1FAE5',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  danger: '#EF4444',
  dangerMuted: '#FEE2E2',
  purple: '#8B5CF6',
  purpleMuted: '#F3E5F5',
  radiusLg: 12,
  radiusMd: 8,
  radiusFull: 9999,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07)',
};

const COLUMNS = [
  { id: 'PENDING', label: 'Chờ duyệt', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'INTERVIEWING', label: 'Phỏng vấn', color: '#8B5CF6', bg: '#F3E5F5' },
  { id: 'PASSED', label: 'Đậu', color: '#10B981', bg: '#D1FAE5' },
  { id: 'REJECTED', label: 'Trượt', color: '#EF4444', bg: '#FEE2E2' },
];

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    major?: string;
  };
  jobPost: { id: string; title: string };
}

// ============================================================
// DRAGGABLE CARD COMPONENT (using hook API)
// ============================================================
interface DraggableCardProps {
  app: Application;
  col: { color: string; bg: string };
  canDrag: boolean;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ app, col, canDrag }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    disabled: !canDrag,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: canDrag ? 'grab' : 'default',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={{ ...style, marginBottom: 8 }}>
      <motion.div
        whileHover={canDrag ? { y: -2 } : {}}
        style={{
          background: cc.surface,
          borderRadius: cc.radiusMd,
          border: `1px solid ${isDragging ? col.color : cc.borderSubtle}`,
          boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.12)' : cc.shadowSm,
          padding: '12px 14px',
          userSelect: 'none',
        }}
        {...(canDrag ? { ...listeners, ...attributes } : {})}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: cc.radiusMd,
            background: `${col.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: col.color, fontWeight: 900, fontSize: 13, flexShrink: 0,
          }}>
            {app.student?.fullName?.substring(0, 2).toUpperCase() || 'SV'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: cc.textPrimary,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {app.student?.fullName}
            </div>
            <div style={{ fontSize: 11, color: cc.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {app.jobPost?.title}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {app.student?.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MailOutlined style={{ fontSize: 11, color: cc.textMuted, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: cc.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.student.email}</span>
            </div>
          )}
          {app.student?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneOutlined style={{ fontSize: 11, color: cc.textMuted, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: cc.textSecondary }}>{app.student.phone}</span>
            </div>
          )}
          {app.student?.major && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BankOutlined style={{ fontSize: 11, color: cc.textMuted, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: cc.textSecondary }}>{app.student.major}</span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: cc.textMuted }}>
          <CalendarOutlined /> {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// COLUMN COMPONENT (using hook API)
// ============================================================
interface KanbanColumnProps {
  col: { id: string; label: string; color: string; bg: string };
  items: Application[];
  activeId: string | null;
  canDrag: (status: string) => boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ col, items, activeId, canDrag }) => {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: `${cc.radiusMd}px ${cc.radiusMd}px 0 0`,
        background: col.bg,
        border: `1px solid ${col.color}25`,
        borderBottom: 'none',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
          <Text style={{ fontWeight: 700, color: col.color, fontSize: 13 }}>{col.label}</Text>
        </div>
        <span style={{
          minWidth: 24, height: 24, borderRadius: cc.radiusFull,
          background: `${col.color}20`, color: col.color, fontWeight: 700, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px',
        }}>
          {items.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        style={{
          minHeight: 240,
          borderRadius: cc.radiusMd,
          background: isOver ? `${col.color}08` : cc.borderSubtle,
          border: `2px dashed ${isOver ? col.color : cc.border}`,
          transition: 'background 0.2s, border-color 0.2s',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {items.length === 0 && !isOver && (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: cc.textMuted, fontSize: 13 }}>
            Chưa có ứng viên
          </div>
        )}
        {items.map((app) => (
          <DraggableCard
            key={app.id}
            app={app}
            col={col}
            canDrag={canDrag(app.status)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================
// MAIN KANBAN TAB
// ============================================================
export const KanbanTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [interviewModal, setInterviewModal] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState<dayjs.Dayjs | null>(null);
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { data: applications, isLoading } = useQuery({
    queryKey: ['enterpriseApplications'],
    queryFn: async () => {
      const res = await api.get('/applications/enterprise');
      return (res.data?.content || res.data || []) as Application[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.put(`/applications/${id}/status`, { status });
    },
    onSuccess: (_, { status }) => {
      const label = COLUMNS.find(c => c.id === status)?.label || status;
      messageApi.success(`Đã chuyển ứng viên sang "${label}"`);
      queryClient.invalidateQueries({ queryKey: ['enterpriseApplications'] });
    },
    onError: () => messageApi.error('Cập nhật trạng thái thất bại!'),
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async ({ applicationId, data }: { applicationId: string; data: any }) => {
      return api.post(`/applications/${applicationId}/schedule-interview`, data);
    },
    onSuccess: () => {
      messageApi.success('Đã lên lịch phỏng vấn!');
      queryClient.invalidateQueries({ queryKey: ['enterpriseApplications'] });
      setInterviewModal(null);
      setInterviewDate(null);
      setInterviewLocation('');
      setInterviewLink('');
      form.resetFields();
    },
    onError: () => messageApi.error('Lên lịch thất bại!'),
  });

  const columns = useMemo(() => {
    const map: Record<string, Application[]> = {};
    COLUMNS.forEach(col => { map[col.id] = []; });
    (applications || []).forEach((app: Application) => {
      const colId = COLUMNS.find(c => c.id === app.status)?.id;
      if (colId) map[colId].push(app);
    });
    return map;
  }, [applications]);

  const activeApp = useMemo(
    () => (applications as Application[] | undefined)?.find(a => a.id === activeId),
    [applications, activeId]
  );

  const canDrag = (status: string) => ['PENDING', 'INTERVIEWING'].includes(status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const newStatus = over.id as string;
    const appId = active.id as string;
    const app = (applications as Application[] | undefined)?.find((a: Application) => a.id === appId);
    if (!app || app.status === newStatus) return;

    if (newStatus === 'INTERVIEWING') {
      setInterviewModal(app);
    } else {
      updateStatusMutation.mutate({ id: appId, status: newStatus });
    }
  };

  const handleConfirmInterview = () => {
    if (!interviewModal || !interviewDate) return;
    if (interviewDate.isBefore(dayjs())) {
      messageApi.error('Ngày hẹn phỏng vấn không được nằm trong quá khứ!');
      return;
    }
    setConfirmLoading(true);
    scheduleInterviewMutation.mutateAsync({
      applicationId: interviewModal.id,
      data: {
        scheduledAt: interviewDate.toISOString(),
        location: interviewLocation,
        meetingLink: interviewLink,
      },
    }).finally(() => setConfirmLoading(false));
  };

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {contextHolder}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <Title level={4} style={{ color: cc.textPrimary, margin: 0, marginBottom: 4 }}>
          Bảng quản lý ứng viên
        </Title>
        <Text style={{ color: cc.textMuted, fontSize: 13 }}>
          Kéo thả thẻ ứng viên để cập nhật trạng thái tuyển dụng
        </Text>
      </motion.div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(280px, 1fr))`,
            gap: 16,
            alignItems: 'start',
          }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                items={columns[col.id] || []}
                activeId={activeId}
                canDrag={canDrag}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApp && (() => {
              const col = COLUMNS.find(c => c.id === activeApp.status) || COLUMNS[0];
              return (
                <div style={{ width: 280, cursor: 'grabbing' }}>
                  <motion.div
                    initial={{ scale: 1.02 }}
                    style={{
                      background: cc.surface,
                      borderRadius: cc.radiusMd,
                      border: `2px solid ${col.color}`,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                      padding: '12px 14px',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: cc.radiusMd,
                        background: `${col.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: col.color, fontWeight: 900, fontSize: 13,
                      }}>
                        {activeApp.student?.fullName?.substring(0, 2).toUpperCase() || 'SV'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: cc.textPrimary }}>
                          {activeApp.student?.fullName}
                        </div>
                        <div style={{ fontSize: 11, color: cc.textMuted }}>
                          {activeApp.jobPost?.title}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })()}
          </DragOverlay>
        </DndContext>
      )}

      {/* Interview Modal */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary }}>Lên lịch phỏng vấn</span>}
        open={!!interviewModal}
        onCancel={() => !confirmLoading && setInterviewModal(null)}
        footer={null}
        centered
        bodyStyle={{ padding: '20px 24px' }}
      >
        {interviewModal && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: cc.radiusMd,
              background: cc.purpleMuted, border: `1px solid ${cc.purple}20`,
              marginBottom: 16,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `${cc.purple}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cc.purple, fontWeight: 900, fontSize: 14,
              }}>
                {interviewModal.student?.fullName?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <Text strong style={{ color: cc.textPrimary, fontSize: 14 }}>{interviewModal.student?.fullName}</Text>
                <br />
                <Text style={{ color: cc.textMuted, fontSize: 12 }}>{interviewModal.student?.email}</Text>
              </div>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item label="Ngày & Giờ phỏng vấn" required rules={[{ required: true, message: 'Vui lòng chọn ngày giờ' }]}>
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  value={interviewDate}
                  onChange={(d) => setInterviewDate(d)}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày và giờ"
                />
                {interviewDate && interviewDate.isBefore(dayjs()) && (
                  <Text style={{ color: cc.danger, fontSize: 12 }}>Ngày hẹn không được nằm trong quá khứ!</Text>
                )}
              </Form.Item>
              <Form.Item label="Địa điểm">
                <Input prefix={<BankOutlined style={{ color: cc.textMuted }} />} placeholder="Phòng họp A, Tầng 3..." value={interviewLocation} onChange={(e) => setInterviewLocation(e.target.value)} />
              </Form.Item>
              <Form.Item label="Link cuộc họp (nếu có)">
                <Input prefix={<MailOutlined style={{ color: cc.textMuted }} />} placeholder="https://meet.google.com/..." value={interviewLink} onChange={(e) => setInterviewLink(e.target.value)} />
              </Form.Item>
            </Form>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button onClick={() => setInterviewModal(null)} disabled={confirmLoading} style={{ borderRadius: cc.radiusMd }}>Hủy</Button>
              <Button
                type="primary"
                loading={confirmLoading}
                onClick={handleConfirmInterview}
                disabled={!interviewDate || interviewDate.isBefore(dayjs())}
                style={{ background: cc.brand, borderColor: cc.brand, borderRadius: cc.radiusMd, fontWeight: 600 }}
              >
                Lên lịch phỏng vấn
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="repeat(4, minmax"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          div[style*="repeat(4, minmax"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
