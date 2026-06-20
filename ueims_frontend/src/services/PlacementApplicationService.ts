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
    isReplacement?: boolean;
    replacesApplicationId?: string;
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
    isReplacement?: boolean;
}

export interface ManualMatchRequest {
    studentId: string;
    enterpriseId: string;
    note?: string;
}

export interface AutoMatchResult {
    matchedCount: number;
    skippedCount: number;
    durationMs: number;
    details: Array<{
        studentId: string;
        studentName: string;
        studentCode: string;
        enterpriseId: string;
        enterpriseName: string;
        applicationId: string;
        score: number;
        reason: string;
    }>;
    skipped: Array<{
        studentId: string;
        studentName: string;
        reason: string;
    }>;
}

export const PlacementApplicationService = {
    apply: (data: PlacementApplicationRequest) => api.post(API_URL, data),
    getPending: () => api.get(`${API_URL}/pending`),
    getMyApplications: () => api.get(`${API_URL}/my`),
    approve: (id: string) => api.put(`${API_URL}/${id}/approve`),
    reject: (id: string, data: RejectApplicationRequest) => api.put(`${API_URL}/${id}/reject`, data),
    withdraw: (id: string) => api.put(`${API_URL}/${id}/withdraw`),
    exportOjtPlacements: (semesterId: string) => api.get(`${API_URL}/export?semesterId=${semesterId}`, { responseType: 'blob' }),
    getOjtPlacementView: () => api.get('/ojt-placements/view'),
    manualMatch: (data: ManualMatchRequest) => api.post('/ojt-placements/manual-match', data),
    autoMatch: () => api.post('/ojt-placements/auto-match'),
};