import { ApiError } from '@/services/api/apiClient';

export const getPlayerErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'Player data could not be loaded. Try again.';
  if (error.status === 0)
    return 'The server could not be reached. Check your connection and try again.';
  if (error.status === 404) return 'The requested player was not found.';
  if (error.status === 429)
    return 'Player data is temporarily rate limited. Wait and try again.';
  if (error.status === 400)
    return 'The player request contains an invalid filter.';
  return error.status >= 500
    ? 'The server could not load player data. Try again.'
    : 'Player data could not be loaded.';
};
