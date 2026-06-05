import { api } from './api';

export const DashboardService = {
  getAllStatistics: async () => {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  },

  getStatisticsBySemester: async (semesterId: string) => {
    const response = await api.get(`/dashboard/statistics/${semesterId}`);
    return response.data;
  },
};
