import {
  EMPTY_GAME_PLAYER_STATS,
  type Game,
  type GameHighlightsResult,
  type GameListFilters,
  type GameListPage,
  type GamePlayerStatsByCategory,
  type GamePlaysResult,
  type GameStatsResult,
  type GameTeamStats,
} from '@/features/games/types';
import { ApiError, type ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

interface PageResponse<T> extends DataResponse<readonly T[]> {
  readonly meta: { readonly nextCursor: string | null };
}

const toQueryString = (filters: GameListFilters, cursor?: string) => {
  const parameters = new URLSearchParams();
  const values = { ...filters, cursor };
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') {
      parameters.set(key, String(value));
    }
  }
  const query = parameters.toString();
  return query === '' ? '' : `?${query}`;
};

const readPage = (response: PageResponse<Game>): GameListPage => ({
  games: response.data,
  nextCursor: response.meta.nextCursor,
});

export const listGames = async (
  client: ApiClient,
  filters: GameListFilters,
  signal?: AbortSignal,
  cursor?: string,
) =>
  readPage(
    await client.request<PageResponse<Game>>(
      `/games${toQueryString(filters, cursor)}`,
      { method: 'GET', signal },
    ),
  );

export const listTeamGames = async (
  client: ApiClient,
  teamId: string,
  filters: Omit<GameListFilters, 'teamId'>,
  signal?: AbortSignal,
  cursor?: string,
) =>
  readPage(
    await client.request<PageResponse<Game>>(
      `/teams/${encodeURIComponent(teamId)}/games${toQueryString(filters, cursor)}`,
      { method: 'GET', signal },
    ),
  );

export const getGame = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
) => {
  const response = await client.request<DataResponse<Game>>(
    `/games/${encodeURIComponent(gameId)}`,
    { method: 'GET', signal },
  );
  return response.data;
};

interface GamePlaysResponse {
  readonly data: {
    readonly gameId: string;
    readonly playCount: number;
    readonly plays: GamePlaysResult['plays'];
  };
  readonly meta: { readonly limitations: readonly string[] };
}

export const getGamePlays = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
): Promise<GamePlaysResult> => {
  const response = await client.request<GamePlaysResponse>(
    `/games/${encodeURIComponent(gameId)}/plays`,
    { method: 'GET', signal },
  );
  return {
    gameId: response.data.gameId,
    playCount: response.data.playCount,
    plays: response.data.plays,
    limitations: response.meta.limitations,
  };
};

interface GameStatsResponse {
  readonly data: {
    readonly gameId: string;
    readonly teamStats: {
      readonly home: GameTeamStats;
      readonly away: GameTeamStats;
    };
    readonly playerStats: {
      readonly home: GamePlayerStatsByCategory;
      readonly away: GamePlayerStatsByCategory;
    };
  };
  readonly meta: {
    readonly playerStatsAvailable: boolean;
    readonly playerStatsCoverage: unknown;
    readonly limitations: readonly string[];
  };
}

export const getGameStats = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
): Promise<GameStatsResult> => {
  try {
    const response = await client.request<GameStatsResponse>(
      `/games/${encodeURIComponent(gameId)}/stats`,
      { method: 'GET', signal },
    );
    return {
      gameId: response.data.gameId,
      coverage: 'AVAILABLE',
      teamStats: response.data.teamStats,
      playerStatsAvailable: response.meta.playerStatsAvailable,
      playerStats: response.data.playerStats,
      limitations: response.meta.limitations,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        gameId,
        coverage: 'UNAVAILABLE',
        teamStats: { home: null, away: null },
        playerStatsAvailable: false,
        playerStats: {
          home: EMPTY_GAME_PLAYER_STATS,
          away: EMPTY_GAME_PLAYER_STATS,
        },
        limitations: [],
      };
    }
    throw error;
  }
};

export const getGameHighlights = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
): Promise<GameHighlightsResult> => {
  const response = await client.request<DataResponse<GameHighlightsResult>>(
    `/games/${encodeURIComponent(gameId)}/highlights`,
    { method: 'GET', signal },
  );
  return response.data;
};
