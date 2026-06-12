import { api } from './api';

const API_URL = '/applications';

export const ApplicationService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMyApplications: () => api.get(`${API_URL}/my-history`),
    withdraw: (id: string) => api.patch(`${API_URL}/${id}/withdraw`),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
