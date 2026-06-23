import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { StudentProfileService } from '@/services/StudentProfileService';

export const useUserInfoQuery = () => {
  const { token, user } = useAuthStore();
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      if (user) {
        return {
          ...user,
          userId: user.id
        };
      }
      return null;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useStudentProfileQuery = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await StudentProfileService.getMyProfile();
      return res?.data?.result ?? res?.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCombinedProfileQuery = () => {
  const userInfoQuery = useUserInfoQuery();
  const studentProfileQuery = useStudentProfileQuery();

  const isLoading = userInfoQuery.isLoading || studentProfileQuery.isLoading;
  const isError = userInfoQuery.isError || studentProfileQuery.isError;

  const data = userInfoQuery.data && studentProfileQuery.data ? {
    ...userInfoQuery.data,
    ...studentProfileQuery.data
  } : null;

  return {
    data,
    isLoading,
    isError,
    refetch: async () => {
      await Promise.all([userInfoQuery.refetch(), studentProfileQuery.refetch()]);
    }
  };
};
