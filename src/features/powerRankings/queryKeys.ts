import type { PowerRankingsFilters } from '@/features/powerRankings/types';

export const powerRankingsKeys = {
  all: ['power-rankings'] as const,
  view: (filters: PowerRankingsFilters) =>
    [
      ...powerRankingsKeys.all,
      'view',
      filters.season ?? null,
      filters.edition ?? null,
    ] as const,
  editions: (season?: number) =>
    [...powerRankingsKeys.all, 'editions', season ?? null] as const,
};

export const adminPowerRankingsKeys = {
  all: ['power-rankings', 'admin'] as const,
  list: () => [...adminPowerRankingsKeys.all, 'list'] as const,
  detail: (editionId: string) =>
    [...adminPowerRankingsKeys.all, 'detail', editionId] as const,
};
