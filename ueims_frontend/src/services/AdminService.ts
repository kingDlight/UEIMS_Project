import { api } from './api';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface UserEntry {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  status: string;
  roles: string[];
  createdAt: string;
}

export const AdminService = {
  // ---- Users & Roles ----
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data?.result ?? res.data ?? [];
  },

  getUserRoles: async () => {
    const res = await api.get('/users-roles');
    return res.data?.result ?? res.data ?? [];
  },

  assignRole: async (userId: string, roleName: string) => {
    const res = await api.post('/users-roles/assign', { userId, roleName });
    return res.data;
  },

  revokeRole: async (userId: string, roleName: string) => {
    const res = await api.delete(`/users-roles/revoke/${userId}/${roleName}`);
    return res.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const res = await api.patch(`/users/${userId}/status`, null, { params: { status } });
    return res.data;
  },

  // ---- Audit Logs ----
  getAuditLogs: async (params?: { startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await api.get('/audit-logs', { params });
    return res.data?.result ?? res.data ?? res.data ?? [];
  },

  exportAuditLogs: async (startDate?: string, endDate?: string) => {
    const res = await api.get('/audit-logs/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return res.data;
  },

  // ---- Dashboard Stats ----
  getAdminStats: async () => {
    const res = await api.get('/dashboard/command-center-summary');
    return res.data?.result;
  },
};
