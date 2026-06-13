import { api } from './api';

export const ReportFeedbackService = {
    getAll: () => api.get('/report-feedbacks'),
    getMyFeedbacks: () => api.get('/report-feedbacks/my-feedbacks'),
    getById: (id: string) => api.get(`/report-feedbacks/${id}`),
    create: (data: unknown) => api.post('/report-feedbacks', data),
    delete: (id: string) => api.delete(`/report-feedbacks/${id}`)
};
