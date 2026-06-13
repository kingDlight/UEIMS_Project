import { api } from './api';
import { ApplicationService } from './ApplicationService';
import { InterviewService } from './InterviewService';
import { WeeklyReportService } from './WeeklyReportService';
import { SemesterService } from './SemesterService';

export interface StudentDashboardStats {
  applications: number;
  interviews: number;
  reports: number;
  daysRemaining: number;
  semesterName: string;
  semesterStatus: string;
}

export const StudentDashboardService = {
  async getStats(): Promise<StudentDashboardStats> {
    const [appsRes, interviewsRes, reportsRes, semesterRes] = await Promise.allSettled([
      ApplicationService.getMyApplications(),
      InterviewService.getMySchedules(),
      WeeklyReportService.getMyReports(),
      SemesterService.getActiveSemester(),
    ]);

    // Applications count
    let applications = 0;
    if (appsRes.status === 'fulfilled') {
      const res = appsRes.value;
      const data = (res as any).data?.result ?? (res as any).data ?? [];
      applications = Array.isArray(data) ? data.length : 0;
    }

    // Interviews count (exclude declined/cancelled)
    let interviews = 0;
    if (interviewsRes.status === 'fulfilled') {
      const res = interviewsRes.value;
      const data = (res as any).data ?? [];
      interviews = (Array.isArray(data) ? data : []).filter(
        (i: any) => i.status !== 'DECLINED' && i.status !== 'CANCELLED'
      ).length;
    }

    // Reports count (exclude NOT_SUBMITTED)
    let reports = 0;
    if (reportsRes.status === 'fulfilled') {
      const res = reportsRes.value;
      const data = (res as any).data?.result ?? (res as any).data ?? [];
      reports = (Array.isArray(data) ? data : []).filter(
        (r: any) => r.status !== 'NOT_SUBMITTED' && r.status !== 'DRAFT'
      ).length;
    }

    // Semester info
    let daysRemaining = 0;
    let semesterName = '—';
    let semesterStatus = 'N/A';

    if (semesterRes.status === 'fulfilled' && semesterRes.value) {
      const sem = (semesterRes.value as any);
      semesterName = sem.name || sem.semesterCode || '—';
      semesterStatus = sem.status || 'N/A';
      if (sem.endDate) {
        const end = new Date(sem.endDate);
        const now = new Date();
        daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
    }

    return { applications, interviews, reports, daysRemaining, semesterName, semesterStatus };
  },
};
