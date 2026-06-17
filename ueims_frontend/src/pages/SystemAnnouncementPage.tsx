import React, { useEffect } from 'react';
import { useAnnouncementStore } from '@/stores/useAnnouncementStore';
import { useAnnouncementStream } from '@/hooks/useAnnouncementStream';

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '');

const SystemAnnouncementPage: React.FC = () => {
  const items = useAnnouncementStore((s) => s.items);
  const fetchAnnouncements = useAnnouncementStore((s) => s.fetch);

  useAnnouncementStream();

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">System Announcements</h1>
      {items.length === 0 ? (
        <div className="text-slate-500">No announcements yet.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li
              key={a.announcementId}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-slate-900">{a.title}</div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    a.status === 'PUBLISHED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : a.status === 'ARCHIVED'
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{a.content}</div>
              <div className="text-[11px] text-slate-400 mt-2 flex gap-3">
                <span>By {a.createdBy?.fullName ?? '—'}</span>
                <span>Created {formatDate(a.createdAt)}</span>
                {a.publishedAt && <span>Published {formatDate(a.publishedAt)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SystemAnnouncementPage;
