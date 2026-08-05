import type {
  NewsCandidateListFilters,
  NewsSourceListFilters,
} from '@/features/newsInbox/types';

export const normalizeSourceFilters = (filters: NewsSourceListFilters) => ({
  limit: filters.limit,
  status: filters.status,
  kind: filters.kind,
});

export const normalizeCandidateFilters = (
  filters: NewsCandidateListFilters,
) => ({
  limit: filters.limit,
  status: filters.status,
  sourceId: filters.sourceId,
  teamId: filters.teamId,
  publishedFrom: filters.publishedFrom,
  publishedTo: filters.publishedTo,
  search: filters.search,
});

export const newsSourceKeys = {
  all: ['admin', 'news-sources'] as const,
  lists: () => [...newsSourceKeys.all, 'list'] as const,
  list: (filters: NewsSourceListFilters) =>
    [...newsSourceKeys.lists(), normalizeSourceFilters(filters)] as const,
  details: () => [...newsSourceKeys.all, 'detail'] as const,
  detail: (sourceId: string) =>
    [...newsSourceKeys.details(), sourceId] as const,
};

export const newsCandidateKeys = {
  all: ['admin', 'news-candidates'] as const,
  lists: () => [...newsCandidateKeys.all, 'list'] as const,
  list: (filters: NewsCandidateListFilters) =>
    [...newsCandidateKeys.lists(), normalizeCandidateFilters(filters)] as const,
  details: () => [...newsCandidateKeys.all, 'detail'] as const,
  detail: (candidateId: string) =>
    [...newsCandidateKeys.details(), candidateId] as const,
};
