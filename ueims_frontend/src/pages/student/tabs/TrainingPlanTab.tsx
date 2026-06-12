import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { BookOutlined, BankOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { InternshipPlanService } from '@/services/InternshipPlanService';
import { cc, hexToRgba } from '../constants';

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <NeuSurface style={{ padding: 56, textAlign: 'center' }}>
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: cc.primary }}>{icon}</div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.textPrimary, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{description}</p>
  </NeuSurface>
);

export const TrainingPlanTab: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlan(); }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await InternshipPlanService.getMyPlan();
      const data = res.data?.result ?? res.data;
      setPlan(data || null);
    } catch (err) {
      console.error('Failed to fetch training plan', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Training Plan</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Your internship training roadmap from Enterprise</p>
      </div>

      {!plan ? (
        <EmptyState icon={<BookOutlined style={{ fontSize: 32 }} />} title="No training plan yet" description="Your training plan will appear once assigned by your enterprise" />
      ) : (
        <NeuSurface style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary, margin: '0 0 8px' }}>{plan.title || 'OJT Training Plan'}</h3>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}><BankOutlined /> {plan.enterpriseName} • Started: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(plan.tasks || []).map((task: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: 16, borderRadius: cc.radiusLg, background: cc.neutralBg, border: `1px solid ${cc.borderSubtle}` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 4px' }}>{task.title}</h4>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: 0, lineHeight: 1.5 }}>{task.description}</p>
                </div>
                <SmallBadge label={task.status || 'PENDING'} variant={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'warning'} />
              </div>
            ))}
          </div>
        </NeuSurface>
      )}
    </div>
  );
};
