import type {
  PlayerSeasonType,
  PlayerSummaryType,
} from '@/features/players/types';

export const summaryTypeLabel: Readonly<Record<PlayerSummaryType, string>> = {
  REG: 'Regular season',
  POST: 'Postseason',
  REG_POST: 'Regular season + postseason',
};

export const seasonTypeLabel: Readonly<Record<PlayerSeasonType, string>> = {
  PRE: 'Preseason',
  REG: 'Regular season',
  POST: 'Postseason',
};

export const formatStatValue = (value: number | null, suffix = '') =>
  value === null
    ? '—'
    : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}${suffix}`;

export const safePercentage = (
  numerator: number | null,
  denominator: number | null,
) =>
  numerator === null || denominator === null || denominator === 0
    ? null
    : (numerator / denominator) * 100;

export const safeAverage = (total: number | null, count: number | null) =>
  total === null || count === null || count === 0 ? null : total / count;

export const formatHeight = (heightInches: number | null) => {
  if (heightInches === null) return 'Not available';
  return `${Math.floor(heightInches / 12)}′ ${heightInches % 12}″`;
};

export const formatPlayerDate = (value: string | null) => {
  if (value === null) return 'Not available';
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date);
};

export const formatGameDate = (value: string | null) => {
  if (value === null) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
};

export const safeHeadshotUrl = (value: string | null) => {
  if (value === null) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

export const playerInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'P';
};

export const isUuid = (value: string | null): value is string =>
  value !== null &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const parsePlayerSeason = (value: string | null) => {
  if (!/^\d{4}$/.test(value ?? '')) return undefined;
  const season = Number(value);
  return season >= 2020 && season <= 2025 ? season : undefined;
};
