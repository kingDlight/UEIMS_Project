import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Select, Tag, Card, Empty, Typography, Button, Modal, message, Skeleton, Spin } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, BankOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { JobPostService } from '@/services/JobPostService';
import { ApplicationService } from '@/services/ApplicationService';
import { StudentProfileService } from '@/services/StudentProfileService';
import { api } from '@/services/api';

const { Text, Title } = Typography;

const cc = {
  brand: '#E96500',
  brandMuted: '#FFF3E8',
  brandLight: '#FFF2E8',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  borderSubtle: '#F3F4F6',
  border: '#E5E7EB',
  success: '#10B981',
  successMuted: '#D1FAE5',
  successText: '#065F46',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  danger: '#EF4444',
  dangerMuted: '#FEE2E2',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  radiusLg: 12,
  radiusMd: 8,
  radiusFull: 9999,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  shadowBrand: '0 4px 12px rgba(233,101,0,0.25)',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Đang tuyển', color: '#10B981', bg: '#D1FAE5' },
  CLOSED: { label: 'Đã đóng', color: '#6B7280', bg: '#F3F4F6' },
  ON_HOLD: { label: 'Tạm ngưng', color: '#F59E0B', bg: '#FEF3C7' },
  DRAFT: { label: 'Nháp', color: '#9CA3AF', bg: '#F9FAFB' },
};

interface JobPost {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  slots: number;
  technology: string[];
  status: string;
  deadline: string;
  enterprise: {
    id: string;
    name: string;
    logo?: string;
    sector: string;
    size: string;
  };
  createdAt: string;
}

export const JobBoardTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [search, setSearch] = useState('');
  const [filterTech, setFilterTech] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>('OPEN');
  const [applyModal, setApplyModal] = useState<JobPost | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { data: jobPosts, isLoading } = useQuery({
    queryKey: ['jobPosts', filterStatus],
    queryFn: async () => {
      const res = await JobPostService.getAll();
      return (res.data?.content || res.data || []) as JobPost[];
    },
  });

  const { data: myProfile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await api.get('/users/myInfo');
      const sp = await StudentProfileService.getById(res.data.id);
      return sp.data;
    },
  });

  const { data: existingApps } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await ApplicationService.getAll();
      return res.data || [];
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (jobPostId: string) => {
      const res = await ApplicationService.create({
        jobPostId,
        studentId: myProfile?.id,
        status: 'PENDING',
      });
      return res;
    },
    onSuccess: () => {
      messageApi.success('Nộp đơn thành công! Chúc bạn may mắn!');
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      setApplyModal(null);
    },
    onError: (err: any) => {
      messageApi.error(err?.response?.data?.message || 'Nộp đơn thất bại!');
    },
  });

  const allTechnologies = Array.from(
    new Set((jobPosts || []).flatMap((jp: JobPost) => jp.technology || []))
  ).sort();

  const filtered = (jobPosts || []).filter((jp: JobPost) => {
    const matchSearch =
      !search ||
      jp.title?.toLowerCase().includes(search.toLowerCase()) ||
      jp.enterprise?.name?.toLowerCase().includes(search.toLowerCase()) ||
      jp.location?.toLowerCase().includes(search.toLowerCase());
    const matchTech = !filterTech || jp.technology?.includes(filterTech);
    const matchStatus = !filterStatus || jp.status === filterStatus;
    return matchSearch && matchTech && matchStatus;
  });

  const hasApplied = (jobId: string) =>
    (existingApps || []).some((a: any) => a.jobPostId === jobId || a.jobPost?.id === jobId);

  const isAlreadyApplied = applyModal ? hasApplied(applyModal.id) : false;

  const handleConfirmApply = () => {
    if (!applyModal) return;
    setConfirmLoading(true);
    applyMutation.mutateAsync(applyModal.id).finally(() => setConfirmLoading(false));
  };

  const formatSalary = (salary: string) => {
    if (!salary) return 'Thỏa thuận';
    const num = parseInt(salary.replace(/\D/g, ''));
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    return salary;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      {contextHolder}

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <Title level={4} style={{ color: cc.textPrimary, margin: 0, marginBottom: 4 }}>
          Bảng tin tuyển dụng
        </Title>
        <Text style={{ color: cc.textMuted }}>
          Tìm kiếm vị trí thực tập phù hợp với bạn
        </Text>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={{
          display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: cc.textMuted }} />}
          placeholder="Tìm theo tên, công ty, địa điểm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 280px', maxWidth: 400, borderRadius: cc.radiusMd }}
          allowClear
        />
        <Select
          placeholder="Công nghệ"
          value={filterTech}
          onChange={setFilterTech}
          allowClear
          style={{ width: 180 }}
          options={allTechnologies.map(t => ({ value: t, label: t }))}
        />
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ width: 150 }}
          options={[
            { value: 'OPEN', label: 'Đang tuyển' },
            { value: undefined, label: 'Tất cả' },
          ]}
        />
      </motion.div>

      {/* Stats Row */}
      <div style={{ marginBottom: 20 }}>
        <Text style={{ color: cc.textMuted, fontSize: 13 }}>
          Hiển thị <strong style={{ color: cc.textPrimary }}>{filtered.length}</strong> tin tuyển dụng
          {filterStatus === 'OPEN' && ' đang tuyển'}
        </Text>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty description="Không có tin tuyển dụng nào phù hợp" style={{ padding: 60 }} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((job: JobPost, i: number) => {
              const status = statusConfig[job.status] || statusConfig.DRAFT;
              const applied = hasApplied(job.id);
              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  whileHover={{ y: -3, boxShadow: cc.shadowMd }}
                  style={{
                    background: cc.surface,
                    borderRadius: cc.radiusLg,
                    border: `1px solid ${cc.borderSubtle}`,
                    boxShadow: cc.shadowSm,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'default',
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    padding: '16px 18px 12px',
                    borderBottom: `1px solid ${cc.borderSubtle}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      {/* Enterprise Logo Placeholder */}
                      <div style={{
                        width: 40, height: 40, borderRadius: cc.radiusMd,
                        background: `${cc.brand}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: cc.brand, fontSize: 18, fontWeight: 900, flexShrink: 0,
                      }}>
                        {job.enterprise?.name?.charAt(0) || 'E'}
                      </div>
                      <Tag
                        style={{
                          borderRadius: cc.radiusFull,
                          background: status.bg,
                          color: status.color,
                          border: 'none',
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {status.label}
                      </Tag>
                    </div>

                    <Title level={5} style={{ color: cc.textPrimary, margin: 0, marginBottom: 6, fontSize: 15 }}>
                      {job.title}
                    </Title>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BankOutlined style={{ fontSize: 12, color: cc.textMuted }} />
                      <Text style={{ fontSize: 12, color: cc.textSecondary }}>
                        {job.enterprise?.name || 'Doanh nghiệp'}
                      </Text>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '12px 18px', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {job.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <EnvironmentOutlined style={{ fontSize: 13, color: cc.textMuted }} />
                          <Text style={{ fontSize: 12.5, color: cc.textSecondary }}>{job.location}</Text>
                        </div>
                      )}
                      {job.salary && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <DollarOutlined style={{ fontSize: 13, color: cc.textMuted }} />
                          <Text style={{ fontSize: 12.5, color: cc.textSecondary, fontWeight: 600 }}>
                            {formatSalary(job.salary)} / tháng
                          </Text>
                        </div>
                      )}
                      {job.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ClockCircleOutlined style={{ fontSize: 13, color: cc.textMuted }} />
                          <Text style={{ fontSize: 12.5, color: cc.textSecondary }}>
                            Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Tech tags */}
                    {job.technology?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {job.technology.slice(0, 4).map((tech: string) => (
                          <span key={tech} style={{
                            padding: '2px 8px', borderRadius: cc.radiusFull,
                            background: `${cc.brand}10`,
                            color: cc.brand,
                            fontSize: 11, fontWeight: 600,
                          }}>
                            {tech}
                          </span>
                        ))}
                        {job.technology.length > 4 && (
                          <span style={{ padding: '2px 6px', fontSize: 11, color: cc.textMuted }}>
                            +{job.technology.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    padding: '12px 18px',
                    borderTop: `1px solid ${cc.borderSubtle}`,
                    display: 'flex',
                    gap: 8,
                  }}>
                    {applied ? (
                      <Button
                        disabled
                        style={{
                          flex: 1, borderRadius: cc.radiusMd, fontWeight: 600,
                          background: cc.successMuted, color: cc.success,
                          borderColor: `${cc.success}40`,
                        }}
                      >
                        Đã nộp
                      </Button>
                    ) : job.status !== 'OPEN' ? (
                      <Button
                        disabled
                        style={{ flex: 1, borderRadius: cc.radiusMd, fontWeight: 600 }}
                      >
                        Không tuyển
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => setApplyModal(job)}
                        style={{
                          flex: 1, borderRadius: cc.radiusMd, fontWeight: 600,
                          background: cc.brand, borderColor: cc.brand,
                          boxShadow: cc.shadowBrand,
                        }}
                      >
                        Ứng tuyển ngay
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Apply Confirm Modal */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary }}>
            Xác nhận nộp đơn
          </span>
        }
        open={!!applyModal}
        onCancel={() => !confirmLoading && setApplyModal(null)}
        footer={null}
        confirmLoading={confirmLoading}
        centered
        bodyStyle={{ padding: '20px 24px' }}
      >
        {applyModal && (
          <div>
            <div style={{
              padding: '14px 16px', borderRadius: cc.radiusMd,
              background: cc.brandMuted, border: `1px solid ${cc.brand}20`,
              marginBottom: 16,
            }}>
              <Text strong style={{ fontSize: 15, color: cc.textPrimary, display: 'block', marginBottom: 4 }}>
                {applyModal.title}
              </Text>
              <Text style={{ fontSize: 13, color: cc.textSecondary }}>
                {applyModal.enterprise?.name}
              </Text>
            </div>

            <div style={{ fontSize: 13, color: cc.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
              Bạn sẽ sử dụng <strong style={{ color: cc.textPrimary }}>CV đã upload</strong> trong hồ sơ để nộp đơn ứng tuyển vị trí này.
              {!myProfile?.cvPath && (
                <div style={{
                  marginTop: 8, padding: '10px 12px', borderRadius: cc.radiusMd,
                  background: cc.warningMuted, border: `1px solid ${cc.warning}30`,
                }}>
                  <Text style={{ color: cc.warning, fontSize: 13 }}>
                    ⚠️ Bạn chưa upload CV. Hãy upload CV trước khi nộp đơn!
                  </Text>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setApplyModal(null)}
                disabled={confirmLoading}
                style={{ borderRadius: cc.radiusMd }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                loading={confirmLoading}
                onClick={handleConfirmApply}
                disabled={!myProfile?.cvPath}
                style={{
                  background: cc.brand, borderColor: cc.brand, borderRadius: cc.radiusMd,
                  fontWeight: 600,
                }}
              >
                Xác nhận nộp đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(auto-fill"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
