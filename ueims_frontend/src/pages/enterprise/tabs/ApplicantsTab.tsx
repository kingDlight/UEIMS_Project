import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Tag, Empty, Skeleton } from 'antd';
import { motion } from 'framer-motion';
import { api } from '@/services/api';

const { Text, Title } = Typography;

const cc = {
  brand: '#E96500',
  brandMuted: '#FFF3E8',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  borderSubtle: '#F3F4F6',
  radiusLg: 12,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
};

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ duyệt', color: '#F59E0B', bg: '#FEF3C7' },
  REVIEWED: { label: 'Đã xem', color: '#3B82F6', bg: '#DBEAFE' },
  INTERVIEWING: { label: 'Phỏng vấn', color: '#8B5CF6', bg: '#F3E5F5' },
  PASSED: { label: 'Đậu', color: '#10B981', bg: '#D1FAE5' },
  REJECTED: { label: 'Trượt', color: '#EF4444', bg: '#FEE2E2' },
};

export const ApplicantsTab: React.FC = () => {
  const { data: applicants, isLoading } = useQuery({
    queryKey: ['applicantsList'],
    queryFn: async () => {
      const res = await api.get('/applications/enterprise');
      return (res.data?.content || res.data || []);
    },
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: cc.textPrimary, margin: 0, marginBottom: 4 }}>
          Danh sách ứng viên
        </Title>
        <Text style={{ color: cc.textMuted, fontSize: 13 }}>Xem và quản lý tất cả ứng viên</Text>
      </motion.div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !applicants || applicants.length === 0 ? (
        <Empty description="Chưa có ứng viên nào" style={{ padding: 60 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {applicants.map((app: any, i: number) => {
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
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text strong style={{ color: cc.textPrimary, fontSize: 14, display: 'block' }}>
                    {app.student?.fullName}
                  </Text>
                  <Text style={{ fontSize: 12, color: cc.textMuted }}>
                    {app.jobPost?.title}
                  </Text>
                </div>
                <Tag style={{ background: status.bg, color: status.color, border: 'none', borderRadius: 9999, fontWeight: 700 }}>
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
