import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';

import { RegisterEnterprisePage } from '@/pages/auth/RegisterEnterprisePage';
import { HomePage } from '@/pages/home/HomePage';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { EmailPreviewPage } from '@/pages/dev/EmailPreviewPage';
import { TrainingManagerDashboard } from '@/pages/TrainingManagerDashboard';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { NoRolePage } from '@/pages/auth/NoRolePage';

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
    path: '/change-password',
    element: <ChangePasswordPage />,
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
        element: <TrainingManagerDashboard />,
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
    element: <TrainingManagerDashboard />,
  },
  {
    path: '/student/:tab?',
    element: <StudentDashboard />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
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
