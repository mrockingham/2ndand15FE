import type { CurrentUser } from '@/features/users/types';

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly displayName?: string | null;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface ForgotPasswordRequest {
  readonly email: string;
}

export interface ResetPasswordRequest {
  readonly token: string;
  readonly password: string;
}

export interface AuthenticationData {
  readonly user: CurrentUser;
  readonly accessToken: string;
  readonly accessTokenExpiresIn: number;
}

export interface AuthenticationResponse {
  readonly data: AuthenticationData;
}

export interface MessageResponse {
  readonly data: {
    readonly message: string;
  };
}
