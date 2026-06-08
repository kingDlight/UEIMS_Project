import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag, Typography, Empty, Skeleton, Badge } from 'antd';
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
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  danger: '#EF4444',
  dangerMuted: '#FEE2E2',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  radiusLg: 12,
  radiusMd: 8,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
};

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ duyệt', color: '#F59E0B', bg: '#FEF3C7' },
  REVIEWED: { label: 'Đã xem', color: '#3B82F6', bg: '#DBEAFE' },
  INTERVIEWING: { label: 'Phỏng vấn', color: '#8B5CF6', bg: '#F3E5F5' },
  PASSED: { label: 'Đậu', color: '#10B981', bg: '#D1FAE5' },
  REJECTED: { label: 'Trượt', color: '#EF4444', bg: '#FEE2E2' },
  WITHDRAWN: { label: 'Đã hủy', color: '#6B7280', bg: '#F3F4F6' },
};

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  jobPost: {
    id: string;
    title: string;
    enterprise: { name: string };
  };
}

export const ApplicationsTab: React.FC = () => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await api.get('/applications/my');
      return (res.data?.content || res.data || []) as Application[];
    },
  });

  const grouped = useMemo(() => {
    if (!applications) return {};
    return applications.reduce((acc: Record<string, Application[]>, app: Application) => {
      acc[app.status] = acc[app.status] || [];
      acc[app.status].push(app);
      return acc;
    }, {});
  }, [applications]);

  const total = applications?.length || 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <Text style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary }}>
          Đơn ứng tuyển của tôi
        </Text>
        <Text style={{ display: 'block', color: cc.textMuted, fontSize: 13, marginTop: 2 }}>
          {total > 0 ? `Bạn đã nộp ${total} đơn ứng tuyển` : 'Chưa có đơn ứng tuyển nào'}
        </Text>
      </motion.div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : total === 0 ? (
        <Empty description="Bạn chưa nộp đơn ứng tuyển nào" style={{ padding: 60 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(applications || []).map((app, i) => {
            const status = statusMap[app.status] || statusMap.PENDING;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                style={{
                  background: cc.surface,
                  borderRadius: cc.radiusLg,
                  border: `1px solid ${cc.borderSubtle}`,
                  boxShadow: cc.shadowSm,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ color: cc.textPrimary, fontSize: 14, display: 'block', marginBottom: 4 }}>
                    {app.jobPost?.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: cc.textMuted, display: 'block', marginBottom: 6 }}>
                    {app.jobPost?.enterprise?.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: cc.textMuted }}>
                    Nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </div>
                <Tag
                  style={{
                    borderRadius: cc.radiusFull,
                    background: status.bg,
                    color: status.color,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {status.label}
                </Tag>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
