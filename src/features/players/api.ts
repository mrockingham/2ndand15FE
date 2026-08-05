import type {
  Player,
  PlayerAttribution,
  PlayerDetailResult,
  PlayerGameStat,
  PlayerListFilters,
  PlayerPage,
  PlayerSeasonStat,
  PlayerSeasonsResult,
  PlayerStatsFilters,
  PlayerStatsPage,
} from '@/features/players/types';
import type { ApiClient } from '@/services/api/apiClient';

interface PageResponse<T> {
  readonly data: readonly T[];
  readonly meta: {
    readonly nextCursor: string | null;
    readonly attribution: PlayerAttribution;
  };
}

interface DetailResponse<T> {
  readonly data: T;
  readonly meta: { readonly attribution: PlayerAttribution };
}

const queryString = (filters: object, cursor?: string) => {
  const parameters = new URLSearchParams();
  Object.entries({ ...filters, cursor }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const query = parameters.toString();
  return query ? `?${query}` : '';
};

export const listPlayers = async (
  client: ApiClient,
  filters: PlayerListFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<PlayerPage> => {
  const response = await client.request<PageResponse<Player>>(
    `/players${queryString(filters, cursor)}`,
    { method: 'GET', signal },
  );
  return {
    players: response.data,
    nextCursor: response.meta.nextCursor,
    attribution: response.meta.attribution,
  };
};

export const getPlayer = async (
  client: ApiClient,
  playerId: string,
  signal?: AbortSignal,
): Promise<PlayerDetailResult> => {
  const response = await client.request<DetailResponse<Player>>(
    `/players/${encodeURIComponent(playerId)}`,
    { method: 'GET', signal },
  );
  return { player: response.data, attribution: response.meta.attribution };
};

export const listPlayerStats = async (
  client: ApiClient,
  playerId: string,
  filters: PlayerStatsFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<PlayerStatsPage> => {
  const response = await client.request<PageResponse<PlayerGameStat>>(
    `/players/${encodeURIComponent(playerId)}/stats${queryString(filters, cursor)}`,
    { method: 'GET', signal },
  );
  return {
    stats: response.data,
    nextCursor: response.meta.nextCursor,
    attribution: response.meta.attribution,
  };
};

export const listPlayerSeasons = async (
  client: ApiClient,
  playerId: string,
  signal?: AbortSignal,
): Promise<PlayerSeasonsResult> => {
  const response = await client.request<
    DetailResponse<readonly PlayerSeasonStat[]>
  >(`/players/${encodeURIComponent(playerId)}/seasons`, {
    method: 'GET',
    signal,
  });
  return { seasons: response.data, attribution: response.meta.attribution };
};
