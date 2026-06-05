import { api } from './api';
import type { SystemAnnouncement } from '../pages/training-manager/types';

export const SystemAnnouncementService = {
  getAll: async (): Promise<SystemAnnouncement[]> => {
    const response = await api.get('/system-announcements');
    return response.data;
  },

  getActive: async (): Promise<SystemAnnouncement[]> => {
    const response = await api.get('/system-announcements/active');
    return response.data;
  },

  getById: async (id: string): Promise<SystemAnnouncement> => {
    const response = await api.get(`/system-announcements/${id}`);
    return response.data;
  },

  create: async (data: { title: string; content: string; semesterId?: string }): Promise<SystemAnnouncement> => {
    const response = await api.post('/system-announcements', data);
    return response.data;
  },

  update: async (id: string, data: { title: string; content: string; semesterId?: string }): Promise<SystemAnnouncement> => {
    const response = await api.put(`/system-announcements/${id}`, data);
    return response.data;
  },

  publish: async (id: string): Promise<SystemAnnouncement> => {
    const response = await api.put(`/system-announcements/${id}/publish`);
    return response.data;
  },

  archive: async (id: string): Promise<SystemAnnouncement> => {
    const response = await api.put(`/system-announcements/${id}/archive`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/system-announcements/${id}`);
  }
};
