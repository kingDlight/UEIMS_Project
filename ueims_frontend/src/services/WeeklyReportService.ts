import { api } from './api';

const API_URL = '/weekly-reports';

export interface WeeklyReportStatusWeek {
  weekNumber: number;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'MISSED';
  deadline: string;          // YYYY-MM-DD
  isOverdue: boolean;
  isPast: boolean;
  daysLate: number | null;
  reportId: string | null;
}

export interface WeeklyReportStatusSummary {
  semesterCode: string | null;
  totalWeeks: number;
  currentWeek: number;
  submittedCount: number;
  approvedCount: number;
  overdueCount: number;
  pendingThisWeek: number;
  weeks: WeeklyReportStatusWeek[];
}

export const WeeklyReportService = {
  getAll: () => api.get(API_URL),
  getAllReports: async () => {
    const response = await api.get('/weekly-reports');
    return response.data.result || response.data;
  },
  getById: (id: string) => api.get(`${API_URL}/${id}`),
  getMyReports: async () => {
    const response = await api.get('/weekly-reports/my-reports');
    return response.data.result || response.data;
  },
  /**
   * Lấy tổng hợp trạng thái weekly report của SV hiện tại để cảnh báo trên dashboard.
   */
  getMyStatusSummary: async (): Promise<WeeklyReportStatusSummary> => {
    const response = await api.get('/weekly-reports/my-status-summary');
    return response.data.result || response.data;
  },
  getReportById: async (id: string) => {
    const response = await api.get(`/weekly-reports/${id}`);
    return response.data.result || response.data;
  },
  getByEnterprise: async () => {
    const response = await api.get('/weekly-reports/by-enterprise');
    return response.data.result || response.data;
  },
  create: (data: any) => api.post(API_URL, data),
  createReport: async (reportData: any) => {
    const response = await api.post('/weekly-reports', reportData);
    return response.data.result || response.data;
  },
  update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
  updateReport: async (id: string, reportData: any) => {
    const response = await api.put(`/weekly-reports/${id}`, reportData);
    return response.data.result || response.data;
  },
  delete: (id: string) => api.delete(`${API_URL}/${id}`),
  approveReport: async (id: string, feedback?: string) => {
    const response = await api.put(`/weekly-reports/${id}/approve`, feedback ? { feedback } : undefined);
    return response.data.result || response.data;
  },
  rejectReport: async (id: string, feedback: string) => {
    const response = await api.put(`/weekly-reports/${id}/reject`, { feedback });
    return response.data.result || response.data;
  },
  /**
   * FIX 006-C: TM override for late submission (BR-56).
   * Marks the report as accepted despite being past the deadline.
   */
  overrideLateSubmission: async (id: string, reason: string) => {
    const response = await api.post(`/weekly-reports/${id}/override-late`, { reason });
    return response.data.result || response.data;
  },
};

