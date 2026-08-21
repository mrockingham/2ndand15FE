import type { Game } from '@/features/games/types';

export const TIME_TBD = 'Time TBD';

export const parseGameDate = (startTime: string | null): Date | null => {
  if (startTime === null) return null;
  const parsed = new Date(startTime);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

interface FormatOptions {
  readonly locale?: string;
  readonly timeZone?: string;
}

export const formatGameDate = (
  startTime: string | null,
  options: FormatOptions = {},
) => {
  const date = parseGameDate(startTime);
  if (date === null) return TIME_TBD;
  return new Intl.DateTimeFormat(options.locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(options.timeZone === undefined ? {} : { timeZone: options.timeZone }),
  }).format(date);
};

export const formatGameTime = (
  startTime: string | null,
  options: FormatOptions = {},
) => {
  const date = parseGameDate(startTime);
  if (date === null) return TIME_TBD;
  return new Intl.DateTimeFormat(options.locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    ...(options.timeZone === undefined ? {} : { timeZone: options.timeZone }),
  }).format(date);
};

export const formatGameDateTime = (
  game: Pick<Game, 'startTime' | 'week'>,
  options: FormatOptions = {},
) => {
  if (parseGameDate(game.startTime) === null) {
    return game.week === null ? TIME_TBD : `Week ${game.week} · ${TIME_TBD}`;
  }
  return `${formatGameDate(game.startTime, options)} · ${formatGameTime(game.startTime, options)}`;
};

export const gameDayKey = (
  startTime: string | null,
  options: FormatOptions = {},
) => {
  const date = parseGameDate(startTime);
  if (date === null) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(options.timeZone === undefined ? {} : { timeZone: options.timeZone }),
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

export const compareGames = (left: Game, right: Game) => {
  const leftDate = parseGameDate(left.startTime);
  const rightDate = parseGameDate(right.startTime);
  if (leftDate !== null && rightDate !== null) {
    const difference = leftDate.getTime() - rightDate.getTime();
    if (difference !== 0) return difference;
  } else if (leftDate !== null) {
    return -1;
  } else if (rightDate !== null) {
    return 1;
  }
  return (
    left.awayTeam.fullName.localeCompare(right.awayTeam.fullName) ||
    left.homeTeam.fullName.localeCompare(right.homeTeam.fullName) ||
    left.id.localeCompare(right.id)
  );
};

const seasonOrder = { PRE: 0, REG: 1, POST: 2 } as const;

export const compareGamesForNext = (left: Game, right: Game) =>
  seasonOrder[left.seasonType] - seasonOrder[right.seasonType] ||
  compareGames(left, right) ||
  (left.week ?? Number.MAX_SAFE_INTEGER) -
    (right.week ?? Number.MAX_SAFE_INTEGER);

export const isGameUpcoming = (game: Game, now = new Date()) => {
  if (game.status === 'PREGAME') return true;
  if (game.status !== 'SCHEDULED') return false;
  const start = parseGameDate(game.startTime);
  return start === null || start.getTime() >= now.getTime();
};
