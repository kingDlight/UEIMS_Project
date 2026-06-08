import { api } from './api';

const API_URL = '/student-profiles';

export const StudentProfileService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMyProfile: () => api.get('/users/myInfo'),
    uploadCV: (formData: FormData) => api.post(`${API_URL}/upload-cv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
