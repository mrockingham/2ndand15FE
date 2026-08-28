import { ApiError } from '@/services/api/apiClient';

export const isStandingsNotFound = (error: unknown) =>
  error instanceof ApiError &&
  (error.status === 404 || error.code === 'STANDINGS_NOT_FOUND');

export const getStandingsErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 0)
    return 'We could not reach the standings service. Check your connection and try again.';
  return 'Standings could not be loaded. Try again.';
};
