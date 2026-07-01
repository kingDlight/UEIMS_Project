import { api } from './api';

const API_URL = '/internship-plans';

export const InternshipPlanService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),
    getMyPlan: () => api.get(`${API_URL}/my-plan`),
    getByAssignment: (assignmentId: string) => api.get(`${API_URL}/by-assignment/${assignmentId}`),
    getByJobPost: (jobPostId: string) => api.get(`${API_URL}/by-job-post/${jobPostId}`),
    getPendingMasterPlans: () => api.get(`${API_URL}/pending-master-plans`),
    approveMasterPlan: (planId: string) => api.post(`${API_URL}/${planId}/approve`),
    rejectMasterPlan: (planId: string, reason: string) => api.post(`${API_URL}/${planId}/reject`, { reason }),
    create: (data: any) => api.post(API_URL, data),
    update: (id: string, data: any) => api.put(`${API_URL}/${id}`, data),
    delete: (id: string) => api.delete(`${API_URL}/${id}`)
};
