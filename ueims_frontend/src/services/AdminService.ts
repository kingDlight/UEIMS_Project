import { api } from './api';

export interface UserDetail {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  status: string;
  avatarUrl?: string;
  authProvider?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  roles: string[];
}

export interface UserCreatePayload {
  email: string;
  fullName: string;
  phone?: string;
  password?: string;
}

export interface UserUpdatePayload {
  fullName?: string;
  phone?: string;
  password?: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export const AdminService = {
  // ---- Users ----
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data?.result ?? res.data ?? [];
  },

  getUserById: async (userId: string) => {
    const res = await api.get(`/users/${userId}`);
    return res.data?.result ?? res.data;
  },

  createUser: async (payload: UserCreatePayload) => {
    const res = await api.post('/users', payload);
    return res.data?.result ?? res.data;
  },

  updateUser: async (userId: string, payload: UserUpdatePayload) => {
    const res = await api.put(`/users/${userId}`, payload);
    return res.data?.result ?? res.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const res = await api.patch(`/users/${userId}/status`, null, { params: { status } });
    return res.data;
  },

  // ---- Roles ----
  getAllRoles: async () => {
    const res = await api.get('/roles');
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

  // ---- Audit Logs ----
  getAuditLogs: async (params?: { startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await api.get('/audit-logs', { params });
    return res.data?.result ?? res.data ?? [];
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
