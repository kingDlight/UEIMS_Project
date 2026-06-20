import api from './api';
import type { AtRiskStudent } from '@/pages/training-manager/types';

export const AtRiskStudentService = {
  getAtRiskStudents: async (semesterId: string): Promise<AtRiskStudent[]> => {
    const response = await api.get('/at-risk-students', {
      params: { semesterId },
    });
    return response.data;
  },
  exportAtRiskStudents: async (semesterId: string): Promise<Blob> => {
    const response = await api.get('/at-risk-students/export', {
      params: { semesterId },
      responseType: 'blob',
    });
    return response.data;
  },
};
