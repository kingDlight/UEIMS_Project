import { api } from './api';

const API_URL = '/applications';

export const ApplicationService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMyApplications: () => api.get(`${API_URL}/my-history`),
    getMyEnterprise: () => api.get(`${API_URL}/my-enterprise`),
    withdraw: (id: string) => api.patch(`${API_URL}/${id}/withdraw`),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    updateStatus: (id: string, data: any) => api.put(`${API_URL}/${id}/status`, data),
    screen: (id: string, data: { status: string; rejectionReason?: string }) =>
        api.put(`${API_URL}/${id}/screen`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`),

    /**
     * UC-40: Download the applicant's CV as a PDF blob and trigger a browser save dialog.
     * Returns the suggested filename so callers can label the file.
     */
    downloadCV: async (id: string, studentName?: string): Promise<string> => {
        const response = await api.get(`${API_URL}/${id}/cv`, {
            responseType: 'blob',
        });
        const safeName = (studentName ?? 'applicant').replace(/[^a-z0-9_-]+/gi, '_');
        const filename = `CV_${safeName}.pdf`;
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        window.open(url, '_blank'); // Explicitly open in a new tab (TC-ENT-020 requirement)
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Delay revoke to allow new tab to read the blob
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        return filename;
    },
};
