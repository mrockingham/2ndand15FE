import { ApiError } from '@/services/api/apiClient';

export const getAdminErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) return 'Something went wrong. Try again.';
  switch (error.status) {
    case 0:
      return 'The server could not be reached. Check your connection and try again.';
    case 403:
      return 'Your account does not have permission for this action. Your role has been refreshed.';
    case 404:
      return 'The requested schedule record was not found.';
    case 409:
      return error.code === 'PROVIDER_GAME_REQUIRES_OVERRIDE'
        ? 'This provider-managed game cannot be edited directly. Use an editorial override instead.'
        : 'This change conflicts with an existing schedule record. Review the data and try again.';
    case 413:
      return 'The import is too large.';
    case 422:
    case 400:
      return 'Some submitted values are invalid. Review the highlighted details.';
    case 429:
      return 'Too many requests were made. Wait a moment and try again.';
    default:
      return error.status >= 500
        ? 'The server could not complete the request. Try again.'
        : 'The request could not be completed.';
  }
};
