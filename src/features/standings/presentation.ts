import type { StandingsSeasonType } from '@/features/standings/types';

export const formatStandingsRecord = (
  wins: number | null,
  losses: number | null,
  ties: number | null,
) => {
  if (wins === null || losses === null || ties === null) return '—';
  return ties === 0 ? `${wins}-${losses}` : `${wins}-${losses}-${ties}`;
};

export const formatWinPercentage = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '—';
  const formatted = value.toFixed(3);
  return value >= 0 && value < 1 ? formatted.slice(1) : formatted;
};

export const formatPointDifferential = (value: number | null) => {
  if (value === null) return '—';
  return value > 0 ? `+${value}` : String(value);
};

export const standingsSeasonLabel = (type: StandingsSeasonType) =>
  type === 'PRE'
    ? 'Preseason'
    : type === 'REG'
      ? 'Regular Season'
      : 'Postseason';

export const standingsPageTitle = (
  season: number,
  type: StandingsSeasonType,
) =>
  type === 'PRE'
    ? `NFL Preseason Standings ${season}`
    : `NFL Standings ${season}`;

export const formatStandingsUpdatedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};
