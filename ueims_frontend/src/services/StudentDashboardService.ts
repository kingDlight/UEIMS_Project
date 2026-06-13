import { api } from './api';
import { ApplicationService } from './ApplicationService';
import { InterviewService } from './InterviewService';
import { WeeklyReportService } from './WeeklyReportService';
import { SemesterService } from './SemesterService';
import { StudentProfileService } from './StudentProfileService';

export interface StudentDashboardStats {
  applications: number;
  interviews: number;
  reports: number;
  daysRemaining: number;
  semesterName: string;
  semesterStatus: string;
  userProfile: any;
  loggedHours: number;
  applicationStatusRates: { name: string; value: number; color: string }[];
  upNextInterviews: any[];
  recentActivities: any[];
}

export const StudentDashboardService = {
  async getStats(): Promise<StudentDashboardStats> {
    const [appsRes, interviewsRes, reportsRes, semesterRes, profileRes] = await Promise.allSettled([
      ApplicationService.getMyApplications(),
      InterviewService.getMySchedules(),
      WeeklyReportService.getMyReports(),
      SemesterService.getActiveSemester(),
      StudentProfileService.getMyProfile(),
    ]);

    // Profile info
    let userProfile = null;
    if (profileRes.status === 'fulfilled') {
      const res = profileRes.value;
      userProfile = (res as any).data?.result ?? (res as any).data ?? null;
    }

    // Applications count & Status Rates
    let applications = 0;
    let applicationStatusRates: { name: string; value: number; color: string }[] = [];
    let allApps: any[] = [];
    if (appsRes.status === 'fulfilled') {
      const res = appsRes.value;
      allApps = (res as any).data?.result ?? (res as any).data ?? [];
      applications = Array.isArray(allApps) ? allApps.length : 0;
      
      const statusCounts = allApps.reduce((acc: Record<string, number>, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      const colorMap: Record<string, string> = {
        'PENDING': '#f59e0b',
        'SCREENING_PASSED': '#3b82f6',
        'SCREENING_REJECTED': '#ef4444',
        'INTERVIEW_SCHEDULED': '#8b5cf6',
        'INTERVIEW_PASSED': '#10b981',
        'INTERVIEW_FAILED': '#ef4444',
        'OFFER_ACCEPTED': '#10b981',
        'OFFER_DECLINED': '#6b7280',
        'WITHDRAWN': '#9ca3af'
      };

      applicationStatusRates = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' '),
        value: count as number,
        color: colorMap[status] || '#9ca3af'
      }));
    }

    // Interviews count & Up Next
    let interviews = 0;
    let upNextInterviews: any[] = [];
    let allInterviews: any[] = [];
    if (interviewsRes.status === 'fulfilled') {
      const res = interviewsRes.value;
      allInterviews = Array.isArray((res as any).data) ? (res as any).data : [];
      interviews = allInterviews.filter(
        (i: any) => i.status !== 'DECLINED' && i.status !== 'CANCELLED'
      ).length;

      const now = new Date().getTime();
      upNextInterviews = allInterviews
        .filter((i: any) => i.scheduledDatetime && new Date(i.scheduledDatetime).getTime() >= now && i.status !== 'DECLINED' && i.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.scheduledDatetime).getTime() - new Date(b.scheduledDatetime).getTime());
    }

    // Reports count & Logged Hours (Assume 40 hours per approved report)
    let reports = 0;
    let loggedHours = 0;
    let allReports: any[] = [];
    if (reportsRes.status === 'fulfilled') {
      const res = reportsRes.value;
      allReports = (res as any).data?.result ?? (res as any).data ?? [];
      const validReports = Array.isArray(allReports) ? allReports : [];
      reports = validReports.filter(
        (r: any) => r.status !== 'NOT_SUBMITTED' && r.status !== 'DRAFT'
      ).length;
      
      const approvedReports = validReports.filter((r: any) => r.status === 'APPROVED').length;
      loggedHours = approvedReports * 40;
    }

    // Recent Activities (Merge apps, interviews, reports and sort)
    let recentActivities: any[] = [];
    allApps.forEach(app => {
      recentActivities.push({
        id: `app-${app.applicationId}`,
        title: `Applied to ${app.enterpriseName || 'Enterprise'}`,
        date: new Date(app.createdAt || app.updatedAt || new Date()),
        type: 'application'
      });
    });
    allInterviews.forEach(inv => {
      recentActivities.push({
        id: `inv-${inv.interviewId}`,
        title: `Interview scheduled with ${inv.enterpriseName || 'Enterprise'}`,
        date: new Date(inv.createdAt || inv.updatedAt || new Date()),
        type: 'interview'
      });
    });
    allReports.forEach(rep => {
      if (rep.status !== 'NOT_SUBMITTED' && rep.status !== 'DRAFT') {
        recentActivities.push({
          id: `rep-${rep.reportId}`,
          title: `Submitted report for Week ${rep.weekNumber}`,
          date: new Date(rep.submittedAt || rep.updatedAt || new Date()),
          type: 'report'
        });
      }
    });

    recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
    recentActivities = recentActivities.slice(0, 10);

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

    return { 
      applications, 
      interviews, 
      reports, 
      daysRemaining, 
      semesterName, 
      semesterStatus,
      userProfile,
      loggedHours,
      applicationStatusRates,
      upNextInterviews,
      recentActivities
    };
  },
};
