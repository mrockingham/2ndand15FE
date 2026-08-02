import { ApiError } from '@/services/api/apiClient';

export const getFavoriteTeamErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return 'We couldnâ€™t update your favorite team. Please try again.';
  }

  switch (error.code) {
    case 'TEAM_NOT_FOUND':
      return 'That team is no longer available. Refresh the team list and choose another.';
    case 'TEAM_INACTIVE':
      return 'That team is currently inactive and cannot be selected.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many updates were attempted. Please wait and try again.';
    case 'NETWORK_ERROR':
      return 'We couldnâ€™t reach the server. Check your connection and try again.';
    default:
      return 'We couldnâ€™t update your favorite team. Please try again.';
  }
};
