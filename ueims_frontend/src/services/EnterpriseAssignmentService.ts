import { api } from './api';

export const EnterpriseAssignmentService = {
    getAll: () => api.get('/enterprise-assignments'),
    getById: (id: string) => api.get(`/enterprise-assignments/${id}`),
    create: (data: any) => api.post('/enterprise-assignments', data),
    update: (id: string, data: any) => api.put(`/enterprise-assignments/${id}`, data),
    delete: (id: string) => api.delete(`/enterprise-assignments/${id}`)
};
