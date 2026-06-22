import { api } from './api';

export type OjtStatus = 
  | 'NOT_APPLICABLE'
  | 'PREPARING'
  | 'ELIGIBLE_NO_PLACEMENT'
  | 'APPLIED'
  | 'MATCHING_IN_PROGRESS'
  | 'PLACED'
  | 'AT_RISK'
  | 'BLOCKED';

export interface OjtStatusResponse {
  ojtStatus: OjtStatus;
  statusLabel: string;
  statusColor: string;
  isUrgent: boolean;
  riskReason: string | null;
  daysUntilDeadline: number | null;
  deadlineLabel: string | null;
  placementEnterpriseName: string | null;
  contactSupportEmail: string | null;
  contactSupportName: string | null;
  applicationCount: number;
  interviewCount: number;
  reportCount: number;
  semesterId: string | null;
  semesterName: string | null;
}

export const OjtStatusService = {
  getMyOjtStatus: async (): Promise<OjtStatusResponse> => {
    const response = await api.get('/ojt-status/my');
    return response.data;
  },
};
