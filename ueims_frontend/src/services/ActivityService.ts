import { api } from './api';

export const ActivityService = {
  /**
   * Records that the current user opened a page. The request is picked up
   * by the backend's {@code RequestLoggingFilter} so the page appears in the
   * admin "Request Logs" tab together with the user's email/userId.
   */
  pageView: async (page: string) => {
    try {
      await api.post('/activity/page-view', { page });
    } catch {
      // Activity tracking must never break the UI; swallow errors silently.
    }
  },
};
