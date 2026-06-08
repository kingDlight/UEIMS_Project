import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Tag, Empty, Skeleton, Progress } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
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
  radiusMd: 8,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
  success: '#10B981',
  successMuted: '#D1FAE5',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
};

export const SupervisionTab: React.FC = () => {
  const { data: interns, isLoading } = useQuery({
    queryKey: ['myInterns'],
    queryFn: async () => {
      const res = await api.get('/applications/enterprise/interns');
      return (res.data?.content || res.data || []);
    },
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: cc.textPrimary, margin: 0, marginBottom: 4 }}>
          <TeamOutlined style={{ color: cc.brand, marginRight: 8 }} />
          Giám sát thực tập sinh
        </Title>
        <Text style={{ color: cc.textMuted, fontSize: 13 }}>Theo dõi tiến độ thực tập của các sinh viên đã được nhận</Text>
      </motion.div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !interns || interns.length === 0 ? (
        <Empty description="Chưa có thực tập sinh nào" style={{ padding: 60 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(interns as any[]).map((intern, i) => (
            <motion.div
              key={intern.id}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${cc.brand}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cc.brand, fontWeight: 900, fontSize: 16,
                }}>
                  {intern.fullName?.substring(0, 2).toUpperCase() || 'SV'}
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ color: cc.textPrimary, fontSize: 15, display: 'block' }}>
                    {intern.fullName}
                  </Text>
                  <Text style={{ color: cc.textMuted, fontSize: 12 }}>
                    {intern.major} · {intern.email}
                  </Text>
                </div>
                <Tag style={{ background: cc.successMuted, color: cc.success, border: 'none', borderRadius: 9999, fontWeight: 700 }}>
                  Đang thực tập
                </Tag>
              </div>

              {intern.evaluation?.finalScore && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: cc.radiusMd,
                  background: `${cc.info}10`, border: `1px solid ${cc.info}20`,
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 13, color: cc.textSecondary }}>Điểm chấm điểm:</Text>
                  <Text strong style={{ color: cc.info, fontSize: 15 }}>
                    {intern.evaluation.finalScore}/5
                  </Text>
                  <Progress
                    percent={Math.round((intern.evaluation.finalScore / 5) * 100)}
                    size="small"
                    strokeColor={cc.info}
                    style={{ flex: 1, margin: 0 }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 14px', borderRadius: cc.radiusMd, background: cc.borderSubtle }}>
                  <Text style={{ fontSize: 11, color: cc.textMuted, display: 'block' }}>Vị trí</Text>
                  <Text style={{ fontSize: 13, color: cc.textPrimary, fontWeight: 600 }}>
                    {intern.jobPost?.title}
                  </Text>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: cc.radiusMd, background: cc.borderSubtle }}>
                  <Text style={{ fontSize: 11, color: cc.textMuted, display: 'block' }}>Email</Text>
                  <Text style={{ fontSize: 13, color: cc.textPrimary, fontWeight: 600 }}>
                    {intern.email}
                  </Text>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
