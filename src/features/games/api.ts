import type {
  Game,
  GameListFilters,
  GameListPage,
} from '@/features/games/types';
import type { ApiClient } from '@/services/api/apiClient';

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
