import { api } from './api';

export interface ApiNotification {
  notificationId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  referenceEntity?: string;
  referenceId?: string;
}

export const NotificationService = {
    getAll: () => api.get<ApiNotification[]>('/notifications'),
    getMy: () => api.get<ApiNotification[]>('/notifications/my'),
    getUnreadCount: () => api.get<{ count: number }>('/notifications/my/unread-count'),
    getById: (id: string) => api.get<ApiNotification>(`/notifications/${id}`),
    create: (data: any) => api.post('/notifications', data),
    markAsRead: (id: string) => api.put<ApiNotification>(`/notifications/${id}/read`),
    update: (id: string, data: any) => api.put(`/notifications/${id}`, data),
    delete: (id: string) => api.delete(`/notifications/${id}`),
    broadcast: (data: {
      recipientIds?: string[];
      targetRole?: string;
      title: string;
      message: string;
      type?: string;
      referenceEntity?: string;
      referenceId?: string;
    }) => api.post<{ sent: number; title: string }>('/notifications/broadcast', data),
};
