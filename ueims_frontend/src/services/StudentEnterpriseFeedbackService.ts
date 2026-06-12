import { api } from './api';

const API_URL = '/student-enterprise-feedbacks';

export const StudentEnterpriseFeedbackService = {
    getAll: () => api.get(API_URL),
    getMyFeedbacks: () => api.get(`${API_URL}/my-feedbacks`),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    create: (data: any) => api.post(API_URL, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
