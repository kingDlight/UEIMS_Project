import { useQuery } from '@tanstack/react-query';
import { JobPostService } from '@/services/JobPostService';
import { ApplicationService } from '@/services/ApplicationService';

export const useActiveJobsQuery = () => {
  return useQuery({
    queryKey: ['activeJobs'],
    queryFn: async () => {
      const res = await JobPostService.getActive();
      const data = res.data?.result ?? res.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyApplicationsIdsQuery = () => {
  return useQuery({
    queryKey: ['myApplicationsIds'],
    queryFn: async () => {
      const res = await ApplicationService.getMyApplications();
      const applications = res.data?.result ?? res.data ?? [];
      return new Set<number>(applications.map((a: any) => a.jobPostId));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyApplicationsQuery = () => {
  return useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await ApplicationService.getMyApplications();
      const apps = res.data?.result ?? res.data ?? [];
      return Array.isArray(apps) ? apps : [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchJobs = (queryClient: any) => {
  queryClient.prefetchQuery({
    queryKey: ['activeJobs'],
    queryFn: async () => {
      const res = await JobPostService.getActive();
      const data = res.data?.result ?? res.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
  queryClient.prefetchQuery({
    queryKey: ['myApplicationsIds'],
    queryFn: async () => {
      const res = await ApplicationService.getMyApplications();
      const applications = res.data?.result ?? res.data ?? [];
      return new Set<number>(applications.map((a: any) => a.jobPostId));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchApplications = (queryClient: any) => {
  queryClient.prefetchQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await ApplicationService.getMyApplications();
      const apps = res.data?.result ?? res.data ?? [];
      return Array.isArray(apps) ? apps : [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
