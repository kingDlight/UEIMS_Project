import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag, Typography, Empty, Skeleton, Button, Space, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, CalendarOutlined, LinkOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { api } from '@/services/api';

const { Text } = Typography;

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
  danger: '#EF4444',
  dangerMuted: '#FEE2E2',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  radiusLg: 12,
  radiusMd: 8,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
};

interface Interview {
  id: string;
  scheduledAt: string;
  meetingLink?: string;
  location?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  application?: {
    jobPost?: { title: string };
    enterprise?: { name: string };
  };
}

export const InterviewsTab: React.FC = () => {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['myInterviews'],
    queryFn: async () => {
      const res = await api.get('/interviews/my');
      return (res.data?.content || res.data || []) as Interview[];
    },
  });

  const [confirmModal, setConfirmModal] = React.useState<Interview | null>(null);

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    SCHEDULED: { label: 'Đã lên lịch', color: '#F59E0B', bg: '#FEF3C7' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#3B82F6', bg: '#DBEAFE' },
    DECLINED: { label: 'Đã từ chối', color: '#EF4444', bg: '#FEE2E2' },
    COMPLETED: { label: 'Đã hoàn thành', color: '#10B981', bg: '#D1FAE5' },
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <Text style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary }}>
          Lịch phỏng vấn
        </Text>
        <Text style={{ display: 'block', color: cc.textMuted, fontSize: 13, marginTop: 2 }}>
          Xem và xác nhận lịch phỏng vấn từ doanh nghiệp
        </Text>
      </motion.div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : !interviews || interviews.length === 0 ? (
        <Empty description="Chưa có lịch phỏng vấn nào" style={{ padding: 60 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {interviews.map((interview, i) => {
            const status = statusMap[interview.status] || statusMap.SCHEDULED;
            const isActionable = interview.status === 'SCHEDULED';
            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                style={{
                  background: cc.surface,
                  borderRadius: cc.radiusLg,
                  border: `1px solid ${cc.borderSubtle}`,
                  boxShadow: cc.shadowSm,
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ color: cc.textPrimary, fontSize: 14, display: 'block', marginBottom: 4 }}>
                      {interview.application?.jobPost?.title || 'Vị trí phỏng vấn'}
                    </Text>
                    <Text style={{ fontSize: 12, color: cc.textMuted, display: 'block' }}>
                      {interview.application?.enterprise?.name}
                    </Text>
                  </div>
                  <Tag
                    style={{
                      borderRadius: cc.radiusFull,
                      background: status.bg,
                      color: status.color,
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {status.label}
                  </Tag>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: cc.textMuted }} />
                    <Text style={{ fontSize: 13, color: cc.textSecondary }}>
                      {new Date(interview.scheduledAt).toLocaleString('vi-VN')}
                    </Text>
                  </div>
                  {interview.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LinkOutlined style={{ color: cc.textMuted }} />
                      <Text style={{ fontSize: 13, color: cc.textSecondary }}>{interview.location}</Text>
                    </div>
                  )}
                  {interview.meetingLink && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LinkOutlined style={{ color: cc.brand }} />
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cc.brand }}>
                        Tham gia cuộc họp
                      </a>
                    </div>
                  )}
                </div>

                {isActionable && (
                  <Space style={{ marginTop: 4 }}>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      size="small"
                      onClick={() => setConfirmModal(interview)}
                      style={{ background: cc.brand, borderColor: cc.brand, borderRadius: cc.radiusMd, fontWeight: 600 }}
                    >
                      Xác nhận tham gia
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      size="small"
                      onClick={() => setConfirmModal(interview)}
                      style={{ borderRadius: cc.radiusMd, fontWeight: 600 }}
                    >
                      Từ chối
                    </Button>
                  </Space>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        title="Xác nhận tham gia phỏng vấn"
        open={!!confirmModal}
        onCancel={() => setConfirmModal(null)}
        footer={null}
        centered
      >
        {confirmModal && (
          <div>
            <p style={{ marginBottom: 16, color: cc.textSecondary }}>
              Bạn có chắc chắn muốn <strong style={{ color: cc.textPrimary }}>từ chối</strong> lịch phỏng vấn này không?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button onClick={() => setConfirmModal(null)} style={{ borderRadius: cc.radiusMd }}>Hủy</Button>
              <Button danger onClick={() => setConfirmModal(null)} style={{ borderRadius: cc.radiusMd }}>
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
