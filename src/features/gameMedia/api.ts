import type {
  AdminGameMediaDetail,
  AdminGameMediaListFilters,
  AdminGameMediaListItem,
  AdminGameMediaListPage,
  CuratedVideo,
  CuratedVideoInput,
  CuratedVideoUpdateInput,
  GameMediaResult,
  GlobalVideo,
  GlobalVideoInput,
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

// Live-verified: GET returns { data: null } (200) when no global video is
// configured, never a 404.
export const getGlobalVideo = async (client: ApiClient, signal?: AbortSignal) =>
  (
    await client.request<DataResponse<GlobalVideo | null>>(
      '/admin/game-media/global-video',
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

// PUT is a live-verified upsert -- same body/response shape creates or
// replaces the single global video record (confirmed: same `id` returned
// across repeated PUTs, only `updatedAt` changes).
export const putGlobalVideo = async (
  client: ApiClient,
  input: GlobalVideoInput,
) =>
  (
    await client.request<DataResponse<GlobalVideo>>(
      '/admin/game-media/global-video',
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

// Live-verified: returns the deleted record in { data }, not void/204.
export const deleteGlobalVideo = async (client: ApiClient) =>
  (
    await client.request<DataResponse<GlobalVideo>>(
      '/admin/game-media/global-video',
      { authenticated: true, method: 'DELETE' },
    )
  ).data;

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
