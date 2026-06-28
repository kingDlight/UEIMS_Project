import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { router } from './routes/router';
import { themeConfig } from './theme/themeConfig';
import { useEffect } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const handleLogout = () => {
      queryClient.clear();
      router.navigate('/login', { replace: true });
    };
    globalThis.addEventListener('auth:logout', handleLogout);
    return () => globalThis.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={themeConfig}>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </ConfigProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
