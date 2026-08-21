import type { PlayerAttribution } from '@/features/players/types';
import type { SeasonLeader, StatsMetric } from '@/features/statsHub/types';
import type {
  TeamHubOverview,
  TeamHubResult,
  TeamLeaderFilters,
  TeamLeaderPage,
  TeamRosterFilters,
  TeamRosterPage,
  TeamRosterRow,
} from '@/features/teamHub/types';
import type { Team } from '@/features/teams/types';
import type { ApiClient } from '@/services/api/apiClient';

interface OverviewResponse {
  readonly data: TeamHubOverview;
  readonly meta: { readonly attribution: PlayerAttribution };
}

interface RosterResponse {
  readonly data: {
    readonly team: Team;
    readonly season: number;
    readonly roster: readonly TeamRosterRow[];
  };
  readonly meta: Pick<
    TeamRosterPage,
    'nextCursor' | 'semantics' | 'attribution'
  >;
}

interface TeamLeadersResponse {
  readonly data: readonly SeasonLeader[];
  readonly meta: {
    readonly nextCursor: string | null;
    readonly metric: StatsMetric;
    readonly attribution: PlayerAttribution;
  };
}

const queryString = (filters: object, cursor?: string) => {
  const parameters = new URLSearchParams();
  Object.entries({ ...filters, cursor }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  return `?${parameters.toString()}`;
};

export const getTeamHub = async (
  client: ApiClient,
  teamId: string,
  signal?: AbortSignal,
): Promise<TeamHubResult> => {
  const response = await client.request<OverviewResponse>(
    `/teams/${encodeURIComponent(teamId)}/hub`,
    { method: 'GET', signal },
  );
  return { overview: response.data, attribution: response.meta.attribution };
};

export const getTeamRoster = async (
  client: ApiClient,
  teamId: string,
  filters: TeamRosterFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<TeamRosterPage> => {
  const response = await client.request<RosterResponse>(
    `/teams/${encodeURIComponent(teamId)}/roster${queryString(filters, cursor)}`,
    { method: 'GET', signal },
  );
  return { ...response.data, ...response.meta };
};

export const getTeamStatLeaders = async (
  client: ApiClient,
  teamId: string,
  filters: TeamLeaderFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<TeamLeaderPage> => {
  const response = await client.request<TeamLeadersResponse>(
    `/teams/${encodeURIComponent(teamId)}/stat-leaders${queryString(filters, cursor)}`,
    { method: 'GET', signal },
  );
  return {
    rows: response.data,
    nextCursor: response.meta.nextCursor,
    metric: response.meta.metric,
    attribution: response.meta.attribution,
  };
};
