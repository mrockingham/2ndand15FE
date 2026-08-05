import type { ApiClient } from '@/services/api/apiClient';
import type {
  LeaderboardFilters,
  LeaderboardPage,
  RecentPerformanceFilters,
  RecentPerformanceResult,
  SeasonLeader,
  StatsMetadata,
  StatsMetadataResult,
  StatsMetric,
  WeeklyLeader,
} from '@/features/statsHub/types';
import type { PlayerAttribution } from '@/features/players/types';

interface MetadataResponse {
  readonly data: StatsMetadata;
  readonly meta: { readonly attribution: PlayerAttribution };
}

interface LeaderboardResponse<Row> {
  readonly data: readonly Row[];
  readonly meta: {
    readonly nextCursor: string | null;
    readonly metric: StatsMetric;
    readonly attribution: PlayerAttribution;
  };
}

interface RecentResponse {
  readonly data: Pick<
    RecentPerformanceResult,
    'player' | 'performances' | 'summary'
  >;
  readonly meta: Pick<RecentPerformanceResult, 'metric' | 'attribution'>;
}

const queryString = (filters: object, cursor?: string) => {
  const parameters = new URLSearchParams();
  Object.entries({ ...filters, cursor }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  return `?${parameters.toString()}`;
};

export const getStatsMetadata = async (
  client: ApiClient,
  signal?: AbortSignal,
): Promise<StatsMetadataResult> => {
  const response = await client.request<MetadataResponse>('/stats/metadata', {
    method: 'GET',
    signal,
  });
  return { metadata: response.data, attribution: response.meta.attribution };
};

const leaderboardResult = <Row>(
  response: LeaderboardResponse<Row>,
): LeaderboardPage<Row> => ({
  rows: response.data,
  nextCursor: response.meta.nextCursor,
  metric: response.meta.metric,
  attribution: response.meta.attribution,
});

export const getSeasonLeaders = async (
  client: ApiClient,
  filters: LeaderboardFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<LeaderboardPage<SeasonLeader>> => {
  const seasonFilters = {
    season: filters.season,
    seasonType: filters.seasonType,
    metric: filters.metric,
    position: filters.position,
    positionGroup: filters.positionGroup,
    teamId: filters.teamId,
    limit: filters.limit,
  };
  const response = await client.request<LeaderboardResponse<SeasonLeader>>(
    `/stats/leaders${queryString(seasonFilters, cursor)}`,
    { method: 'GET', signal },
  );
  return leaderboardResult(response);
};

export const getWeeklyLeaders = async (
  client: ApiClient,
  filters: LeaderboardFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<LeaderboardPage<WeeklyLeader>> => {
  const response = await client.request<LeaderboardResponse<WeeklyLeader>>(
    `/stats/weekly-leaders${queryString(filters, cursor)}`,
    { method: 'GET', signal },
  );
  return leaderboardResult(response);
};

export const getRecentPerformance = async (
  client: ApiClient,
  filters: RecentPerformanceFilters,
  signal?: AbortSignal,
): Promise<RecentPerformanceResult> => {
  const response = await client.request<RecentResponse>(
    `/stats/recent${queryString(filters)}`,
    { method: 'GET', signal },
  );
  return { ...response.data, ...response.meta };
};
