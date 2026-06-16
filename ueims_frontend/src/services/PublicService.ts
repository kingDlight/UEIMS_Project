import { api } from './api';

export interface PublicHomeStats {
  interns: number;
  enterprises: number;
  completion: number;
  satisfaction: number;
}

const DEFAULT_STATS: PublicHomeStats = {
  interns: 3200,
  enterprises: 450,
  completion: 98.5,
  satisfaction: 96.2,
};

let cachedHomeStatsPromise: Promise<PublicHomeStats> | null = null;

export const PublicService = {
  getHomeStats: (): Promise<PublicHomeStats> => {
    if (!cachedHomeStatsPromise) {
      cachedHomeStatsPromise = api.get('/public/home-stats')
        .then((res) => {
          return res.data?.result || DEFAULT_STATS;
        })
        .catch((error) => {
          console.error('Failed to fetch home stats, using defaults', error);
          // Clear cache on error so next navigation retries the API
          cachedHomeStatsPromise = null;
          return DEFAULT_STATS;
        });
    }
    return cachedHomeStatsPromise;
  },

  /** Call this to force a fresh fetch on next getHomeStats() */
  clearCache: () => {
    cachedHomeStatsPromise = null;
  },
};
