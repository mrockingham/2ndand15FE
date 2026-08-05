import type { StatsMetric, StatsSeasonType } from '@/features/statsHub/types';

export const formatMetricValue = (
  value: number | null,
  metric: Pick<StatsMetric, 'decimalPlaces'>,
) =>
  value === null
    ? '—'
    : new Intl.NumberFormat(undefined, {
        minimumFractionDigits: metric.decimalPlaces,
        maximumFractionDigits: metric.decimalPlaces,
      }).format(value);

export const formatSeasonType = (seasonType: StatsSeasonType) =>
  seasonType === 'REG'
    ? 'Regular Season'
    : seasonType === 'POST'
      ? 'Postseason'
      : 'Regular + Postseason';

export const formatGameDate = (value: string | null) => {
  if (value === null) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatTeamContext = (context: {
  readonly type: 'NONE' | 'SINGLE' | 'MULTI';
  readonly teams: readonly { readonly abbreviation: string }[];
}) => {
  if (context.type === 'NONE' || context.teams.length === 0) return '—';
  const teams = context.teams.map((team) => team.abbreviation).join(', ');
  return context.type === 'MULTI' ? `Multiple teams (${teams})` : teams;
};
