import { api } from './api';

const API_URL = '/enterprise-assignments';

export const EnterpriseAssignmentService = {
    getAll: () => api.get(API_URL),
    getMyAssignment: () => api.get(`${API_URL}/my-assignment`),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
