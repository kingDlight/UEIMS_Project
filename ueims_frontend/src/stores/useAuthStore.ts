import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'TRAINING_MANAGER' | 'ENTERPRISE' | 'STUDENT' | 'MENTOR' | 'LECTURER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentRole: null,
      isAuthenticated: false,

      login: (user, token, role) => set({ user, token, currentRole: role, isAuthenticated: true }),
      
      logout: () => set({ user: null, token: null, currentRole: null, isAuthenticated: false }),
      
      switchRole: (role) => set({ currentRole: role }),
    }),
    {
      name: 'auth-storage', // Lưu vào localStorage để giữ phiên đăng nhập
    }
  )
);
