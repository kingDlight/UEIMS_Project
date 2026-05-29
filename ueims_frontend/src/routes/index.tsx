import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Protected routes (require login)
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
          // Thêm các routes module ở đây (semesters, enterprises,...)
        ],
      },
    ],
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);
