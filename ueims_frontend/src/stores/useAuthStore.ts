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
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, role: UserRole) => void;
  loginWithToken: (token: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentRole: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token, role) =>
        set({ user, token, currentRole: role, isAuthenticated: true }),

      loginWithToken: (token: string) => {
        const payload = extractUserFromToken(token);
        if (!payload) {
          set({ user: null, token: null, currentRole: null, isAuthenticated: false });
          return;
        }
        const primaryRole = (payload.roles[0] as UserRole) || null;
        set({
          user: {
            id: '',
            email: payload.email,
            fullName: payload.email.split('@')[0],
            roles: payload.roles as UserRole[],
            mustChangePassword: payload.mustChangePassword,
          },
          token,
          currentRole: primaryRole,
          isAuthenticated: true,
        });
      },

      logout: () =>
        set({ user: null, token: null, currentRole: null, isAuthenticated: false }),

      switchRole: (role) => set({ currentRole: role }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        currentRole: state.currentRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
