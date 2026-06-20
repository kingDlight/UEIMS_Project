import React from 'react';

export type PageKey =
  | 'dashboard'
  | 'enterprises'
  | 'students'
  | 'ojt'
  | 'analytics'
  | 'incidents'
  | 'system-reports'
  | 'weekly-reports'
  | 'calendar'
  | 'notifications'
  | 'at-risk';

export type ThemeColors = {
  bg: string;
  bgLight: string;
  gradient: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  secondary: string;
  cardOrange: string;
  cardPeach: string;
  cardYellow: string;
  cardGreen: string;
  cardBlue: string;
  cardPurple: string;
  text: string;
  textMuted: string;
  textLight: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  purple: string;
  shadow: string;
  borderRadius: number;
  border: string;
};

export type Stats = {
  totalStudents: number;
  activeInterns: number;
  pendingOJT: number;
  atRisk: number;
  enterprises: number;
  reportsThisWeek: number;
};

export type OJTApproval = {
  id: number;
  student: string;
  studentId: string;
  enterprise: string;
  position: string;
  submittedDate: string;
  status: string;
};

export type Incident = {
  incidentId: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  assignment?: any;
  reportedBy?: any;
  resolutionNote?: string;
};

export type WeeklyReport = {
  day: string;
  submitted: number;
  pending: number;
};

export type SemesterCard = {
  code: string;
  name: string;
  status: string;
  start: string;
  end: string;
  students: number;
  enterprises: number;
  tone: string;
};

export type Enterprise = {
  enterpriseId: string;
  companyName: string;
  taxCode: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  contactPerson: string;
  contactEmail: string;
  industry: string;
};

export type EligibleStudent = {
  eligibleId: string;
  studentCode: string;
  fullName: string;
  email: string;
  major: string;
  gpa: number;
  currentSemester: number;
  status: string;
  isLocked: boolean;
  cancelledReason?: string | null;
  cancelledBy?: string | null;
  importedAt?: string;
  approvedAt?: string | null;
  tone?: string;
};

export type GradeRow = {
  student: string;
  enterprise: string;
  rubrics: string;
  final: string;
  status: string;
};

export type FeedbackSample = {
  student: string;
  enterprise: string;
  score: number;
  comment: string;
  tone: string;
};

export type AlertItem = {
  title: string;
  meta: string;
  tone: string;
};

export type NavItem = {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
};

export type SystemAnnouncement = {
  announcementId: string;
  title: string;
  content: string;
  status: string;
  type?: string;
  audience?: string;
  targetRole?: string;
  publishedAt?: string;
  createdAt?: string;
  semesterId?: string;
  semester?: {
    semesterId: string;
    semesterCode: string;
    name?: string;
  };
  createdBy?: {
    userId: string;
    fullName: string;
    email: string;
  };
  createdById?: string;
  createdByFullName?: string;
};

export type AtRiskStudent = {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  semesterId: string;
  semesterCode: string;
  supervisorName?: string;
  companyName?: string;
  missedReports?: number;
  rejectedReports?: number;
};
