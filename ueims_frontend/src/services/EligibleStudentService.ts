import { api } from './api';
import type { EligibleStudent } from '@/pages/training-manager/types';

export const EligibleStudentService = {
  async getAllEligibleStudents(): Promise<EligibleStudent[]> {
    const response = await api.get<EligibleStudent[]>('/eligible-students');
    return response.data || [];
  },

  async getAll(): Promise<EligibleStudent[]> {
    return this.getAllEligibleStudents();
  },

  async importFromExcel(file: File, semesterId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semesterId', semesterId);

    const response = await api.post('/eligible-students/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async exportToExcel(semesterId: string): Promise<Blob> {
    const response = await api.get('/eligible-students/export-ojt', {
      params: { semesterId },
      responseType: 'blob',
    });
    return response.data;
  },

  async finalizeOjtList(studentIds: string[]): Promise<any> {
    const response = await api.post('/eligible-students/finalize-ojt', studentIds);
    return response.data;
  },

  async updateEligibleStudent(
    id: string,
    payload: {
      studentCode: string;
      fullName: string;
      email?: string;
      major: string;
      gpa: number;
      currentSemester: number;
      status?: string;
      cancelledReason?: string;
    }
  ): Promise<EligibleStudent> {
    const response = await api.put<EligibleStudent>(`/eligible-students/${id}`, payload);
    return response.data;
  },

  async cancelOjtResult(id: string, reason: string): Promise<EligibleStudent> {
    const response = await api.put(`/eligible-students/${id}/cancel`, { reason });
    return response.data;
  }
};
