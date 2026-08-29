import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminAuditKeys } from '@/features/admin/queryKeys';
import {
  createArticle,
  deleteArticle,
  getAdminArticle,
  getArticleRevision,
  getPublicArticle,
  listAdminArticles,
  listArticleRevisions,
  listFeaturedArticles,
  listPublicArticles,
  listTeamArticles,
  replaceArticleTeams,
  scheduleArticle,
  transitionArticle,
  updateArticle,
} from '@/features/articles/api';
import { adminArticleKeys, articleKeys } from '@/features/articles/queryKeys';
import { adminHomepageKeys, homepageKeys } from '@/features/homepage/queryKeys';
import type {
  AdminArticleDetail,
  AdminArticleFilters,
  AdminArticleListItem,
  ArticleCreateInput,
  ArticleLifecycleAction,
  ArticlePage,
  ArticleScheduleInput,
  ArticleTeamsInput,
  ArticleUpdateInput,
  ArticleVersionActionInput,
  PublicArticleFilters,
} from '@/features/articles/types';
import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const publicRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status < 500) && count < 2;

export const usePublicArticlesQuery = (filters: PublicArticleFilters) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: articleKeys.list(filters),
    queryFn: ({ signal }) => listPublicArticles(publicClient, filters, signal),
    staleTime: 60_000,
    retry: publicRetry,
  });
};
export const useFeaturedArticlesQuery = (
  filters: PublicArticleFilters = { limit: 4 },
) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: articleKeys.featured(filters),
    queryFn: ({ signal }) =>
      listFeaturedArticles(publicClient, filters, signal),
    staleTime: 30_000,
    retry: publicRetry,
  });
};
export const useTeamArticlesQuery = (
  teamId: string,
  filters: PublicArticleFilters,
) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: articleKeys.team(teamId, filters),
    queryFn: ({ signal }) =>
      listTeamArticles(publicClient, teamId, filters, signal),
    enabled: teamId !== '',
    staleTime: 60_000,
    retry: publicRetry,
  });
};
export const usePublicArticleQuery = (slug: string) => {
  const { publicClient } = useApiClients();
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: ({ signal }) => getPublicArticle(publicClient, slug, signal),
    enabled: slug !== '',
    staleTime: 5 * 60_000,
    retry: publicRetry,
  });
};
export const useAdminArticlesQuery = (filters: AdminArticleFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminArticleKeys.list(filters),
    queryFn: ({ signal }) =>
      listAdminArticles(authenticatedClient, filters, signal),
    staleTime: 15_000,
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};
export const useAdminArticleQuery = (id: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminArticleKeys.detail(id),
    queryFn: ({ signal }) => getAdminArticle(authenticatedClient, id, signal),
    enabled: id !== '',
    staleTime: 15_000,
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};
export const useArticleRevisionsQuery = (id: string, cursor?: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminArticleKeys.revisions(id, cursor),
    queryFn: ({ signal }) =>
      listArticleRevisions(authenticatedClient, id, cursor, signal),
    enabled: id !== '',
    staleTime: 30_000,
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};
export const useArticleRevisionQuery = (id: string, revisionId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: adminArticleKeys.revision(id, revisionId),
    queryFn: ({ signal }) =>
      getArticleRevision(authenticatedClient, id, revisionId, signal),
    enabled: id !== '' && revisionId !== '',
    retry: publicRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useArticleSuccess = () => {
  const queryClient = useQueryClient();
  return (article: AdminArticleDetail) => {
    queryClient.setQueryData(adminArticleKeys.detail(article.id), article);
    void queryClient.invalidateQueries({ queryKey: adminArticleKeys.lists() });
    void queryClient.invalidateQueries({
      queryKey: adminArticleKeys.revisionLists(article.id),
    });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
    void queryClient.invalidateQueries({ queryKey: articleKeys.all });
  };
};
export const useCreateArticleMutation = () => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ArticleCreateInput) =>
      createArticle(authenticatedClient, input),
    onSuccess: (article) => {
      queryClient.setQueryData(adminArticleKeys.detail(article.id), article);
      void queryClient.invalidateQueries({
        queryKey: adminArticleKeys.lists(),
      });
      void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
    },
  });
};
export const useUpdateArticleMutation = (id: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useArticleSuccess();
  return useMutation({
    mutationFn: (input: ArticleUpdateInput) =>
      updateArticle(authenticatedClient, id, input),
    onSuccess,
  });
};
export const useReplaceArticleTeamsMutation = (id: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useArticleSuccess();
  return useMutation({
    mutationFn: (input: ArticleTeamsInput) =>
      replaceArticleTeams(authenticatedClient, id, input),
    onSuccess,
  });
};
export const useArticleLifecycleMutation = (
  id: string,
  action: ArticleLifecycleAction,
) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const onSuccess = useArticleSuccess();
  return useMutation({
    mutationFn: (input: ArticleVersionActionInput) =>
      transitionArticle(authenticatedClient, id, action, input),
    onSuccess: (article) => {
      onSuccess(article);
      if (action === 'unpublish') {
        queryClient.removeQueries({ queryKey: articleKeys.all });
        void queryClient.invalidateQueries({ queryKey: homepageKeys.all });
        void queryClient.invalidateQueries({
          queryKey: adminHomepageKeys.topStories(),
        });
      }
    },
  });
};

export interface DeleteArticleResult {
  readonly alreadyGone: boolean;
}

export const useDeleteArticleMutation = (id: string, slug: string) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (): Promise<DeleteArticleResult> => {
      try {
        await deleteArticle(authenticatedClient, id);
        return { alreadyGone: false };
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 404) {
          return { alreadyGone: true };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: adminArticleKeys.detail(id),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: adminArticleKeys.revisionLists(id),
      });
      queryClient.removeQueries({
        queryKey: articleKeys.detail(slug),
        exact: true,
      });
      queryClient.setQueriesData<ArticlePage<AdminArticleListItem>>(
        { queryKey: adminArticleKeys.lists() },
        (current) =>
          current
            ? {
                ...current,
                articles: current.articles.filter(
                  (article) => article.id !== id,
                ),
              }
            : current,
      );
      queryClient.removeQueries({ queryKey: articleKeys.all });
      void queryClient.invalidateQueries({
        queryKey: adminArticleKeys.lists(),
      });
      void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
      void queryClient.invalidateQueries({
        queryKey: adminHomepageKeys.topStories(),
      });
      void queryClient.invalidateQueries({ queryKey: homepageKeys.all });
    },
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};
export const useScheduleArticleMutation = (id: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useArticleSuccess();
  return useMutation({
    mutationFn: (input: ArticleScheduleInput) =>
      scheduleArticle(authenticatedClient, id, input),
    onSuccess,
  });
};
