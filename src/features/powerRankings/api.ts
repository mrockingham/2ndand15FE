import type {
  AdminPowerRankingEdition,
  AdminPowerRankingEditionDetail,
  CreatePowerRankingEditionInput,
  PowerRankingEditionSummary,
  PowerRankingImportInput,
  PowerRankingImportResult,
  PowerRankingsData,
  PowerRankingsFilters,
  ReorderPowerRankingEntriesInput,
  UpdatePowerRankingEditionInput,
  UpdatePowerRankingEntryInput,
} from '@/features/powerRankings/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

const queryString = (values: Record<string, string | number | undefined>) => {
  const parameters = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const query = parameters.toString();
  return query === '' ? '' : `?${query}`;
};

export const getPowerRankings = async (
  client: ApiClient,
  filters: PowerRankingsFilters,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<PowerRankingsData>>(
      `/power-rankings${queryString({ ...filters })}`,
      { method: 'GET', signal },
    )
  ).data;

export const getPowerRankingEditions = async (
  client: ApiClient,
  season: number | undefined,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<readonly PowerRankingEditionSummary[]>>(
      `/power-rankings/editions${queryString({ season })}`,
      { method: 'GET', signal },
    )
  ).data;

export const listAdminPowerRankingEditions = async (
  client: ApiClient,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<readonly AdminPowerRankingEdition[]>>(
      '/admin/power-rankings',
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const getAdminPowerRankingEdition = async (
  client: ApiClient,
  editionId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEditionDetail>>(
      `/admin/power-rankings/${encodeURIComponent(editionId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const createPowerRankingEdition = async (
  client: ApiClient,
  input: CreatePowerRankingEditionInput,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEditionDetail>>(
      '/admin/power-rankings',
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;

export const updatePowerRankingEdition = async (
  client: ApiClient,
  editionId: string,
  input: UpdatePowerRankingEditionInput,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEditionDetail>>(
      `/admin/power-rankings/${encodeURIComponent(editionId)}`,
      { authenticated: true, method: 'PATCH', body: input },
    )
  ).data;

export const updatePowerRankingEntry = async (
  client: ApiClient,
  editionId: string,
  entryId: string,
  input: UpdatePowerRankingEntryInput,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEditionDetail>>(
      `/admin/power-rankings/${encodeURIComponent(editionId)}/entries/${encodeURIComponent(entryId)}`,
      { authenticated: true, method: 'PATCH', body: input },
    )
  ).data;

export const reorderPowerRankingEntries = async (
  client: ApiClient,
  editionId: string,
  input: ReorderPowerRankingEntriesInput,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEditionDetail>>(
      `/admin/power-rankings/${encodeURIComponent(editionId)}/entries/reorder`,
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;

export const publishPowerRankingEdition = async (
  client: ApiClient,
  editionId: string,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEdition>>(
      `/admin/power-rankings/${encodeURIComponent(editionId)}/publish`,
      { authenticated: true, method: 'POST' },
    )
  ).data;

export const unpublishPowerRankingEdition = async (
  client: ApiClient,
  editionId: string,
) =>
  (
    await client.request<DataResponse<AdminPowerRankingEdition>>(
      `/admin/power-rankings/${encodeURIComponent(editionId)}/unpublish`,
      { authenticated: true, method: 'POST' },
    )
  ).data;

export const importPowerRankings = async (
  client: ApiClient,
  input: PowerRankingImportInput,
) =>
  (
    await client.request<DataResponse<PowerRankingImportResult>>(
      '/admin/power-rankings/import',
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;
