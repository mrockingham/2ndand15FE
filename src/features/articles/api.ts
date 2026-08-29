import type {
  AdminArticleDetail,
  AdminArticleFilters,
  AdminArticleListItem,
  ArticleCreateInput,
  ArticleLifecycleAction,
  ArticlePage,
  ArticleRevision,
  ArticleScheduleInput,
  ArticleTeamsInput,
  ArticleUpdateInput,
  ArticleVersionActionInput,
  PublicArticleDetail,
  PublicArticleFilters,
  PublicArticleListItem,
  RevisionPage,
} from '@/features/articles/types';
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
    values as Record<string, string | number | boolean | undefined>,
  ).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const query = parameters.toString();
  return query ? `?${query}` : '';
};
const page = <T>(response: PageResponse<T>, key: 'articles' | 'revisions') =>
  ({ [key]: response.data, nextCursor: response.meta.nextCursor }) as unknown;

export const listPublicArticles = async (
  client: ApiClient,
  filters: PublicArticleFilters,
  signal?: AbortSignal,
): Promise<ArticlePage<PublicArticleListItem>> => {
  const response = await client.request<PageResponse<PublicArticleListItem>>(
    `/articles${queryString(filters)}`,
    { method: 'GET', signal },
  );
  return page(response, 'articles') as ArticlePage<PublicArticleListItem>;
};
export const listFeaturedArticles = async (
  client: ApiClient,
  filters: PublicArticleFilters,
  signal?: AbortSignal,
): Promise<ArticlePage<PublicArticleListItem>> => {
  const response = await client.request<PageResponse<PublicArticleListItem>>(
    `/articles/featured${queryString(filters)}`,
    { method: 'GET', signal },
  );
  return page(response, 'articles') as ArticlePage<PublicArticleListItem>;
};
export const listTeamArticles = async (
  client: ApiClient,
  teamId: string,
  filters: PublicArticleFilters,
  signal?: AbortSignal,
): Promise<ArticlePage<PublicArticleListItem>> => {
  const response = await client.request<PageResponse<PublicArticleListItem>>(
    `/teams/${encodeURIComponent(teamId)}/articles${queryString(filters)}`,
    { method: 'GET', signal },
  );
  return page(response, 'articles') as ArticlePage<PublicArticleListItem>;
};
export const getPublicArticle = async (
  client: ApiClient,
  slug: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<PublicArticleDetail>>(
      `/articles/${encodeURIComponent(slug)}`,
      { method: 'GET', signal },
    )
  ).data;
export const listAdminArticles = async (
  client: ApiClient,
  filters: AdminArticleFilters,
  signal?: AbortSignal,
): Promise<ArticlePage<AdminArticleListItem>> => {
  const response = await client.request<PageResponse<AdminArticleListItem>>(
    `/admin/articles${queryString(filters)}`,
    { authenticated: true, method: 'GET', signal },
  );
  return page(response, 'articles') as ArticlePage<AdminArticleListItem>;
};
export const getAdminArticle = async (
  client: ApiClient,
  id: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminArticleDetail>>(
      `/admin/articles/${encodeURIComponent(id)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;
export const createArticle = async (
  client: ApiClient,
  input: ArticleCreateInput,
) =>
  (
    await client.request<DataResponse<AdminArticleDetail>>('/admin/articles', {
      authenticated: true,
      method: 'POST',
      body: input,
    })
  ).data;
export const updateArticle = async (
  client: ApiClient,
  id: string,
  input: ArticleUpdateInput,
) =>
  (
    await client.request<DataResponse<AdminArticleDetail>>(
      `/admin/articles/${encodeURIComponent(id)}`,
      { authenticated: true, method: 'PATCH', body: input },
    )
  ).data;

export const deleteArticle = async (client: ApiClient, id: string) =>
  client.request<void>(`/admin/articles/${encodeURIComponent(id)}`, {
    authenticated: true,
    method: 'DELETE',
  });
export const replaceArticleTeams = async (
  client: ApiClient,
  id: string,
  input: ArticleTeamsInput,
) =>
  (
    await client.request<DataResponse<AdminArticleDetail>>(
      `/admin/articles/${encodeURIComponent(id)}/teams`,
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;
export const transitionArticle = async (
  client: ApiClient,
  id: string,
  action: ArticleLifecycleAction,
  input: ArticleVersionActionInput,
) =>
  (
    await client.request<DataResponse<AdminArticleDetail>>(
      `/admin/articles/${encodeURIComponent(id)}/${action}`,
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;
export const scheduleArticle = async (
  client: ApiClient,
  id: string,
  input: ArticleScheduleInput,
) =>
  (
    await client.request<DataResponse<AdminArticleDetail>>(
      `/admin/articles/${encodeURIComponent(id)}/schedule`,
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;
export const listArticleRevisions = async (
  client: ApiClient,
  id: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<RevisionPage> => {
  const response = await client.request<PageResponse<ArticleRevision>>(
    `/admin/articles/${encodeURIComponent(id)}/revisions${queryString({ limit: 25, cursor })}`,
    { authenticated: true, method: 'GET', signal },
  );
  return page(response, 'revisions') as RevisionPage;
};
export const getArticleRevision = async (
  client: ApiClient,
  id: string,
  revisionId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<ArticleRevision>>(
      `/admin/articles/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revisionId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;
