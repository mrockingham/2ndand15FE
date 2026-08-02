import type {
  AuthenticationResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/features/auth/types';
import type { ApiClient } from '@/services/api/apiClient';

export const register = async (
  apiClient: ApiClient,
  request: RegisterRequest,
) => {
  const response = await apiClient.request<AuthenticationResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: request,
    },
  );
  return response.data;
};

export const login = async (apiClient: ApiClient, request: LoginRequest) => {
  const response = await apiClient.request<AuthenticationResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: request,
    },
  );
  return response.data;
};

export const refreshSession = async (apiClient: ApiClient) => {
  const response = await apiClient.request<AuthenticationResponse>(
    '/auth/refresh',
    {
      method: 'POST',
    },
  );
  return response.data;
};

export const logout = (apiClient: ApiClient) =>
  apiClient.request<void>('/auth/logout', { method: 'POST' });

export const forgotPassword = async (
  apiClient: ApiClient,
  request: ForgotPasswordRequest,
) => {
  const response = await apiClient.request<MessageResponse>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: request,
    },
  );
  return response.data;
};

export const resetPassword = async (
  apiClient: ApiClient,
  request: ResetPasswordRequest,
) => {
  const response = await apiClient.request<MessageResponse>(
    '/auth/reset-password',
    {
      method: 'POST',
      body: request,
    },
  );
  return response.data;
};
