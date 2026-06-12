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
    const [appsRes, interviewsRes, reportsRes, semester] = await Promise.allSettled([
      ApplicationService.getMyApplications(),
      InterviewService.getMySchedules(),
      WeeklyReportService.getMyReports(),
      SemesterService.getActiveSemester(),
    ]);

    const applications = appsRes.status === 'fulfilled'
      ? (appsRes.value.data?.result ?? appsRes.value.data ?? []).length : 0;

    const interviews = interviewsRes.status === 'fulfilled'
      ? ((interviewsRes.value.data ?? []) as any[]).filter(i => i.status !== 'DECLINED' && i.status !== 'CANCELLED').length : 0;

    const reports = reportsRes.status === 'fulfilled'
      ? ((reportsRes.value.data ?? []) as any[]).filter(r => r.status !== 'NOT_SUBMITTED').length : 0;

    let daysRemaining = 0;
    let semesterName = '—';
    let semesterStatus = 'N/A';

    if (semester.status === 'fulfilled' && semester.value) {
      const sem = semester.value;
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
