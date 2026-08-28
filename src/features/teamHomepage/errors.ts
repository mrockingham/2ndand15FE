import { ApiError } from '@/services/api/apiClient';

export const getTeamHomepageErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'The Team Homepage request could not be completed.';
  if (error.status === 403)
    return 'Your account does not have permission for this Team Homepage action.';
  if (error.status === 404)
    return 'That team or content item is no longer available. Reload and try again.';
  if (error.status === 409) {
    if (error.code?.includes('DUPLICATE'))
      return 'That item is already selected for this team.';
    if (error.code?.includes('LIMIT'))
      return 'This team has reached the configured content limit.';
    if (error.code?.includes('REORDER'))
      return 'The content changed while it was being reordered. Reload and try again.';
    return 'The Team Homepage state conflicts with this action. Reload and try again.';
  }
  if (error.status === 400)
    return 'Review the image URL and numeric values, then try again.';
  if (error.status >= 500 || error.status === 0)
    return 'The server could not complete the Team Homepage request. Try again.';
  return error.message;
};
