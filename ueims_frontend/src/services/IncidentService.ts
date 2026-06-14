import { api } from './api';

export const IncidentService = {
    getAll: async () => {
        const response = await api.get('/incidents');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/incidents/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/incidents', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/incidents/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/incidents/${id}`);
    },
    resolve: async (id: string, data: { resolutionNote: string }) => {
        const response = await api.put(`/incidents/${id}/resolve`, data);
        return response.data;
    },
    report: async (data: { assignmentId: string; category: string; description: string; evidenceUrls?: string }) => {
        const response = await api.post('/incidents/report', data);
        return response.data;
    }
};
