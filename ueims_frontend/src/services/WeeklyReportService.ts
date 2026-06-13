import { api } from './api';

export const WeeklyReportService = {
  getAllReports: async () => {
    const response = await api.get('/weekly-reports');
    return response.data.result;
  },
  
  getMyReports: async () => {
    const response = await api.get('/weekly-reports/my-reports');
    return response.data.result;
  },

  getReportById: async (id: string) => {
    const response = await api.get(`/weekly-reports/${id}`);
    return response.data.result;
  },

  createReport: async (reportData: any) => {
    const response = await api.post('/weekly-reports', reportData);
    return response.data.result;
  },

  updateReport: async (id: string, reportData: any) => {
    const response = await api.put(`/weekly-reports/${id}`, reportData);
    return response.data.result;
  },

  approveReport: async (id: string) => {
    const response = await api.put(`/weekly-reports/${id}/approve`);
    return response.data.result;
  },

  rejectReport: async (id: string, feedback: string) => {
    const response = await api.put(`/weekly-reports/${id}/reject`, { feedback });
    return response.data.result;
  }
};
