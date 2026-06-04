import { c } from './constants';
import type {
  AlertItem,
  EligibleStudent,
  EnterpriseApproval,
  FeedbackSample,
  GradeRow,
  Incident,
  OJTApproval,
  SemesterCard,
  Stats,
  WeeklyReport,
} from './types';

export const stats: Stats = {
  totalStudents: 1247,
  activeInterns: 1089,
  pendingOJT: 23,
  atRisk: 12,
  enterprises: 48,
  reportsThisWeek: 89,
};

export const ojtApprovals: OJTApproval[] = [
  { id: 1, student: 'Tran Van Duc', studentId: 'CE170008', enterprise: 'Viettel', position: 'Backend Developer', submittedDate: 'Jun 1, 2026', status: 'pending' },
  { id: 2, student: 'Pham Thi Mai', studentId: 'SE170089', enterprise: 'FPT Software', position: 'Frontend Developer', submittedDate: 'Jun 2, 2026', status: 'pending' },
  { id: 3, student: 'Nguyen Hoang An', studentId: 'IA170045', enterprise: 'VNG Corp', position: 'Data Analyst', submittedDate: 'Jun 2, 2026', status: 'pending' },
  { id: 4, student: 'Le Thi Lan', studentId: 'IA170021', enterprise: 'VNG Corp', position: 'QA Engineer', submittedDate: 'Jun 3, 2026', status: 'pending' },
];

export const incidents: Incident[] = [
  { id: 1, student: 'Hoang Van Nam', studentId: 'AI170015', type: 'attendance', enterprise: 'FPT Software', date: 'Jun 2, 2026', severity: 'high' },
  { id: 2, student: 'Nguyen Van Minh', studentId: 'SE170005', type: 'report', enterprise: 'FPT Software', date: 'Jun 1, 2026', severity: 'medium' },
  { id: 3, student: 'Pham Thi Hoa', studentId: 'SE170012', type: 'report', enterprise: 'TMA Solutions', date: 'May 30, 2026', severity: 'low' },
];

export const weeklyReportData: WeeklyReport[] = [
  { day: 'Mon', submitted: 45, pending: 12 },
  { day: 'Tue', submitted: 52, pending: 8 },
  { day: 'Wed', submitted: 38, pending: 15 },
  { day: 'Thu', submitted: 61, pending: 5 },
  { day: 'Fri', submitted: 42, pending: 10 },
];

export const heroSparklineData = [34, 42, 38, 51, 49, 57, 63, 61, 68];
export const kpiSparklineA = [18, 22, 20, 26, 24, 28, 31];
export const kpiSparklineB = [12, 16, 14, 19, 20, 23, 25];
export const kpiSparklineC = [4, 6, 5, 9, 8, 11, 10];
export const kpiSparklineD = [2, 3, 4, 5, 4, 6, 5];

export const semesterCards: SemesterCard[] = [
  { code: '2026-SUM', name: 'Summer 2026', status: 'Active', start: '20 May 2026', end: '20 Aug 2026', students: 312, enterprises: 18, tone: c.primary },
  { code: '2026-FAL', name: 'Fall 2026', status: 'Draft', start: '01 Sep 2026', end: '20 Dec 2026', students: 0, enterprises: 0, tone: c.warning },
  { code: '2025-SPR', name: 'Spring 2025', status: 'Locked', start: '10 Jan 2025', end: '15 Apr 2025', students: 298, enterprises: 16, tone: c.textMuted },
];

export const enterpriseApprovals: EnterpriseApproval[] = [
  { name: 'NextTech Solutions', tax: '0316xxxxxx', city: 'Da Nang', status: 'Pending review', note: 'Submitted enterprise registration & legal documents', tone: c.warning },
  { name: 'TMA Solutions', tax: '0309xxxxxx', city: 'HCMC', status: 'Approved', note: 'Verified license and approved OJT capacity', tone: c.success },
  { name: 'NashTech VN', tax: '0102xxxxxx', city: 'Ha Noi', status: 'Rejected', note: 'Incomplete legal documents, needs re-submission', tone: c.danger },
];

export const eligibleStudents: EligibleStudent[] = [
  { name: 'Nguyen Thi Hanh', id: 'SE170012', major: 'Software Engineering', gpa: '3.21', semester: '6', status: 'Eligible', tone: c.success },
  { name: 'Tran Minh Khoa', id: 'IA170044', major: 'Information Assurance', gpa: '3.04', semester: '6', status: 'Eligible', tone: c.success },
  { name: 'Pham Ngoc Anh', id: 'CE170083', major: 'Computer Engineering', gpa: '2.76', semester: '5', status: 'Review', tone: c.warning },
];

export const gradeRows: GradeRow[] = [
  { student: 'Tran Van Duc', enterprise: 'Viettel', rubrics: '8.8 / 10', final: 'A', status: 'Ready to submit' },
  { student: 'Pham Thi Mai', enterprise: 'FPT Software', rubrics: '9.2 / 10', final: 'A+', status: 'Submitted' },
  { student: 'Nguyen Hoang An', enterprise: 'VNG Corp', rubrics: '7.6 / 10', final: 'B+', status: 'Waiting enterprise rubrics' },
];

export const feedbackSamples: FeedbackSample[] = [
  { student: 'Le Thi My', enterprise: 'FPT Software', score: 4.8, comment: 'Supervisor is supportive, training plan is structured, but workload is slightly high.', tone: c.success },
  { student: 'Nguyen Van An', enterprise: 'VNG', score: 4.2, comment: 'Good environment, but weekly guidance can be more detailed.', tone: c.primary },
  { student: 'Tran Ha Vy', enterprise: 'Bosch', score: 3.6, comment: 'Tools are good; however onboarding took longer than expected.', tone: c.warning },
];

export const dashboardAlerts: AlertItem[] = [
  { title: '2 enterprise registrations waiting for review', meta: 'Just now', tone: c.warning },
  { title: 'Weekly report deadline tomorrow', meta: '15 min ago', tone: c.primary },
  { title: '1 incident requires escalation', meta: '1 hour ago', tone: c.danger },
];

export const floatingNotifications: AlertItem[] = [
  { title: '2 new OJT approvals', meta: 'Just now', tone: c.primary },
  { title: 'Weekly report deadline tomorrow', meta: '15 min ago', tone: c.warning },
  { title: '1 incident needs review', meta: '1 hour ago', tone: c.danger },
];
