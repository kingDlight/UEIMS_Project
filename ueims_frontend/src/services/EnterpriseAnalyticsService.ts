import { api } from './api';

export interface MajorQualityRow {
    semesterId: string;
    semesterCode: string;
    semesterName: string;
    major: string;
    totalStudents: number;
    avgGpa: number | null;
    interviewsPassed: number;
    interviewsFailed: number;
    interviewPassRate: number;
    avgFinalGrade: number | null;
}

export interface EnterpriseAnalyticsService {
    /**
     * GET /api/enterprise/analytics/student-quality-by-major
     * @param semesterId optional. Omit (or undefined) = tất cả các kỳ DN từng có SV.
     *                    Truyền UUID = chỉ aggregate kỳ đó.
     */
    getStudentQualityByMajor: (semesterId?: string) => Promise<MajorQualityRow[]>;
}

export const EnterpriseAnalyticsService: EnterpriseAnalyticsService = {
    getStudentQualityByMajor: async (semesterId?: string) => {
        const params: Record<string, string> = {};
        if (semesterId) params.semesterId = semesterId;
        const response = await api.get('/enterprise/analytics/student-quality-by-major', { params });
        return response.data?.result ?? response.data ?? [];
    },
};
