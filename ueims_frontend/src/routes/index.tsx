import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { EmailPreviewPage } from '@/pages/dev/EmailPreviewPage';

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
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <div>Trang Dashboard Module (Sẽ code ở Phase sau)</div>,
          },
        ],
      },
    ],
  },
  {
    path: '/dev/email-preview',
    element: <EmailPreviewPage />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);
