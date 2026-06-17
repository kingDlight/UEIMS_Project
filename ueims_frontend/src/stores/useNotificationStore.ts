import { create } from 'zustand';
import { api } from '@/services/api';

export interface NotificationItem {
  notificationId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  referenceEntity?: string;
  referenceId?: string;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetched: boolean;
  fetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  applyIncoming: (n: NotificationItem) => void;
  applyUnreadCount: (count: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  fetched: false,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const [listRes, countRes] = await Promise.all([
        api.get<NotificationItem[]>('/notifications/my'),
        api.get<{ count: number }>('/notifications/my/unread-count'),
      ]);
      set({
        items: listRes.data ?? [],
        unreadCount: countRes.data?.count ?? 0,
        fetched: true,
      });
    } catch {
      // Silent — bell will keep the previous state.
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    const target = get().items.find((n) => n.notificationId === id);
    if (!target || target.isRead) return;
    // Optimistic update
    set({
      items: get().items.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      // Revert on failure
      set({
        items: get().items.map((n) => (n.notificationId === id ? { ...n, isRead: false } : n)),
        unreadCount: get().unreadCount + 1,
      });
    }
  },

  markAllAsRead: async () => {
    if (get().unreadCount === 0) return;
    const prevItems = get().items;
    const prevCount = get().unreadCount;
    // Optimistic: flip every unread -> read
    set({
      items: prevItems.map((n) => (n.isRead ? n : { ...n, isRead: true })),
      unreadCount: 0,
    });
    try {
      await api.put('/notifications/read-all');
    } catch {
      // Revert on failure
      set({ items: prevItems, unreadCount: prevCount });
    }
  },

  applyIncoming: (n) => {
    if (!n || !n.notificationId) return;
    const existing = get().items;
    if (existing.some((it) => it.notificationId === n.notificationId)) return;
    set({
      items: [n, ...existing].slice(0, 50),
      unreadCount: n.isRead ? get().unreadCount : get().unreadCount + 1,
    });
  },

  applyUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  reset: () => set({ items: [], unreadCount: 0, fetched: false }),
}));
