import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { isTokenExpired } from '@/utils/jwt';
import { ActivityService } from '@/services/ActivityService';

/**
 * Sends periodic heartbeats to the backend so that page-level activity
 * (e.g. sitting on the HomePage) is recorded against the current user
 * in the request log. Only fires when the user is authenticated.
 */
export const useActivityHeartbeat = (intervalMs: number = 60_000) => {
  const { token, isAuthenticated } = useAuthStore();
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const currentToken = useAuthStore.getState().token;
      const authed = useAuthStore.getState().isAuthenticated;
      if (!authed || !currentToken || isTokenExpired(currentToken)) return;
      const now = Date.now();
      if (now - lastSentRef.current < intervalMs / 2) return;
      lastSentRef.current = now;
      void ActivityService.heartbeat();
    };

    // Fire one immediately on mount for authenticated users
    tick();

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [isAuthenticated, token, intervalMs]);
};
