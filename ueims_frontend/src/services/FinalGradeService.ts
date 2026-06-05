import { api } from './api';

export const FinalGradeService = {
  getAll: async () => {
    const response = await api.get('/final-grades');
    return response.data.result;
  },

  getById: async (id: string) => {
    const response = await api.get(`/final-grades/${id}`);
    return response.data.result;
  },

  create: async (data: any) => {
    const response = await api.post('/final-grades', data);
    return response.data.result;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/final-grades/${id}`);
    return response.data.result;
  },
};
