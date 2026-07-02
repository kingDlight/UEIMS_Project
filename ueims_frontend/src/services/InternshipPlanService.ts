import { api } from './api';

const API_URL = '/internship-plans';

export interface InternshipPlanPayload {
    planId?: string;
    semesterId: string;
    jobPostId?: string | null;
    overallGoal?: string;
}

export const InternshipPlanService = {
    getAll: () => api.get(API_URL),
    getById: (id: string) => api.get(`${API_URL}/${id}`),

    /** Student lấy plan của mình (chỉ thấy khi APPROVED + match assignment). */
    getMyPlan: () => api.get(`${API_URL}/my-plan`),

    /** Enterprise lấy plan của mình theo semester. */
    getByEnterpriseSemester: (semesterId: string) =>
        api.get(`${API_URL}/by-enterprise-semester`, { params: { semesterId } }),

    /** TM lấy danh sách plan chờ duyệt. */
    getPendingMasterPlans: () => api.get(`${API_URL}/pending-master-plans`),

    /** TM duyệt plan. */
    approveMasterPlan: (planId: string) => api.post(`${API_URL}/${planId}/approve`),

    /** TM từ chối plan. */
    rejectMasterPlan: (planId: string, reason: string) =>
        api.post(`${API_URL}/${planId}/reject`, { reason }),

    /** Enterprise tạo / cập nhật plan. */
    create: (data: InternshipPlanPayload) => api.post(API_URL, data),

    update: (id: string, data: InternshipPlanPayload) => api.put(`${API_URL}/${id}`, data),

    delete: (id: string) => api.delete(`${API_URL}/${id}`),
};