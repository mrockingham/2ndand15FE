import type {
  AdminHeroList,
  AdminHeroSlide,
  AdminTopStory,
  CreateHeroSlideInput,
  PublicHomepage,
  ReorderHeroSlidesInput,
  ReorderTopStoriesInput,
  UpdateHeroSlideInput,
} from '@/features/homepage/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

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
