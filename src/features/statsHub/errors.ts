import { ApiError } from '@/services/api/apiClient';

const messages: Readonly<Record<string, string>> = {
  STATS_METRIC_NOT_FOUND: 'That metric is no longer available.',
  STATS_METRIC_NOT_SUPPORTED_FOR_SEASON:
    'That metric is not available for season leaders.',
  STATS_METRIC_NOT_SUPPORTED_FOR_WEEK:
    'That metric is not available for weekly leaders.',
  STATS_METRIC_NOT_SUPPORTED_FOR_RECENT:
    'That metric is not available for recent performances.',
  STATS_SEASON_NOT_AVAILABLE:
    'Historical statistics are not available for that season.',
  STATS_POSITION_NOT_SUPPORTED:
    'That historical position filter is not available.',
  STATS_INVALID_CURSOR:
    'The leaderboard page expired. Reload the ranking from the beginning.',
  PLAYER_NOT_FOUND: 'The selected player was not found.',
  TEAM_NOT_FOUND: 'The selected team was not found.',
};

export const getStatsErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'Historical statistics could not be loaded. Try again.';
  if (error.code && messages[error.code]) return messages[error.code];
  if (error.status === 0)
    return 'The server could not be reached. Check your connection and try again.';
  if (error.status === 429)
    return 'Stats requests are temporarily limited. Wait and try again.';
  if (error.status >= 500)
    return 'The server could not load historical statistics. Try again.';
  return 'The Stats Hub request could not be completed.';
};
