import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Spin, Tag, Empty, App } from 'antd';
import { BellOutlined, CalendarOutlined, BookOutlined, ReadOutlined } from '@ant-design/icons';
import { SystemAnnouncementService } from '@/services/SystemAnnouncementService';

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
  }, [message, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E67E22] to-[#D35400] flex items-center justify-center text-white shadow-[0_8px_22px_rgba(230,126,34,0.22)]">
          <BellOutlined className="text-xl" />
        </div>
        <div>
          <div className="text-[22px] font-extrabold text-slate-900 leading-[1.1]">
            {t('notices.title', 'Notices')}
          </div>
          <div className="text-[12.5px] text-slate-500 mt-1">
            {t('notices.subtitle', 'Latest system announcements from the Training Manager')}
          </div>
        </div>
        <div className="ml-auto">
          <Tag color="orange" className="rounded-full font-semibold px-3 py-1">
            {announcements.length} {t('notices.count', 'active')}
          </Tag>
        </div>
      </motion.div>

      {/* Body */}
      {announcements.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('notices.empty', 'No active notices at the moment.')}
          className="py-[60px] bg-white rounded-2xl border border-slate-200"
        />
      ) : (
        <div className="grid grid-cols-[340px_1fr] gap-5">
          {/* List */}
          <div className="flex flex-col gap-2.5">
            {announcements.map((a) => {
              const isActive = selected?.announcementId === a.announcementId;
              return (
                <motion.button
                  key={a.announcementId}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelected(a)}
                  className={`text-left rounded-xl p-3.5 cursor-pointer transition-all font-sans
                    ${isActive 
                      ? 'bg-[#E67E22]/10 border-[#E67E22] border-l-4 shadow-[0_8px_22px_rgba(230,126,34,0.22)] border-y border-r' 
                      : 'bg-white border border-slate-200 border-l-4 border-l-transparent shadow-sm'
                    }`}
                >
                  <div className="text-[13.5px] font-bold text-slate-900 line-clamp-2 overflow-hidden mb-1.5 leading-[1.35]">
                    {a.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <CalendarOutlined />
                    <span>{formatDate(a.publishedAt || a.createdAt)}</span>
                    {a.semester && (
                      <span className="px-1.5 py-[1px] rounded-full bg-blue-50 text-blue-500 font-semibold text-[10px]">
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
            className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm min-h-[360px]"
          >
            {selected && (
              <>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold mb-3.5">
                  <ReadOutlined /> {t('notices.published', 'PUBLISHED')}
                </div>
                <h1 className="text-[26px] font-extrabold text-slate-900 m-0 mb-3.5 leading-[1.25] tracking-tight">
                  {selected.title}
                </h1>
                <div className="flex items-center gap-3.5 text-slate-500 text-[12.5px] mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarOutlined /> {formatDate(selected.publishedAt || selected.createdAt)}
                  </span>
                  {selected.semester && (
                    <span className="inline-flex items-center gap-1.5">
                      <BookOutlined /> {selected.semester.semesterCode}
                    </span>
                  )}
                </div>
                <div className="text-[14.5px] text-slate-600 leading-relaxed whitespace-pre-wrap border-t border-slate-100 pt-5">
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
