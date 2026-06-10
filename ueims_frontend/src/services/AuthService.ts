import { api } from './api';
import { getDeviceId } from '@/utils/device';

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  authenticated: boolean;
  mustChangePassword: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LogoutRequest {
  token: string;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
}

export interface EnterpriseRegistrationRequest {
  enterpriseName: string;
  taxCode: string;
  contactPerson: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export const AuthService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<{ code: number; message: string; result: LoginResponse }>(
      '/auth/token',
      data
    );
    return response.data.result;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  logout: async (token: string): Promise<void> => {
    await api.post('/auth/logout', { token });
  },

  introspect: async (token: string): Promise<IntrospectResponse> => {
    const response = await api.post<{ code: number; message: string; result: IntrospectResponse }>(
      '/auth/introspect',
      { token }
    );
    return response.data.result;
  },

  registerEnterprise: async (data: EnterpriseRegistrationRequest): Promise<void> => {
    await api.post('/auth/register-enterprise', data);
  },

  loginWithGoogle: async (idToken: string): Promise<LoginResponse> => {
    const deviceId = getDeviceId();
    const response = await api.post<{ code: number; message: string; result: LoginResponse }>(
      '/auth/google',
      { idToken, deviceId }
    );
    return response.data.result;
  },
};
