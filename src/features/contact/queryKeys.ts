import type { ContactMessageListFilters } from '@/features/contact/types';

const normalizeFilters = (filters: ContactMessageListFilters) => ({
  limit: filters.limit,
  status: filters.status,
});

export const contactMessageKeys = {
  all: ['admin', 'contact-messages'] as const,
  lists: () => [...contactMessageKeys.all, 'list'] as const,
  list: (filters: ContactMessageListFilters) =>
    [...contactMessageKeys.lists(), normalizeFilters(filters)] as const,
  details: () => [...contactMessageKeys.all, 'detail'] as const,
  detail: (messageId: string) =>
    [...contactMessageKeys.details(), messageId] as const,
};
