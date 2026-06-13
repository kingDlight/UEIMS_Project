import { api } from './api';

export const DashboardService = {
  getCommandCenterSummary: async () => {
    const response = await api.get('/dashboard/command-center-summary');
    return response.data.result;
  },

  getEmploymentRateChart: async (semesterId: string) => {
    const response = await api.get(`/dashboard/employment-rate/${semesterId}`);
    return response.data;
  },
  getMajorDistributionChart: async (semesterId: string) => {
    const response = await api.get(`/dashboard/major-distribution/${semesterId}`);
    return response.data;
  },
  getGradeDistributionChart: async (semesterId: string) => {
    const response = await api.get(`/dashboard/grade-distribution/${semesterId}`);
    return response.data;
  },
  getInterviewPassRateChart: async (semesterId: string) => {
    const response = await api.get(`/dashboard/interview-pass-rate/${semesterId}`);
    return response.data;
  },
  getAverageRatingChart: async (semesterId: string) => {
    const response = await api.get(`/dashboard/average-rating/${semesterId}`);
    return response.data;
  },
};
