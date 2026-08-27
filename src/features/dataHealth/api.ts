import type {
  DataHealthGameDetail,
  DataHealthGameListFilters,
  DataHealthGameListPage,
  DataHealthGameRow,
  DataHealthProbeRecord,
  DataHealthProbeResult,
  DataHealthSummary,
} from '@/features/dataHealth/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

interface GameListResponse {
  readonly data: readonly DataHealthGameRow[];
  readonly summary: DataHealthSummary;
  readonly meta: { readonly nextCursor: string | null };
}

const queryString = (values: object) => {
  const parameters = new URLSearchParams();
  Object.entries(
    values as Readonly<Record<string, string | number | boolean | undefined>>,
  ).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const serialized = parameters.toString();
  return serialized === '' ? '' : `?${serialized}`;
};

export const listDataHealthGames = async (
  client: ApiClient,
  filters: DataHealthGameListFilters,
  signal?: AbortSignal,
): Promise<DataHealthGameListPage> => {
  const response = await client.request<GameListResponse>(
    `/admin/data-health/games${queryString(filters)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return {
    games: response.data,
    summary: response.summary,
    nextCursor: response.meta.nextCursor,
  };
};

export const getDataHealthGame = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
): Promise<DataHealthGameDetail> => {
  const response = await client.request<DataResponse<DataHealthGameDetail>>(
    `/admin/data-health/games/${encodeURIComponent(gameId)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return response.data;
};

export const listDataHealthProbes = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
): Promise<readonly DataHealthProbeRecord[]> => {
  const response = await client.request<
    DataResponse<readonly DataHealthProbeRecord[]>
  >(`/admin/data-health/games/${encodeURIComponent(gameId)}/probes`, {
    authenticated: true,
    method: 'GET',
    signal,
  });
  return response.data;
};

export const runDataHealthProbe = async (
  client: ApiClient,
  gameId: string,
): Promise<DataHealthProbeResult> => {
  const response = await client.request<DataResponse<DataHealthProbeResult>>(
    `/admin/data-health/games/${encodeURIComponent(gameId)}/probe`,
    { authenticated: true, method: 'POST' },
  );
  return response.data;
};
