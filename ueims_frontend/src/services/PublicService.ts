import { api } from './api';

export interface PublicHomeStats {
  interns: number;
  enterprises: number;
  completion: number;
  satisfaction: number;
}

export const PublicService = {
  getHomeStats: async (): Promise<PublicHomeStats> => {
    try {
      const res = await api.get('/public/home-stats');
      return res.data?.result || {
        interns: 3200,
        enterprises: 450,
        completion: 98.5,
        satisfaction: 96.2,
      };
    } catch (error) {
      console.error('Failed to fetch home stats, using defaults', error);
      return {
        interns: 3200,
        enterprises: 450,
        completion: 98.5,
        satisfaction: 96.2,
      };
    }
  },
};
