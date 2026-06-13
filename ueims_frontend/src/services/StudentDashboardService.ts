import { ApplicationService } from './ApplicationService';
import { EnterpriseAssignmentService } from './EnterpriseAssignmentService';
import { InterviewService } from './InterviewService';
import { WeeklyReportService } from './WeeklyReportService';
import { SemesterService } from './SemesterService';
import { StudentProfileService } from './StudentProfileService';

type ApiResponse<T> = {
  data?: {
    result?: T;
  };
} | {
  data?: T;
};

type ApplicationDto = {
  status?: string;
  applicationId?: string;
  enterpriseName?: string;
  createdAt?: string;
  updatedAt?: string;
};

type InterviewDto = {
  status?: string;
  scheduledDatetime?: string;
  interviewId?: string;
  enterpriseName?: string;
  createdAt?: string;
  updatedAt?: string;
};

type WeeklyReportDto = {
  status?: string;
  reportId?: string;
  weekNumber?: number;
  submittedAt?: string;
  updatedAt?: string;
};

type AssignmentDto = {
  enterprise?: {
    name?: string;
  };
  enterpriseName?: string;
};

type SemesterResponse = {
  name?: string;
  semesterCode?: string;
  status?: string;
  endDate?: string;
};

type UserProfileDto = Record<string, unknown> | null;

type RecentActivityDto = {
  id: string;
  title: string;
  date: Date;
  type: 'application' | 'interview' | 'report';
};

const unwrapApiResponse = <T>(response: ApiResponse<T> | T | undefined): T | undefined => {
  if (Array.isArray(response)) {
    return response as T;
  }

  if (response && typeof response === 'object' && 'data' in response) {
    const payload = response as { data?: unknown };
    const maybeData = payload.data;
    if (maybeData && typeof maybeData === 'object' && 'result' in maybeData) {
      return (maybeData as { result?: T }).result ?? (maybeData as T);
    }
    return maybeData as T | undefined;
  }

  return response as T | undefined;
};

export interface StudentDashboardStats {
  applications: number;
  interviews: number;
  reports: number;
  daysRemaining: number;
  semesterName: string;
  semesterStatus: string;
  currentSemester?: number;
  hasActivePlacement: boolean;
  enterpriseName?: string;
  userProfile: UserProfileDto;
  loggedHours: number;
  applicationStatusRates: { name: string; value: number; color: string }[];
  upNextInterviews: InterviewDto[];
  recentActivities: RecentActivityDto[];
}

export const StudentDashboardService = {
  async getStats(): Promise<StudentDashboardStats> {
    const [appsRes, interviewsRes, reportsRes, semesterRes, profileRes, assignmentRes] = await Promise.allSettled([
      ApplicationService.getMyApplications(),
      InterviewService.getMySchedules(),
      WeeklyReportService.getMyReports(),
      SemesterService.getActiveSemester(),
      StudentProfileService.getMyProfile(),
      EnterpriseAssignmentService.getMyAssignment(),
    ]);

    // Profile info
    let userProfile = null;
    let currentSemester: number | undefined = undefined;
    if (profileRes.status === 'fulfilled') {
      const response = profileRes.value;
      const payload = unwrapApiResponse<Record<string, unknown>>(response);
      userProfile = payload as UserProfileDto;
      if (userProfile && typeof userProfile.currentSemester === 'number') {
        currentSemester = userProfile.currentSemester;
      }
    }

    // Applications count & Status Rates
    let applications = 0;
    let applicationStatusRates: { name: string; value: number; color: string }[] = [];
    let allApps: ApplicationDto[] = [];
    if (appsRes.status === 'fulfilled') {
      const response = appsRes.value;
      allApps = unwrapApiResponse<ApplicationDto[]>(response) ?? [];
      applications = allApps.length;

      const statusCounts = allApps.reduce((acc: Record<string, number>, app) => {
        const status = app.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
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
        'WITHDRAWN': '#9ca3af',
        'UNKNOWN': '#9ca3af'
      };

      applicationStatusRates = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' '),
        value: count,
        color: colorMap[status] || '#9ca3af'
      }));
    }

    // Interviews count & Up Next
    let interviews = 0;
    let upNextInterviews: InterviewDto[] = [];
    let allInterviews: InterviewDto[] = [];
    if (interviewsRes.status === 'fulfilled') {
      const response = interviewsRes.value;
      allInterviews = unwrapApiResponse<InterviewDto[]>(response) ?? [];
      interviews = allInterviews.filter(
        (i) => i.status !== 'DECLINED' && i.status !== 'CANCELLED'
      ).length;

      const now = new Date().getTime();
      upNextInterviews = allInterviews
        .filter((i) => i.scheduledDatetime && new Date(i.scheduledDatetime).getTime() >= now && i.status !== 'DECLINED' && i.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.scheduledDatetime || '').getTime() - new Date(b.scheduledDatetime || '').getTime());
    }

    // Reports count & Logged Hours (Assume 40 hours per approved report)
    let reports = 0;
    let loggedHours = 0;
    let allReports: WeeklyReportDto[] = [];
    if (reportsRes.status === 'fulfilled') {
      const response = reportsRes.value;
      allReports = unwrapApiResponse<WeeklyReportDto[]>(response) ?? [];
      reports = allReports.filter(
        (r) => r.status !== 'NOT_SUBMITTED' && r.status !== 'DRAFT'
      ).length;
      
      const approvedReports = allReports.filter((r) => r.status === 'APPROVED').length;
      loggedHours = approvedReports * 40;
    }

    let hasActivePlacement = false;
    let enterpriseName = '';
    if (assignmentRes.status === 'fulfilled') {
      const response = assignmentRes.value;
      const assignment = unwrapApiResponse<AssignmentDto>(response);
      if (assignment) {
        hasActivePlacement = true;
        enterpriseName = assignment.enterprise?.name || assignment.enterpriseName || '';
      }
    }

    // Semester info
    let daysRemaining = 0;
    let semesterName = '—';
    let semesterStatus = 'N/A';
    if (semesterRes.status === 'fulfilled') {
      const response = semesterRes.value;
      const sem = unwrapApiResponse<SemesterResponse>(response);
      if (sem) {
        semesterName = sem.name || sem.semesterCode || semesterName;
        semesterStatus = sem.status || semesterStatus;
        if (sem.endDate) {
          const end = new Date(sem.endDate);
          const now = new Date();
          daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }
    }

    // Recent Activities (Merge apps, interviews, reports and sort)
    const recentActivities: RecentActivityDto[] = [];
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

    return {
      applications,
      interviews,
      reports,
      daysRemaining,
      semesterName,
      semesterStatus,
      currentSemester,
      hasActivePlacement,
      enterpriseName,
      userProfile,
      loggedHours,
      applicationStatusRates,
      upNextInterviews,
      recentActivities
    };
  },
};
