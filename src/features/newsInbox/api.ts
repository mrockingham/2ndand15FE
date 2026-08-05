import type {
  CandidateConversionResult,
  CandidateConvertInput,
  IngestionResult,
  ManualCandidateInput,
  NewsCandidateDetail,
  NewsCandidateListFilters,
  NewsCandidateListItem,
  NewsCandidatePage,
  NewsSource,
  NewsSourceDetail,
  NewsSourceInput,
  NewsSourceListFilters,
  NewsSourcePage,
  NewsSourceUpdateInput,
} from '@/features/newsInbox/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}
interface PageResponse<T> extends DataResponse<readonly T[]> {
  readonly meta: { readonly nextCursor: string | null };
}

const queryString = (values: object, cursor?: string) => {
  const parameters = new URLSearchParams();
  Object.entries({ ...values, cursor }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const query = parameters.toString();
  return query === '' ? '' : `?${query}`;
};

const action = async <T>(client: ApiClient, path: string, body: unknown = {}) =>
  (
    await client.request<DataResponse<T>>(path, {
      authenticated: true,
      method: 'POST',
      body,
    })
  ).data;

export const listNewsSources = async (
  client: ApiClient,
  filters: NewsSourceListFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<NewsSourcePage> => {
  const response = await client.request<PageResponse<NewsSource>>(
    `/admin/news-sources${queryString(filters, cursor)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return { sources: response.data, nextCursor: response.meta.nextCursor };
};

export const getNewsSource = async (
  client: ApiClient,
  sourceId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<NewsSourceDetail>>(
      `/admin/news-sources/${encodeURIComponent(sourceId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const createNewsSource = (client: ApiClient, input: NewsSourceInput) =>
  action<NewsSource>(client, '/admin/news-sources', input);

export const updateNewsSource = async (
  client: ApiClient,
  sourceId: string,
  input: NewsSourceUpdateInput,
) =>
  (
    await client.request<DataResponse<NewsSource>>(
      `/admin/news-sources/${encodeURIComponent(sourceId)}`,
      { authenticated: true, method: 'PATCH', body: input },
    )
  ).data;

export const runNewsSourceAction = (
  client: ApiClient,
  sourceId: string,
  operation: 'pause' | 'resume',
) =>
  action<NewsSource>(
    client,
    `/admin/news-sources/${encodeURIComponent(sourceId)}/${operation}`,
  );

export const runNewsIngestion = (
  client: ApiClient,
  sourceId: string,
  operation: 'test' | 'ingest',
) =>
  action<IngestionResult>(
    client,
    `/admin/news-sources/${encodeURIComponent(sourceId)}/${operation}`,
  );

export const listNewsCandidates = async (
  client: ApiClient,
  filters: NewsCandidateListFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<NewsCandidatePage> => {
  const response = await client.request<PageResponse<NewsCandidateListItem>>(
    `/admin/news-candidates${queryString(filters, cursor)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return { candidates: response.data, nextCursor: response.meta.nextCursor };
};

export const getNewsCandidate = async (
  client: ApiClient,
  candidateId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<NewsCandidateDetail>>(
      `/admin/news-candidates/${encodeURIComponent(candidateId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const createManualCandidate = (
  client: ApiClient,
  input: ManualCandidateInput,
) =>
  action<NewsCandidateDetail>(client, '/admin/news-candidates/manual', input);

export const transitionCandidate = (
  client: ApiClient,
  candidateId: string,
  operation: 'review' | 'save',
) =>
  action<NewsCandidateDetail>(
    client,
    `/admin/news-candidates/${encodeURIComponent(candidateId)}/${operation}`,
  );

export const dismissCandidate = (
  client: ApiClient,
  candidateId: string,
  reason: string,
) =>
  action<NewsCandidateDetail>(
    client,
    `/admin/news-candidates/${encodeURIComponent(candidateId)}/dismiss`,
    { reason },
  );

export const convertCandidate = (
  client: ApiClient,
  candidateId: string,
  input: CandidateConvertInput,
) =>
  action<CandidateConversionResult>(
    client,
    `/admin/news-candidates/${encodeURIComponent(candidateId)}/convert`,
    input,
  );
