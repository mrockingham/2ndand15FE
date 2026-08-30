import { ApiError } from '@/services/api/apiClient';

export const isPowerRankingsNotFound = (error: unknown) =>
  error instanceof ApiError &&
  (error.status === 404 ||
    error.code === 'POWER_RANKING_EDITION_NOT_FOUND' ||
    error.code === 'POWER_RANKINGS_NOT_FOUND');

export const getPowerRankingsErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'The Power Rankings request could not be completed.';
  if (error.status === 404)
    return 'That Power Rankings edition could not be found.';
  if (error.status === 403)
    return 'Your account does not have permission for this Power Rankings action.';
  if (error.status === 409)
    return 'The Power Rankings state conflicts with this action. Reload and try again.';
  if (error.status === 422)
    return 'Review the Power Rankings fields and try again.';
  if (error.status === 429)
    return 'Too many requests were made. Wait a moment and try again.';
  if (error.status >= 500 || error.status === 0)
    return 'The server could not complete the Power Rankings request. Try again.';
  return 'Review the Power Rankings fields and try again.';
};
