import { api } from './api';

export const ActivityService = {
  /**
   * Lightweight heartbeat to record that the current user is on a page.
   * Used so the backend request log captures page-level activity (e.g. HomePage)
   * which would otherwise never hit the API.
   */
  heartbeat: async () => {
    try {
      await api.post('/activity/heartbeat');
    } catch {
      // Heartbeat must never break the UI; swallow errors silently.
    }
  },
};
