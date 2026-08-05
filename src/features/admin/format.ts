import type { GameStatus, SeasonType } from '@/features/admin/types';

export const formatAdminDateTime = (value: string | null) => {
  if (value === null) return 'Time TBD';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Time TBD';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(parsed);
};

export const seasonTypeLabel: Readonly<Record<SeasonType, string>> = {
  PRE: 'Preseason',
  REG: 'Regular season',
  POST: 'Postseason',
};

export const gameStatusLabel: Readonly<Record<GameStatus, string>> = {
  SCHEDULED: 'Scheduled',
  PREGAME: 'Pregame',
  IN_PROGRESS: 'In progress',
  HALFTIME: 'Halftime',
  FINAL: 'Final',
  POSTPONED: 'Postponed',
  CANCELED: 'Canceled',
  SUSPENDED: 'Suspended',
};
