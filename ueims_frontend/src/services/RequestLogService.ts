import { api } from './api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface RequestLogEntry {
  id: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  method: HttpMethod;
  endpoint: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  responseTimeMs?: number;
  timestamp: string;
}

export interface RequestLogParams {
  userId?: string;
  method?: HttpMethod;
  endpoint?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const RequestLogService = {
  getLogs: async (params?: RequestLogParams) => {
    const res = await api.get('/request-logs', { params });
    return res.data?.result ?? res.data;
  },

  getLogsByUser: async (userId: string, page = 0, size = 20) => {
    const res = await api.get(`/request-logs/user/${userId}`, { params: { page, size } });
    return res.data?.result ?? res.data;
  },

  getRecentLogs: async (page = 0, size = 20) => {
    const res = await api.get('/request-logs/recent', { params: { page, size } });
    return res.data?.result ?? res.data;
  },

  exportCsv: async (params?: RequestLogParams) => {
    const res = await api.get('/request-logs/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  clearAll: async () => {
    const res = await api.delete('/request-logs');
    return res.data?.result ?? 0;
  },
};
