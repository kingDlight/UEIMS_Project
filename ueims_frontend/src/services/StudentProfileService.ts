import { api } from './api';

const API_URL = '/student-profiles';

export const StudentProfileService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMyProfile: () => api.get(`${API_URL}/my-profile`),
    uploadCV: (formData: FormData) => api.post(`${API_URL}/upload-cv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteCV: () => api.delete(`${API_URL}/upload-cv`),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    create: (data: any) => api.post(API_URL, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
