import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { adminAuditKeys } from '@/features/admin/queryKeys';
import { useRefreshRoleOnForbidden } from '@/features/admin/queries';
import {
  getContactMessage,
  listContactMessages,
  submitContactMessage,
  updateContactMessageStatus,
} from '@/features/contact/api';
import { contactMessageKeys } from '@/features/contact/queryKeys';
import type {
  ContactMessageListFilters,
  ContactMessageStatus,
  ContactSubmitRequest,
} from '@/features/contact/types';
import { ApiError } from '@/services/api/apiClient';
import { useApiClients } from '@/services/api/useApiClients';

const adminRetry = (count: number, error: unknown) =>
  !(error instanceof ApiError && error.status > 0 && error.status < 500) &&
  count < 2;

export const useSubmitContactMessageMutation = () => {
  const { publicClient } = useApiClients();
  return useMutation({
    mutationFn: (request: ContactSubmitRequest) =>
      submitContactMessage(publicClient, request),
  });
};

export const useContactMessagesQuery = (filters: ContactMessageListFilters) => {
  const { authenticatedClient } = useApiClients();
  const query = useInfiniteQuery({
    queryKey: contactMessageKeys.list(filters),
    queryFn: ({ signal, pageParam }) =>
      listContactMessages(authenticatedClient, filters, signal, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useContactMessageQuery = (messageId: string) => {
  const { authenticatedClient } = useApiClients();
  const query = useQuery({
    queryKey: contactMessageKeys.detail(messageId),
    queryFn: ({ signal }) =>
      getContactMessage(authenticatedClient, messageId, signal),
    enabled: messageId !== '',
    staleTime: 15_000,
    retry: adminRetry,
  });
  useRefreshRoleOnForbidden(query.error);
  return query;
};

export const useUpdateContactMessageStatusMutation = (messageId: string) => {
  const { authenticatedClient } = useApiClients();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: ContactMessageStatus) =>
      updateContactMessageStatus(authenticatedClient, messageId, status),
    onSuccess: (message) => {
      queryClient.setQueryData(contactMessageKeys.detail(message.id), message);
      void queryClient.invalidateQueries({
        queryKey: contactMessageKeys.lists(),
      });
      void queryClient.invalidateQueries({ queryKey: adminAuditKeys.all });
    },
  });
  useRefreshRoleOnForbidden(mutation.error);
  return mutation;
};
