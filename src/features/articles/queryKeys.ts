import type {
  AdminArticleFilters,
  PublicArticleFilters,
} from '@/features/articles/types';

export const articleKeys = {
  all: ['articles', 'public'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: PublicArticleFilters) =>
    [...articleKeys.lists(), filters] as const,
  featured: (filters: PublicArticleFilters) =>
    [...articleKeys.all, 'featured', filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
  team: (teamId: string, filters: PublicArticleFilters) =>
    [...articleKeys.all, 'team', teamId, filters] as const,
};

export const adminArticleKeys = {
  all: ['articles', 'admin'] as const,
  lists: () => [...adminArticleKeys.all, 'list'] as const,
  list: (filters: AdminArticleFilters) =>
    [...adminArticleKeys.lists(), filters] as const,
  details: () => [...adminArticleKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminArticleKeys.details(), id] as const,
  revisionLists: (id: string) =>
    [...adminArticleKeys.all, 'revisions', id] as const,
  revisions: (id: string, cursor?: string) =>
    [...adminArticleKeys.revisionLists(id), cursor ?? null] as const,
  revision: (id: string, revisionId: string) =>
    [...adminArticleKeys.all, 'revision', id, revisionId] as const,
};
