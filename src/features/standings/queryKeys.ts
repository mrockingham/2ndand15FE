import type { StandingsFilters } from '@/features/standings/types';

export const standingsKeys = {
  all: ['standings'] as const,
  view: (filters: StandingsFilters) =>
    [
      ...standingsKeys.all,
      filters.season,
      filters.seasonType,
      filters.view,
    ] as const,
};
