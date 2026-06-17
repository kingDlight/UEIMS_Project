import { create } from 'zustand';
import type { SystemAnnouncement } from '@/pages/training-manager/types';
import { SystemAnnouncementService } from '@/services/SystemAnnouncementService';

interface AnnouncementState {
  items: SystemAnnouncement[];
  latest: SystemAnnouncement | null;
  fetched: boolean;
  fetch: () => Promise<void>;
  applyEvent: (eventType: string, payload: Partial<SystemAnnouncement> & { announcementId: string }) => void;
  reset: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  items: [],
  latest: null,
  fetched: false,

  fetch: async () => {
    try {
      const list = await SystemAnnouncementService.getAll();
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
      set({ items: sorted, fetched: true });
    } catch {
      set({ fetched: true });
    }
  },

  applyEvent: (eventType, payload) => {
    const items = get().items;
    const id = payload.announcementId;
    let next: SystemAnnouncement[];
    if (eventType === 'DELETED') {
      next = items.filter((a) => a.announcementId !== id);
    } else if (eventType === 'CREATED' || eventType === 'UPDATED' || eventType === 'PUBLISHED' || eventType === 'ARCHIVED') {
      const full = payload as SystemAnnouncement;
      const idx = items.findIndex((a) => a.announcementId === id);
      if (idx >= 0) {
        next = [...items];
        next[idx] = { ...next[idx], ...full };
      } else {
        next = [full, ...items];
      }
    } else {
      next = items;
    }
    next.sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
    set({ items: next, latest: next[0] ?? null });
  },

  reset: () => set({ items: [], latest: null, fetched: false }),
}));
