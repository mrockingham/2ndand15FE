import type {
  AddHighlightPlacementInput,
  AdminHeroList,
  AdminHeroSlide,
  AdminHomepageHighlight,
  AdminHomepageHighlightList,
  AdminTopStory,
  CreateHeroSlideInput,
  HighlightCandidateListFilters,
  HighlightCandidatePage,
  HomepageHighlightCandidate,
  HomepageHighlightSettings,
  PublicHomepage,
  ReorderHeroSlidesInput,
  ReorderHighlightPlacementsInput,
  ReorderTopStoriesInput,
  UpdateHeroSlideInput,
  UpdateHighlightSettingsInput,
} from '@/features/homepage/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

const queryString = (values: object, cursor?: string) => {
  const parameters = new URLSearchParams();
  Object.entries({ ...values, cursor }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') parameters.set(key, String(value));
  });
  const query = parameters.toString();
  return query === '' ? '' : `?${query}`;
};

export const getPublicHomepage = async (
  client: ApiClient,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<PublicHomepage>>('/homepage', {
      method: 'GET',
      signal,
    })
  ).data;

export const listAdminHeroSlides = async (
  client: ApiClient,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminHeroList>>('/admin/homepage/hero', {
      authenticated: true,
      method: 'GET',
      signal,
    })
  ).data;

export const getAdminHeroSlide = async (
  client: ApiClient,
  slideId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminHeroSlide>>(
      `/admin/homepage/hero/${encodeURIComponent(slideId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const createHeroSlide = async (
  client: ApiClient,
  input: CreateHeroSlideInput,
) =>
  (
    await client.request<DataResponse<AdminHeroSlide>>('/admin/homepage/hero', {
      authenticated: true,
      method: 'POST',
      body: input,
    })
  ).data;

export const updateHeroSlide = async (
  client: ApiClient,
  slideId: string,
  input: UpdateHeroSlideInput,
) =>
  (
    await client.request<DataResponse<AdminHeroSlide>>(
      `/admin/homepage/hero/${encodeURIComponent(slideId)}`,
      { authenticated: true, method: 'PATCH', body: input },
    )
  ).data;

export const deleteHeroSlide = async (client: ApiClient, slideId: string) =>
  (
    await client.request<DataResponse<AdminHeroList>>(
      `/admin/homepage/hero/${encodeURIComponent(slideId)}`,
      { authenticated: true, method: 'DELETE' },
    )
  ).data;

export const reorderHeroSlides = async (
  client: ApiClient,
  input: ReorderHeroSlidesInput,
) =>
  (
    await client.request<DataResponse<AdminHeroList>>(
      '/admin/homepage/hero/order',
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

export const listAdminTopStories = async (
  client: ApiClient,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<readonly AdminTopStory[]>>(
      '/admin/homepage/top-stories',
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const markTopStory = async (client: ApiClient, articleId: string) =>
  (
    await client.request<DataResponse<AdminTopStory>>(
      `/admin/homepage/top-stories/${encodeURIComponent(articleId)}`,
      { authenticated: true, method: 'PUT' },
    )
  ).data;

export const unmarkTopStory = async (client: ApiClient, articleId: string) =>
  client.request<void>(
    `/admin/homepage/top-stories/${encodeURIComponent(articleId)}`,
    { authenticated: true, method: 'DELETE' },
  );

export const reorderTopStories = async (
  client: ApiClient,
  input: ReorderTopStoriesInput,
) =>
  (
    await client.request<DataResponse<readonly AdminTopStory[]>>(
      '/admin/homepage/top-stories/order',
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

export const listHighlightCandidates = async (
  client: ApiClient,
  filters: HighlightCandidateListFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<HighlightCandidatePage> => {
  const response = await client.request<
    DataResponse<{
      readonly candidates: readonly HomepageHighlightCandidate[];
      readonly nextCursor: string | null;
    }>
  >(`/admin/homepage/highlight-candidates${queryString(filters, cursor)}`, {
    authenticated: true,
    method: 'GET',
    signal,
  });
  return {
    candidates: response.data.candidates,
    nextCursor: response.data.nextCursor,
  };
};

export const listAdminHighlights = async (
  client: ApiClient,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminHomepageHighlightList>>(
      '/admin/homepage/highlights',
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const addHighlightPlacement = async (
  client: ApiClient,
  input: AddHighlightPlacementInput,
) =>
  (
    await client.request<DataResponse<AdminHomepageHighlight>>(
      '/admin/homepage/highlights',
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;

export const reorderHighlightPlacements = async (
  client: ApiClient,
  input: ReorderHighlightPlacementsInput,
) =>
  (
    await client.request<DataResponse<readonly AdminHomepageHighlight[]>>(
      '/admin/homepage/highlights/order',
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

export const updateHighlightSettings = async (
  client: ApiClient,
  input: UpdateHighlightSettingsInput,
) =>
  (
    await client.request<DataResponse<HomepageHighlightSettings>>(
      '/admin/homepage/highlights/settings',
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

export const deleteHighlightPlacement = async (
  client: ApiClient,
  placementId: string,
) =>
  client.request<void>(
    `/admin/homepage/highlights/${encodeURIComponent(placementId)}`,
    { authenticated: true, method: 'DELETE' },
  );
