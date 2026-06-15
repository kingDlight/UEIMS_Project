import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

import { RegisterEnterprisePage } from '@/pages/auth/RegisterEnterprisePage';
import { HomePage } from '@/pages/home/HomePage';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { EmailPreviewPage } from '@/pages/dev/EmailPreviewPage';
import { NoRolePage } from '@/pages/auth/NoRolePage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

const TrainingManagerDashboard = React.lazy(() => import('@/pages/TrainingManagerDashboard').then(m => ({ default: m.TrainingManagerDashboard })));
const StudentDashboard = React.lazy(() => import('@/pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const EnterpriseDashboard = React.lazy(() => import('@/pages/enterprise/EnterpriseDashboard').then(m => ({ default: m.EnterpriseDashboard })));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
    <Spin size="large" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  {
    path: '/register-enterprise',
    element: <RegisterEnterprisePage />,
  },
  {
    path: '/no-role',
    element: <NoRolePage />,
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/training-manager/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TrainingManagerDashboard />
          </Suspense>
        ),
      },
      // Nếu sau này có màn hình nào khác của Admin/Student cần dùng AppLayout cũ thì khai báo vào đây:
      // {
      //   path: 'admin',
      //   element: <AppLayout />,
      //   children: [...]
      // }
    ],
  },
  {
    path: '/dev/email-preview',
    element: <EmailPreviewPage />,
  },
  {
    path: '/training-manager/:tab?',
    element: (
      <Suspense fallback={<PageLoader />}>
        <TrainingManagerDashboard />
      </Suspense>
    ),
  },
  {
    path: '/student/:tab?',
    element: (
      <Suspense fallback={<PageLoader />}>
        <StudentDashboard />
      </Suspense>
    ),
  },
  {
    path: '/enterprise-dashboard/:tab?',
    element: (
      <Suspense fallback={<PageLoader />}>
        <EnterpriseDashboard />
      </Suspense>
    ),
  },
  {
    path: '/admin/:tab?',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminDashboard />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});
