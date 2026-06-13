import { api } from './api';

const API_URL = '/final-reports';

export const FinalReportService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMyReport: () => api.get(`${API_URL}/my-report`),
    create: (data: any) => api.post(API_URL, data),
    upload: (assignmentId: string, file: File) => {
        const form = new FormData();
        form.append('assignmentId', assignmentId);
        form.append('file', file);
        return api.post(`${API_URL}/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
