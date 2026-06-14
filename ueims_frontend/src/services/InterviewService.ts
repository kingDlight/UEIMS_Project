import { api } from './api';

const API_URL = '/interviews';

export const InterviewService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMySchedules: () => api.get(`${API_URL}/my-schedules`),
    getMyEnterprise: () => api.get(`${API_URL}/my-enterprise`),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`),
    confirm: (id: string) => api.post(`${API_URL}/${id}/confirm`),
    decline: (id: string, reason: string) => api.post(`${API_URL}/${id}/decline`, null, { params: { reason } }),
    // UC-43
    cancel: (id: string, reason: string) => api.post(`${API_URL}/${id}/cancel`, null, { params: { reason } }),
    reschedule: (id: string, newTime: string, reason?: string) =>
        api.post(`${API_URL}/${id}/reschedule`, null, { params: { newTime, reason } }),
    proposeSlots: (applicationId: string) =>
        api.get(`${API_URL}/propose-slots`, { params: { applicationId } }),
    // UC-44
    recordResult: (id: string, result: 'PASS' | 'FAIL', notes?: string) =>
        api.post(`${API_URL}/${id}/record-result`, null, { params: { result, notes } }),
};
