import axios from 'axios';

const API_URL = `${process.env.VITE_API_URL || 'http://localhost:8080/api'}/invalidated-tokens`;

export const InvalidatedTokenService = {
    getAll: () => axios.get(API_URL),
    getById: (id: string) => axios.get(`${API_URL}/${id}`),
    create: (data: any) => axios.post(API_URL, data),
    update: (id: string, data: any) => axios.put(`${API_URL}/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/${id}`)
};
