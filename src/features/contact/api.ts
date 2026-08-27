import type {
  ContactMessageListFilters,
  ContactMessagePage,
  ContactMessageRecord,
  ContactMessageStatus,
  ContactSubmitRequest,
  MessageResponse,
} from '@/features/contact/types';
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

export const submitContactMessage = async (
  client: ApiClient,
  request: ContactSubmitRequest,
) => {
  const response = await client.request<DataResponse<MessageResponse>>(
    '/contact',
    { method: 'POST', body: request },
  );
  return response.data;
};

export const listContactMessages = async (
  client: ApiClient,
  filters: ContactMessageListFilters,
  signal?: AbortSignal,
  cursor?: string,
): Promise<ContactMessagePage> => {
  const response = await client.request<
    DataResponse<{
      readonly messages: readonly ContactMessageRecord[];
      readonly nextCursor: string | null;
    }>
  >(`/admin/contact-messages${queryString(filters, cursor)}`, {
    authenticated: true,
    method: 'GET',
    signal,
  });
  return {
    messages: response.data.messages,
    nextCursor: response.data.nextCursor,
  };
};

export const getContactMessage = async (
  client: ApiClient,
  messageId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<ContactMessageRecord>>(
      `/admin/contact-messages/${encodeURIComponent(messageId)}`,
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const updateContactMessageStatus = async (
  client: ApiClient,
  messageId: string,
  status: ContactMessageStatus,
) =>
  (
    await client.request<DataResponse<ContactMessageRecord>>(
      `/admin/contact-messages/${encodeURIComponent(messageId)}`,
      { authenticated: true, method: 'PATCH', body: { status } },
    )
  ).data;
