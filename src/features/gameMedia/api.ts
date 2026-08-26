import type {
  AdminGameMediaDetail,
  AdminGameMediaListFilters,
  AdminGameMediaListItem,
  AdminGameMediaListPage,
  CuratedVideo,
  CuratedVideoInput,
  CuratedVideoUpdateInput,
  GameMediaResult,
  ReorderVideosInput,
} from '@/features/gameMedia/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}
// Confirmed against the real backend: the admin games list is not paginated
// -- it returns { data: [...] } with no meta/nextCursor envelope at all.
interface ListResponse<T> extends DataResponse<readonly T[]> {
  readonly meta?: { readonly nextCursor?: string | null };
}

const queryString = (values: object) => {
  const parameters = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const query = parameters.toString();
  return query === '' ? '' : `?${query}`;
};

export const listAdminGameMedia = async (
  client: ApiClient,
  filters: AdminGameMediaListFilters,
  signal?: AbortSignal,
): Promise<AdminGameMediaListPage> => {
  const response = await client.request<ListResponse<AdminGameMediaListItem>>(
    `/admin/game-media/games${queryString(filters)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return {
    games: response.data,
    nextCursor: response.meta?.nextCursor ?? null,
  };
};

export const getAdminGameMediaDetail = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminGameMediaDetail>>(
      `/admin/game-media/games/${encodeURIComponent(gameId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const createCuratedVideo = async (
  client: ApiClient,
  gameId: string,
  input: CuratedVideoInput,
) =>
  (
    await client.request<DataResponse<CuratedVideo>>(
      `/admin/game-media/games/${encodeURIComponent(gameId)}/videos`,
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;

export const updateCuratedVideo = async (
  client: ApiClient,
  videoId: string,
  input: CuratedVideoUpdateInput,
) =>
  (
    await client.request<DataResponse<CuratedVideo>>(
      `/admin/game-media/videos/${encodeURIComponent(videoId)}`,
      { authenticated: true, method: 'PATCH', body: input },
    )
  ).data;

export const reorderCuratedVideos = async (
  client: ApiClient,
  gameId: string,
  input: ReorderVideosInput,
) =>
  (
    await client.request<DataResponse<AdminGameMediaDetail>>(
      `/admin/game-media/games/${encodeURIComponent(gameId)}/videos/order`,
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

export const deleteCuratedVideo = (client: ApiClient, videoId: string) =>
  client.request<void>(
    `/admin/game-media/videos/${encodeURIComponent(videoId)}`,
    { authenticated: true, method: 'DELETE' },
  );

export const getGameMedia = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
): Promise<GameMediaResult> => {
  const response = await client.request<DataResponse<GameMediaResult>>(
    `/games/${encodeURIComponent(gameId)}/media`,
    { method: 'GET', signal },
  );
  return response.data;
};
