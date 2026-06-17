import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Spin, Tag, Empty, App } from 'antd';
import { BellOutlined, CalendarOutlined, BookOutlined, ReadOutlined } from '@ant-design/icons';
import { SystemAnnouncementService } from '@/services/SystemAnnouncementService';
import { c } from '../constants';

type Announcement = {
  announcementId: string;
  title: string;
  content: string;
  status: string;
  publishedAt?: string;
  createdAt?: string;
  semester?: { semesterId: string; semesterCode: string };
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

const NoticesTab: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res: any = await SystemAnnouncementService.getActive();
        const list: Announcement[] = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
        const sorted = [...list].sort((a, b) => {
          const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const db = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return db - da;
        });
        setAnnouncements(sorted);
        if (sorted.length > 0) setSelected(sorted[0]);
      } catch (err) {
        message.error(t('notices.loadError', 'Unable to load notices. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: c.radiusMd,
          background: `linear-gradient(135deg, ${c.brand}, ${c.brandHover})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: c.shadowBrand
        }}>
          <BellOutlined style={{ fontSize: 20 }} />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: c.text, lineHeight: 1.1 }}>
            {t('notices.title', 'Notices')}
          </div>
          <div style={{ fontSize: 12.5, color: c.textMuted, marginTop: 4 }}>
            {t('notices.subtitle', 'Latest system announcements from the Training Manager')}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Tag color="orange" style={{ borderRadius: c.radiusFull, fontWeight: 600, padding: '4px 12px' }}>
            {announcements.length} {t('notices.count', 'active')}
          </Tag>
        </div>
      </motion.div>

      {/* Body */}
      {announcements.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('notices.empty', 'No active notices at the moment.')}
          style={{ padding: '60px 0', background: '#fff', borderRadius: c.radiusLg, border: `1px solid ${c.border}` }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {announcements.map((a) => {
              const isActive = selected?.announcementId === a.announcementId;
              return (
                <motion.button
                  key={a.announcementId}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelected(a)}
                  style={{
                    textAlign: 'left',
                    background: isActive ? c.brandMuted : '#fff',
                    border: `1px solid ${isActive ? c.brand : c.border}`,
                    borderLeft: isActive ? `4px solid ${c.brand}` : `4px solid transparent`,
                    borderRadius: c.radiusMd,
                    padding: '14px 14px',
                    cursor: 'pointer',
                    boxShadow: isActive ? c.shadowBrand : c.shadowSm,
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    fontSize: 13.5, fontWeight: 700, color: c.text,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', marginBottom: 6, lineHeight: 1.35
                  }}>
                    {a.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: c.textMuted }}>
                    <CalendarOutlined />
                    <span>{formatDate(a.publishedAt || a.createdAt)}</span>
                    {a.semester && (
                      <span style={{
                        padding: '1px 6px', borderRadius: c.radiusFull,
                        background: c.infoMuted, color: c.info, fontWeight: 600, fontSize: 10
                      }}>
                        {a.semester.semesterCode}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Detail */}
          <motion.div
            key={selected?.announcementId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: '#fff', borderRadius: c.radiusLg, border: `1px solid ${c.border}`,
              padding: 28, boxShadow: c.shadowSm, minHeight: 360
            }}
          >
            {selected && (
              <>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: c.radiusFull,
                  background: c.successMuted, color: c.success,
                  fontSize: 11, fontWeight: 700, marginBottom: 14
                }}>
                  <ReadOutlined /> {t('notices.published', 'PUBLISHED')}
                </div>
                <h1 style={{
                  fontSize: 26, fontWeight: 800, color: c.text, margin: '0 0 14px',
                  lineHeight: 1.25, letterSpacing: '-0.01em'
                }}>
                  {selected.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: c.textMuted, fontSize: 12.5, marginBottom: 20 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined /> {formatDate(selected.publishedAt || selected.createdAt)}
                  </span>
                  {selected.semester && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <BookOutlined /> {selected.semester.semesterCode}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 14.5, color: c.textSecondary, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', borderTop: `1px solid ${c.borderSubtle}`, paddingTop: 20
                }}>
                  {selected.content}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NoticesTab;
