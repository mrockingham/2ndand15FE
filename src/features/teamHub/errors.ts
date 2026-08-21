import { ApiError } from '@/services/api/apiClient';

const messages: Readonly<Record<string, string>> = {
  TEAM_ROSTER_SEASON_NOT_AVAILABLE:
    'Historical roster data is unavailable for that season.',
  TEAM_ROSTER_POSITION_NOT_SUPPORTED:
    'That historical roster position filter is unavailable.',
  TEAM_ROSTER_INVALID_CURSOR:
    'The roster page expired. Reload the roster from the beginning.',
  TEAM_ROSTER_QUERY_TOO_BROAD:
    'This historical roster request is too broad. Add a filter and try again.',
  STATS_INVALID_CURSOR:
    'The leaders page expired. Reload the ranking from the beginning.',
  STATS_SEASON_NOT_AVAILABLE:
    'Historical statistics are unavailable for that season.',
  STATS_POSITION_NOT_SUPPORTED:
    'That historical stats position filter is unavailable.',
  STATS_METRIC_NOT_FOUND: 'That historical leader metric is unavailable.',
  STATS_METRIC_NOT_SUPPORTED_FOR_SEASON:
    'That metric is unavailable for team season leaders.',
};

export const getTeamHubErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'Team data could not be loaded. Try again.';
  if (error.code && messages[error.code]) return messages[error.code];
  if (error.status === 0)
    return 'The server could not be reached. Check your connection and try again.';
  if (error.status === 429)
    return 'Team requests are temporarily limited. Wait and try again.';
  if (error.status >= 500)
    return 'The server could not load team data. Try again.';
  return 'The team request could not be completed.';
};
