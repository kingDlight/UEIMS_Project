import { api } from './api';
import type { Enterprise } from '@/pages/training-manager/types';

interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

export const EnterpriseService = {
  async getAllEnterprises(): Promise<Enterprise[]> {
    const response = await api.get<ApiResponse<Enterprise[]>>('/enterprises');
    return response.data.result;
  },

  async getAll(): Promise<Enterprise[]> {
    return this.getAllEnterprises();
  },

  async updateEnterpriseStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ): Promise<Enterprise> {
    const response = await api.put<ApiResponse<Enterprise>>(`/enterprises/${id}/status`, null, {
      params: {
        status,
        ...(reason ? { reason } : {}),
      },
    });

    return response.data.result;
  },
};
