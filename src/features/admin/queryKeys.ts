import type {
  AdminGameListFilters,
  AuditFilters,
} from '@/features/admin/types';

export const adminGameKeys = {
  all: ['admin', 'games'] as const,
  lists: () => [...adminGameKeys.all, 'list'] as const,
  list: (filters: AdminGameListFilters) =>
    [...adminGameKeys.lists(), filters] as const,
  details: () => [...adminGameKeys.all, 'detail'] as const,
  detail: (gameId: string) => [...adminGameKeys.details(), gameId] as const,
};

export const adminAuditKeys = {
  all: ['admin', 'audit-events'] as const,
  list: (filters: AuditFilters) => [...adminAuditKeys.all, filters] as const,
  game: (gameId: string, cursor?: string) =>
    [...adminAuditKeys.all, 'game', gameId, cursor ?? null] as const,
};
