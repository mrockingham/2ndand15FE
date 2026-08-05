import { ApiError } from '@/services/api/apiClient';

export const getPublicGameErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return 'The schedule is unavailable right now. Please try again.';
  }
  if (error.status === 400) return 'Those schedule filters are not valid.';
  if (error.status === 404) return 'That game or team could not be found.';
  if (error.status === 429)
    return 'Too many schedule requests were made. Please wait and try again.';
  return 'The schedule is unavailable right now. Please try again.';
};
