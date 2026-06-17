import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { router } from './routes';
import { themeConfig } from './theme/themeConfig';
import { useEffect, useMemo } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const IS_GOOGLE_ENABLED = GOOGLE_CLIENT_ID.length > 0
  && !GOOGLE_CLIENT_ID.includes('your-google-client-id');

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const handleLogout = () => {
      router.navigate('/login');
    };
    globalThis.addEventListener('auth:logout', handleLogout);
    return () => globalThis.removeEventListener('auth:logout', handleLogout);
  }, []);

  const tree = (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </ConfigProvider>
    </QueryClientProvider>
  );

  return IS_GOOGLE_ENABLED ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{tree}</GoogleOAuthProvider>
  ) : (
    tree
  );
}

export default App;
