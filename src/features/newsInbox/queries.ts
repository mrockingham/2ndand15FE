import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { adminAuditKeys } from '@/features/admin/queryKeys';
import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import { adminArticleKeys } from '@/features/articles/queryKeys';
import {
  convertCandidate,
  createManualCandidate,
  createNewsSource,
  dismissCandidate,
  getNewsCandidate,
  getNewsSource,
  listNewsCandidates,
  listNewsSources,
  runNewsIngestion,
  runNewsSourceAction,
  transitionCandidate,
  updateNewsSource,
} from '@/features/newsInbox/api';
import {
  newsCandidateKeys,
  newsSourceKeys,
} from '@/features/newsInbox/queryKeys';
import type {
  CandidateConvertInput,
  ManualCandidateInput,
  NewsCandidateDetail,
  NewsCandidateListFilters,
  NewsSource,
  NewsSourceDetail,
  NewsSourceInput,
  NewsSourceListFilters,
  NewsSourceUpdateInput,
} from '@/features/newsInbox/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const adminRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useNewsSourcesQuery = (filters: NewsSourceListFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useInfiniteQuery({
    queryKey: newsSourceKeys.list(filters),
    queryFn: ({ signal, pageParam }) =>
      listNewsSources(authenticatedClient, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 30_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useNewsSourceQuery = (sourceId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: newsSourceKeys.detail(sourceId),
    queryFn: ({ signal }) =>
      getNewsSource(authenticatedClient, sourceId, signal),
    enabled: sourceId !== '',
    staleTime: 30_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useNewsCandidatesQuery = (filters: NewsCandidateListFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useInfiniteQuery({
    queryKey: newsCandidateKeys.list(filters),
    queryFn: ({ signal, pageParam }) =>
      listNewsCandidates(authenticatedClient, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useNewsCandidateQuery = (candidateId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: newsCandidateKeys.detail(candidateId),
    queryFn: ({ signal }) =>
      getNewsCandidate(authenticatedClient, candidateId, signal),
    enabled: candidateId !== '',
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

const useSourceSuccess = () => {
  const queryClient = useQueryClient();
  return (source: NewsSource) => {
    queryClient.setQueryData<NewsSourceDetail>(
      newsSourceKeys.detail(source.id),
      (detail) => (detail === undefined ? detail : { ...detail, source }),
    );
    void queryClient.invalidateQueries({ queryKey: newsSourceKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
  };
};

export const useCreateNewsSourceMutation = () => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useSourceSuccess();
  const mutation = useMutation({
    mutationFn: (input: NewsSourceInput) =>
      createNewsSource(authenticatedClient, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useUpdateNewsSourceMutation = (sourceId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useSourceSuccess();
  const mutation = useMutation({
    mutationFn: (input: NewsSourceUpdateInput) =>
      updateNewsSource(authenticatedClient, sourceId, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useNewsSourceStatusMutation = (
  sourceId: string,
  operation: 'pause' | 'resume',
) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useSourceSuccess();
  const mutation = useMutation({
    mutationFn: () =>
      runNewsSourceAction(authenticatedClient, sourceId, operation),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useNewsIngestionMutation = (
  sourceId: string,
  operation: 'test' | 'ingest',
) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      runNewsIngestion(authenticatedClient, sourceId, operation),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: newsSourceKeys.detail(sourceId),
      });
      void queryClient.invalidateQueries({ queryKey: newsSourceKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
      if (operation === 'ingest')
        void queryClient.invalidateQueries({
          queryKey: newsCandidateKeys.lists(),
        });
    },
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

const useCandidateSuccess = () => {
  const queryClient = useQueryClient();
  return (candidate: NewsCandidateDetail) => {
    queryClient.setQueryData(newsCandidateKeys.detail(candidate.id), candidate);
    void queryClient.invalidateQueries({ queryKey: newsCandidateKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
  };
};

export const useManualCandidateMutation = () => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useCandidateSuccess();
  const mutation = useMutation({
    mutationFn: (input: ManualCandidateInput) =>
      createManualCandidate(authenticatedClient, input),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useCandidateTransitionMutation = (
  candidateId: string,
  operation: 'review' | 'save',
) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useCandidateSuccess();
  const mutation = useMutation({
    mutationFn: () =>
      transitionCandidate(authenticatedClient, candidateId, operation),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useDismissCandidateMutation = (candidateId: string) => {
  const { authenticatedClient } = useApiClients();
  const onSuccess = useCandidateSuccess();
  const mutation = useMutation({
    mutationFn: (reason: string) =>
      dismissCandidate(authenticatedClient, candidateId, reason),
    onSuccess,
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};

export const useConvertCandidateMutation = (candidateId: string) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: CandidateConvertInput) =>
      convertCandidate(authenticatedClient, candidateId, input),
    onSuccess: ({ candidate, article }) => {
      queryClient.setQueryData(
        newsCandidateKeys.detail(candidate.id),
        candidate,
      );
      queryClient.setQueryData(adminArticleKeys.detail(article.id), article);
      void queryClient.invalidateQueries({
        queryKey: newsCandidateKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: adminArticleKeys.lists(),
      });
      void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
    },
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};
