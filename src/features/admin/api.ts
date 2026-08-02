import type {
  AdminGame,
  AdminGameListFilters,
  AdminGameListPage,
  AuditEvent,
  AuditFilters,
  AuditPage,
  GameOverrideInput,
  ManualGameCreateInput,
  ManualGameUpdateInput,
  ScheduleImportResult,
  ScheduleImportRow,
  VerificationInput,
} from '@/features/admin/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

interface PageResponse<T> extends DataResponse<readonly T[]> {
  readonly meta: { readonly nextCursor: string | null };
}

const queryString = (values: object) => {
  const parameters = new URLSearchParams();
  Object.entries(
    values as Readonly<Record<string, string | number | undefined>>,
  ).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const serialized = parameters.toString();
  return serialized === '' ? '' : `?${serialized}`;
};

export const listAdminGames = async (
  client: ApiClient,
  filters: AdminGameListFilters,
  signal?: AbortSignal,
): Promise<AdminGameListPage> => {
  const response = await client.request<PageResponse<AdminGame>>(
    `/admin/games${queryString(filters)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return { games: response.data, nextCursor: response.meta.nextCursor };
};

export const getAdminGame = async (
  client: ApiClient,
  gameId: string,
  signal?: AbortSignal,
) => {
  const response = await client.request<DataResponse<AdminGame>>(
    `/admin/games/${encodeURIComponent(gameId)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return response.data;
};

export const createAdminGame = async (
  client: ApiClient,
  input: ManualGameCreateInput,
) => {
  const response = await client.request<DataResponse<AdminGame>>(
    '/admin/games',
    {
      authenticated: true,
      body: input,
      method: 'POST',
    },
  );
  return response.data;
};

export const updateAdminGame = async (
  client: ApiClient,
  gameId: string,
  input: ManualGameUpdateInput,
) => {
  const response = await client.request<DataResponse<AdminGame>>(
    `/admin/games/${encodeURIComponent(gameId)}`,
    { authenticated: true, body: input, method: 'PATCH' },
  );
  return response.data;
};

export const upsertGameOverride = async (
  client: ApiClient,
  gameId: string,
  input: GameOverrideInput,
) => {
  const response = await client.request<DataResponse<AdminGame>>(
    `/admin/games/${encodeURIComponent(gameId)}/override`,
    { authenticated: true, body: input, method: 'PUT' },
  );
  return response.data;
};

export const deleteGameOverride = async (client: ApiClient, gameId: string) => {
  const response = await client.request<DataResponse<AdminGame>>(
    `/admin/games/${encodeURIComponent(gameId)}/override`,
    { authenticated: true, method: 'DELETE' },
  );
  return response.data;
};

export const verifyAdminGame = async (
  client: ApiClient,
  gameId: string,
  input: VerificationInput,
) => {
  const response = await client.request<DataResponse<AdminGame>>(
    `/admin/games/${encodeURIComponent(gameId)}/verification`,
    { authenticated: true, body: input, method: 'PUT' },
  );
  return response.data;
};

const submitImport = async (
  client: ApiClient,
  rows: readonly ScheduleImportRow[],
  dryRun: boolean,
) => {
  const path = dryRun
    ? '/admin/schedule-imports/validate'
    : '/admin/schedule-imports';
  const response = await client.request<DataResponse<ScheduleImportResult>>(
    path,
    {
      authenticated: true,
      body: { rows, dryRun },
      method: 'POST',
    },
  );
  return response.data;
};

export const validateScheduleImport = (
  client: ApiClient,
  rows: readonly ScheduleImportRow[],
) => submitImport(client, rows, true);

export const writeScheduleImport = (
  client: ApiClient,
  rows: readonly ScheduleImportRow[],
) => submitImport(client, rows, false);

export const listAuditEvents = async (
  client: ApiClient,
  filters: AuditFilters,
  signal?: AbortSignal,
): Promise<AuditPage> => {
  const response = await client.request<PageResponse<AuditEvent>>(
    `/admin/audit-events${queryString(filters)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return { events: response.data, nextCursor: response.meta.nextCursor };
};
