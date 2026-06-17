import { api } from './api';

const API_URL = '/placement-applications';

export interface PlacementApplicationRequest {
    enterpriseId: string;
    coverLetter?: string;
}

export interface RejectApplicationRequest {
    rejectionReason: string;
}

export interface PlacementApplicationResponse {
    applicationId: string;
    studentId: string;
    studentName: string;
    studentCode: string;
    major: string;
    enterpriseId: string;
    enterpriseName: string;
    semesterId: string;
    semesterCode: string;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
    coverLetter?: string;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedByName?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OjtPlacementView {
    studentId: string;
    studentName: string;
    studentCode: string;
    major: string;
    semesterId: string;
    semesterCode: string;
    /** UNPLACED | PENDING_APPROVAL | REJECTED | WITHDRAWN | PLACED | COMPLETED | CANCELLED */
    workflowStatus: string;
    assignmentId?: string;
    enterpriseId?: string;
    enterpriseName?: string;
    assignmentStatus?: string;
    applicationId?: string;
    applicationStatus?: string;
    coverLetter?: string;
    applicationCreatedAt?: string;
}

export const PlacementApplicationService = {
    apply: (data: PlacementApplicationRequest) => api.post(API_URL, data),
    getPending: () => api.get(`${API_URL}/pending`),
    getMyApplications: () => api.get(`${API_URL}/my`),
    approve: (id: string) => api.put(`${API_URL}/${id}/approve`),
    reject: (id: string, data: RejectApplicationRequest) => api.put(`${API_URL}/${id}/reject`, data),
    withdraw: (id: string) => api.put(`${API_URL}/${id}/withdraw`),
    getOjtPlacementView: () => api.get('/ojt-placements/view'),
};