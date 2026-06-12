import { api } from './api';

const API_URL = '/interviews';

export const InterviewService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMySchedules: () => api.get(`${API_URL}/my-schedules`),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`),
    confirm: (id: string) => api.post(`${API_URL}/${id}/confirm`),
    decline: (id: string, reason: string) => api.post(`${API_URL}/${id}/decline`, null, { params: { reason } }),
};
