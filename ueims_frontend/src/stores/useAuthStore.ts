import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractUserFromToken } from '@/utils/jwt';

export type UserRole = 'ADMIN' | 'TRAINING_MANAGER' | 'ENTERPRISE' | 'STUDENT' | 'MENTOR' | 'LECTURER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  mustChangePassword?: boolean;
  avatarUrl?: string;
  phone?: string;
  status?: string;
  authProvider?: string;
  enterpriseId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, role: UserRole) => void;
  loginWithTokens: (token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      currentRole: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token, role) =>
        set({ user, token, currentRole: role, isAuthenticated: true }),

      loginWithTokens: (token: string, refreshToken: string) => {
        const payload = extractUserFromToken(token);
        if (!payload) {
          set({ user: null, token: null, refreshToken: null, currentRole: null, isAuthenticated: false });
          return;
        }
        const primaryRole = (payload.roles[0] as UserRole) || null;
        set({
          user: {
            id: payload.userId || '',
            email: payload.email,
            fullName: payload.fullName || payload.email.split('@')[0],
            roles: payload.roles as UserRole[],
            mustChangePassword: payload.mustChangePassword,
            avatarUrl: payload.avatarUrl,
            phone: payload.phone,
            status: payload.status,
            authProvider: payload.authProvider,
            enterpriseId: payload.enterpriseId,
          },
          token,
          refreshToken,
          currentRole: primaryRole,
          isAuthenticated: true,
        });
      },

      setTokens: (token: string, refreshToken: string) => set({ token, refreshToken }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, currentRole: null, isAuthenticated: false }),

      switchRole: (role) => set({ currentRole: role }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        currentRole: state.currentRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
