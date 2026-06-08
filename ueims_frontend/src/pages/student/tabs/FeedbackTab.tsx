import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Empty, Skeleton, Card } from 'antd';
import { StarOutlined } from '@ant-design/icons';
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
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  radiusLg: 12,
  radiusMd: 8,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
};

interface Feedback {
  id: string;
  semester: string;
  enterpriseName: string;
  trainingQuality: number;
  supervisorSupport: number;
  workEnvironment: number;
  overall: number;
  comment?: string;
  submittedAt: string;
}

export const FeedbackTab: React.FC = () => {
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['myFeedbacks'],
    queryFn: async () => {
      const res = await api.get('/student-enterprise-feedbacks/my');
      return (res.data?.content || res.data || []) as Feedback[];
    },
  });

  const renderStars = (rating: number) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarOutlined
          key={star}
          style={{
            fontSize: 14,
            color: star <= rating ? cc.warning : cc.border,
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <Text style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary }}>
          Đánh giá doanh nghiệp
        </Text>
        <Text style={{ display: 'block', color: cc.textMuted, fontSize: 13, marginTop: 2 }}>
          Xem lại đánh giá của bạn về các doanh nghiệp đã thực tập
        </Text>
      </motion.div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : !feedbacks || feedbacks.length === 0 ? (
        <Empty description="Chưa có đánh giá nào" style={{ padding: 60 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feedbacks.map((fb, i) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              style={{
                background: cc.surface,
                borderRadius: cc.radiusLg,
                border: `1px solid ${cc.borderSubtle}`,
                boxShadow: cc.shadowSm,
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <Text strong style={{ color: cc.textPrimary, fontSize: 15, display: 'block' }}>
                    {fb.enterpriseName}
                  </Text>
                  <Text style={{ fontSize: 12, color: cc.textMuted }}>
                    Học kỳ: {fb.semester}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 24, color: cc.warning }}>
                    {fb.overall}/5
                  </Text>
                  <div>{renderStars(fb.overall)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Chất lượng đào tạo', value: fb.trainingQuality },
                  { label: 'Hỗ trợ từ giám sát', value: fb.supervisorSupport },
                  { label: 'Môi trường làm việc', value: fb.workEnvironment },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '10px 12px',
                    borderRadius: cc.radiusMd,
                    background: cc.borderSubtle,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, color: cc.textMuted, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: cc.warning }}>{item.value}/5</div>
                  </div>
                ))}
              </div>

              {fb.comment && (
                <div style={{
                  marginTop: 12, padding: '10px 12px',
                  borderRadius: cc.radiusMd,
                  background: cc.brandMuted,
                  fontSize: 13, color: cc.textSecondary,
                }}>
                  "{fb.comment}"
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
