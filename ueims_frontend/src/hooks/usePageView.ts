import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { isTokenExpired } from '@/utils/jwt';
import { ActivityService } from '@/services/ActivityService';

/**
 * Records page-level activity against the current user. Only fires when the
 * user is authenticated, and only forwards the path portion of the URL (e.g.
 * "/", "/admin/dashboard") so the admin "Request Logs" tab can clearly see
 * which page a user is on.
 *
 * Sends one request on path change, then re-sends every {@code intervalMs}
 * while the user stays on the same path.
 */
export const usePageView = (intervalMs: number = 60_000) => {
  const { isAuthenticated, token } = useAuthStore();
  const location = useLocation();
  const lastSentRef = useRef<{ path: string; ts: number }>({ path: '', ts: 0 });

  useEffect(() => {
    const tick = () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) return;
      const currentToken = state.token;
      if (!currentToken || isTokenExpired(currentToken)) return;

      const path = window.location.pathname + window.location.search;
      const now = Date.now();
      const samePath = lastSentRef.current.path === path;
      if (samePath && now - lastSentRef.current.ts < intervalMs) return;

      lastSentRef.current = { path, ts: now };
      void ActivityService.pageView(path);
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [location.pathname, isAuthenticated, token, intervalMs]);
};
