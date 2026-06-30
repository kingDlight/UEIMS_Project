import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import { BookOutlined, BankOutlined, CheckCircleOutlined, ClockCircleOutlined, DownCircleOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { InternshipPlanService } from '@/services/InternshipPlanService';
import { cc } from '../constants';

interface TaskItem {
  planItemId: string;
  weekNumber: number;
  taskDescription: string;
  targetDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  orderIndex: number;
}

interface InternshipPlanResponse {
  planId: string;
  overallGoal: string | null;
  assignmentId: string;
  enterpriseName: string | null;
  startDate: string | null;
  tasks: TaskItem[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  COMPLETED: {
    label: 'Hoàn thành',
    color: '#16a34a',
    bg: '#dcfce7',
    icon: <CheckCircleOutlined />,
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    color: '#2563eb',
    bg: '#dbeafe',
    icon: <ClockCircleOutlined />,
  },
  PENDING: {
    label: 'Chưa bắt đầu',
    color: '#d97706',
    bg: '#fef3c7',
    icon: <DownCircleOutlined />,
  },
};

const EmptyState: React.FC<{ hasError: boolean }> = ({ hasError }) => (
  <NeuSurface style={{ padding: 56, textAlign: 'center' }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: hasError ? '#fee2e2' : cc.primaryMuted,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
      color: hasError ? '#dc2626' : cc.primary,
    }}>
      <BookOutlined style={{ fontSize: 32 }} />
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.textPrimary, margin: '0 0 6px' }}>
      {hasError ? 'Không thể tải kế hoạch' : 'Chưa có kế hoạch đào tạo'}
    </h3>
    <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>
      {hasError
        ? 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.'
        : 'Kế hoạch đào tạo sẽ được hiển thị khi doanh nghiệp của bạn tạo và gửi cho bạn.'}
    </p>
  </NeuSurface>
);

export const TrainingPlanTab: React.FC = () => {
  const { t } = useTranslation(['trainingPlan', 'common']);
  const [plan, setPlan] = useState<InternshipPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => { fetchPlan(); }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setHasError(false);
      const res = await InternshipPlanService.getMyPlan();
      const raw = res.data?.result ?? res.data;
      setPlan(raw || null);
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {t('pageTitle', 'Kế hoạch Đào tạo')}
          </h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>
            Lộ trình thực tập từ doanh nghiệp của bạn
          </p>
        </div>
        <EmptyState hasError={hasError} />
      </div>
    );
  }

  const completedCount = plan.tasks.filter(t => t.status === 'COMPLETED').length;
  const totalCount = plan.tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const weekGroups: Record<number, TaskItem[]> = {};
  const sortedTasks = [...plan.tasks].sort((a, b) => a.orderIndex - b.orderIndex);
  for (const task of sortedTasks) {
    if (!weekGroups[task.weekNumber]) weekGroups[task.weekNumber] = [];
    weekGroups[task.weekNumber].push(task);
  }
  const sortedWeeks = Object.keys(weekGroups).map(Number).sort((a, b) => a - b);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          {t('pageTitle', 'Kế hoạch Đào tạo')}
        </h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>
          Lộ trình thực tập từ doanh nghiệp của bạn
        </p>
      </div>

      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>
              {plan.overallGoal || 'Kế hoạch Thực tập OJT'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {plan.enterpriseName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: cc.textSecondary }}>
                  <BankOutlined style={{ color: cc.primary }} /> {plan.enterpriseName}
                </span>
              )}
              {plan.startDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: cc.textSecondary }}>
                  <span style={{ color: cc.textMuted }}>Bắt đầu:</span>
                  {new Date(plan.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: cc.textPrimary, lineHeight: 1 }}>
              {completedCount}/{totalCount}
            </div>
            <div style={{ fontSize: 12, color: cc.textMuted, marginTop: 2 }}>nhiệm vụ hoàn thành</div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: cc.textSecondary }}>Tiến độ tổng thể</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: cc.primary }}>{progressPct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: cc.borderSubtle, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressPct === 100
                ? `linear-gradient(90deg, ${cc.success}, ${cc.primary})`
                : `linear-gradient(90deg, ${cc.primary}, #f97316)`,
              borderRadius: 4,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </NeuSurface>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sortedWeeks.map(weekNum => (
          <NeuSurface key={weekNum} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${cc.primary}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cc.primary, fontSize: 13, fontWeight: 700,
              }}>
                W{weekNum}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: cc.textPrimary }}>
                  Tuần {weekNum}
                </div>
                <div style={{ fontSize: 11, color: cc.textMuted }}>
                  {weekGroups[weekNum].length} nhiệm vụ
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weekGroups[weekNum].map((task, idx) => {
                const sc = statusConfig[task.status] || statusConfig.PENDING;
                return (
                  <div
                    key={task.planItemId || idx}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: cc.radiusMd,
                      background: cc.neutralBg,
                      border: `1px solid ${cc.borderSubtle}`,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: sc.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: sc.color, flexShrink: 0,
                    }}>
                      {sc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary }}>
                          Nhiệm vụ {idx + 1}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          padding: '2px 8px', borderRadius: 20,
                          background: sc.bg, color: sc.color,
                        }}>
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: cc.textSecondary, margin: 0, lineHeight: 1.5 }}>
                        {task.taskDescription}
                      </p>
                      {task.targetDate && (
                        <div style={{ fontSize: 11, color: cc.textMuted, marginTop: 4 }}>
                          Hạn chót: {new Date(task.targetDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </NeuSurface>
        ))}
      </div>
    </div>
  );
};
