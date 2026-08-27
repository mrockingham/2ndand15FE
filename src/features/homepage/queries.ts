import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createHeroSlide,
  deleteHeroSlide,
  getAdminHeroSlide,
  getPublicHomepage,
  listAdminHeroSlides,
  listAdminTopStories,
  markTopStory,
  reorderHeroSlides,
  reorderTopStories,
  unmarkTopStory,
  updateHeroSlide,
} from '@/features/homepage/api';
import { adminHomepageKeys, homepageKeys } from '@/features/homepage/queryKeys';
import type {
  CreateHeroSlideInput,
  ReorderHeroSlidesInput,
  ReorderTopStoriesInput,
  UpdateHeroSlideInput,
} from '@/features/homepage/types';
import { articleKeys } from '@/features/articles/queryKeys';
import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const publicRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status < 500) && count < 2;

export const useHomepageQuery = () => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: homepageKeys.all,
    queryFn: ({ signal }) => getPublicHomepage(publicClient, signal),
    staleTime: 60_000,
    // No retry: `/homepage` failing just falls back to the static Hero and
    // hides the other CMS sections (see PublicHomeContent), so failing fast
    // keeps that fallback snappy rather than stalling behind a skeleton.
    retry: false,
  });
};

export const useAdminHeroSlidesQuery = () => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminHomepageKeys.hero(),
    queryFn: ({ signal }) => listAdminHeroSlides(authenticatedClient, signal),
    staleTime: 15_000,
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useAdminHeroSlideQuery = (slideId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminHomepageKeys.heroDetail(slideId),
    queryFn: ({ signal }) =>
      getAdminHeroSlide(authenticatedClient, slideId, signal),
    enabled: slideId !== '',
    staleTime: 15_000,
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useInvalidateHomepage = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminHomepageKeys.all });
    void queryClient.invalidateQueries({ queryKey: homepageKeys.all });
  };
};

export const useCreateHeroSlideMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateHomepage();
  return useMutation({
    mutationFn: (input: CreateHeroSlideInput) =>
      createHeroSlide(authenticatedClient, input),
    onSuccess: invalidate,
  });
};

export const useUpdateHeroSlideMutation = (slideId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateHomepage();
  return useMutation({
    mutationFn: (input: UpdateHeroSlideInput) =>
      updateHeroSlide(authenticatedClient, slideId, input),
    onSuccess: invalidate,
  });
};

export const useDeleteHeroSlideMutation = (slideId: string) => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateHomepage();
  return useMutation({
    mutationFn: () => deleteHeroSlide(authenticatedClient, slideId),
    onSuccess: invalidate,
  });
};

export const useReorderHeroSlidesMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateHomepage();
  return useMutation({
    mutationFn: (input: ReorderHeroSlidesInput) =>
      reorderHeroSlides(authenticatedClient, input),
    onSuccess: invalidate,
  });
};

export const useAdminTopStoriesQuery = () => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminHomepageKeys.topStories(),
    queryFn: ({ signal }) => listAdminTopStories(authenticatedClient, signal),
    staleTime: 15_000,
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useInvalidateTopStories = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: adminHomepageKeys.topStories(),
    });
    void queryClient.invalidateQueries({ queryKey: homepageKeys.all });
    void queryClient.invalidateQueries({ queryKey: articleKeys.all });
  };
};

export const useMarkTopStoryMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTopStories();
  return useMutation({
    mutationFn: (articleId: string) =>
      markTopStory(authenticatedClient, articleId),
    onSuccess: invalidate,
  });
};

export const useUnmarkTopStoryMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTopStories();
  return useMutation({
    mutationFn: (articleId: string) =>
      unmarkTopStory(authenticatedClient, articleId),
    onSuccess: invalidate,
  });
};

export const useReorderTopStoriesMutation = () => {
  const { authenticatedClient } = useApiClients();
  const invalidate = useInvalidateTopStories();
  return useMutation({
    mutationFn: (input: ReorderTopStoriesInput) =>
      reorderTopStories(authenticatedClient, input),
    onSuccess: invalidate,
  });
};
