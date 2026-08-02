import type { GameStatus, SeasonType } from '@/features/admin/types';

export const formatAdminDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));

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
