import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { getDeviceId } from '@/utils/device';

// If VITE_API_URL is provided by environment (e.g., prod), use it. Otherwise, use localhost.
const API_URL = process.env.VITE_API_URL || `${process.env.VITE_API_URL || 'http://localhost:8080/api'}`;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Do not attach old tokens to login or refresh endpoints to prevent 401 loop
    if (
      config.url?.includes('/auth/token') ||
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/google')
    ) {
      return config;
    }

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => { throw error; }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string | null) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Skip interceptor for auth endpoints to avoid infinite loops
    if (originalRequest.url?.includes('/auth/')) {
      throw error;
    }

    // Check if the error is 401 and it's not a retry of a failed refresh token request itself
    if ((status === 401 || code === 1006) && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for the new token
        const token = await new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint directly with axios to avoid interceptor loops
        const { data } = await axios.post<{ code: number; result: { accessToken: string; refreshToken: string } }>(
          `${API_URL}/auth/refresh`,
          { token: refreshToken, deviceId: getDeviceId() }
        );

        const newToken = data.result?.accessToken;
        const newRefreshToken = data.result?.refreshToken;

        if (!newToken) throw new Error('Token not returned');

        // Update the store
        useAuthStore.getState().setTokens(newToken, newRefreshToken);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        // Soft redirect: let React Router handle via ProtectedRoute state change
        globalThis.dispatchEvent(new CustomEvent('auth:logout'));
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);
