import type {
  PredictionListFilters,
  WeeklyInsightsFilters,
} from '@/features/aiHub/types';

const normalize = (filters: WeeklyInsightsFilters) => ({
  season: filters.season,
  seasonType: filters.seasonType,
  week: filters.week,
  top: filters.top,
  teamId: filters.teamId ?? null,
});

export const aiHubKeys = {
  all: ['aiHub'] as const,
  weeklyInsights: (filters: WeeklyInsightsFilters) =>
    [...aiHubKeys.all, 'weeklyInsights', normalize(filters)] as const,
  predictions: (filters: PredictionListFilters) =>
    [...aiHubKeys.all, 'predictions', filters] as const,
  performance: () => [...aiHubKeys.all, 'performance'] as const,
};
