import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { cc } from '../constants';
import { StudentDashboardService } from '@/services/StudentDashboardService';

export const HistoryTab: React.FC = () => {
  const { t } = useTranslation(['studentDashboard']);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const stats = await StudentDashboardService.getStats();
        setActivities(stats.recentActivities || []);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '0 0 40px 0' }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: cc.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <HistoryOutlined style={{ color: cc.primary }} /> {t('historyTabTitle', 'Activity History')}
        </h1>
        <p style={{ color: cc.textMuted, marginTop: 8, fontSize: 14 }}>{t('historyTabDesc', 'View all your recent interactions and updates')}</p>
      </div>

      <div style={{ background: cc.surface, padding: 24, borderRadius: cc.radiusLg, boxShadow: cc.shadowSm, border: `1px solid ${cc.borderSubtle}` }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.map((item, i) => {
              let tone = cc.info;
              if (item.type === 'interview') tone = cc.warning;
              if (item.type === 'report') tone = cc.success;

              const d = new Date(item.date);
              const meta = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', borderRadius: cc.radiusMd, background: cc.borderSubtle }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: tone, boxShadow: `0 0 0 4px ${tone}20`, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: cc.textMuted, marginTop: 4 }}>{meta}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: cc.textMuted }}>
            {t('noActivityFound', 'No activity history found.')}
          </div>
        )}
      </div>
    </motion.div>
  );
};
