import{ api} from './api';
import type { AtRiskStudent } from '@/pages/training-manager/types';

export const AtRiskStudentService = {
  getAtRiskStudents: async (
    semesterId: string,
    filters?: { riskCategory?: string; minPriority?: number }
  ): Promise<AtRiskStudent[]> => {
    const params: Record<string, string | number> = { semesterId };
    if (filters?.riskCategory && filters.riskCategory !== 'ALL') {
      params.riskCategory = filters.riskCategory;
    }
    if (filters?.minPriority != null) {
      params.minPriority = filters.minPriority;
    }
    const response = await api.get('/at-risk-students', { params });
    return response.data;
  },
  exportAtRiskStudents: async (semesterId: string): Promise<Blob> => {
    const response = await api.get('/at-risk-students/export', {
      params: { semesterId },
      responseType: 'blob',
    });
    return response.data;
  },
  sendAlertEmail: async (
    studentId: string,
    semesterId: string
  ): Promise<{ code: number; message: string }> => {
    const response = await api.post(
      `/at-risk-students/${studentId}/send-alert`,
      {},
      { params: { semesterId } }
    );
    return response.data;
  },
};
