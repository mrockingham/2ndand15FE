import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/services/api/apiClient';

type AuthErrorContext = 'forgot' | 'login' | 'register' | 'reset';

const genericMessages: Readonly<Record<AuthErrorContext, string>> = {
  forgot: 'We couldn’t submit that request. Please try again.',
  login: 'We couldn’t sign you in. Please try again.',
  register: 'We couldn’t create your account. Please try again.',
  reset: 'We couldn’t reset your password. Please try again.',
};

export const getAuthErrorMessage = (
  error: unknown,
  context: AuthErrorContext,
) => {
  if (!(error instanceof ApiError)) {
    return genericMessages[context];
  }

  switch (error.code) {
    case 'EMAIL_ALREADY_REGISTERED':
      return 'An account with that email already exists. Try signing in instead.';
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password.';
    case 'INVALID_RESET_TOKEN':
      return 'This password reset link is invalid or has expired. Request a new one.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many attempts. Please wait before trying again.';
    case 'NETWORK_ERROR':
      return 'We couldn’t reach the server. Check your connection and try again.';
    case 'VALIDATION_ERROR':
      return 'Check the highlighted fields and try again.';
    default:
      return genericMessages[context];
  }
};

export const applyApiFieldErrors = <Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  allowedFields: readonly Path<Values>[],
) => {
  if (!(error instanceof ApiError) || error.fieldErrors === undefined) {
    return;
  }

  for (const field of allowedFields) {
    const message = error.fieldErrors[field]?.[0];
    if (message !== undefined) {
      setError(field, { type: 'server', message });
    }
  }
};
