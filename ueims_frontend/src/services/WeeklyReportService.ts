import { api } from './api';

const API_URL = '/weekly-reports';

export const WeeklyReportService = {
  getAll: () => api.get(API_URL),
  getAllReports: async () => {
    const response = await api.get('/weekly-reports');
    return response.data.result;
  },
  getById: (id: string) => api.get(`${API_URL}/${id}`),
  getMyReports: async () => {
    const response = await api.get('/weekly-reports/my-reports');
    return response.data.result;
  },
  getReportById: async (id: string) => {
    const response = await api.get(`/weekly-reports/${id}`);
    return response.data.result;
  },
  create: (data: any) => api.post(API_URL, data),
  createReport: async (reportData: any) => {
    const response = await api.post('/weekly-reports', reportData);
    return response.data.result;
  },
  update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
  updateReport: async (id: string, reportData: any) => {
    const response = await api.put(`/weekly-reports/${id}`, reportData);
    return response.data.result;
  },
  delete: (id: string) => api.delete(`${API_URL}/${id}`),
  approveReport: async (id: string) => {
    const response = await api.put(`/weekly-reports/${id}/approve`);
    return response.data.result;
  },
  rejectReport: async (id: string, feedback: string) => {
    const response = await api.put(`/weekly-reports/${id}/reject`, { feedback });
    return response.data.result;
  }
};;

