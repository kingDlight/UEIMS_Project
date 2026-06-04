import { api } from './api';

export interface SemesterResponse {
  semesterId: string;
  semesterCode: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  weeklyReportDeadlineDay: string;
  weeklyReportDeadlineTime: string;
}

export const SemesterService = {
  async getAllSemesters(): Promise<SemesterResponse[]> {
    const response = await api.get<SemesterResponse[]>('/semesters');
    return response.data || [];
  },

  async getAll(): Promise<SemesterResponse[]> {
    return this.getAllSemesters();
  },

  async getActiveSemester(): Promise<SemesterResponse | undefined> {
    const semesters = await this.getAllSemesters();
    return semesters.find((s) => s.status === 'ACTIVE');
  },

  async createSemester(data: any): Promise<SemesterResponse> {
    const response = await api.post<SemesterResponse>('/semesters', data);
    return response.data;
  },

  async openSemester(id: string): Promise<SemesterResponse> {
    const response = await api.put<SemesterResponse>(`/semesters/${id}/open`);
    return response.data;
  },

  async activateSemester(id: string): Promise<SemesterResponse> {
    const response = await api.put<SemesterResponse>(`/semesters/${id}/active`);
    return response.data;
  },

  async closeSemester(id: string): Promise<SemesterResponse> {
    const response = await api.put<SemesterResponse>(`/semesters/${id}/close`);
    return response.data;
  },

  async lockSemester(id: string): Promise<SemesterResponse> {
    const response = await api.put<SemesterResponse>(`/semesters/${id}/lock`);
    return response.data;
  },
};
