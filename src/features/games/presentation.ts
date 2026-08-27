import { formatGameDateTime } from '@/features/games/utils/dateTime';
import type {
  Game,
  GameHighlightsResult,
  GamePlay,
  GameStatus,
  SeasonType,
} from '@/features/games/types';

export const HALL_OF_FAME_GAME_ID = '0768c441-16a6-457c-b50f-e7273d750d77';

export const seasonTypeLabel: Readonly<Record<SeasonType, string>> = {
  PRE: 'Preseason',
  REG: 'Regular Season',
  POST: 'Postseason',
};

export const gameStatusLabel: Readonly<Record<GameStatus, string>> = {
  SCHEDULED: 'Scheduled',
  PREGAME: 'Pregame',
  IN_PROGRESS: 'Live',
  HALFTIME: 'Halftime',
  FINAL: 'Final',
  POSTPONED: 'Postponed',
  CANCELED: 'Canceled',
  SUSPENDED: 'Suspended',
};

export const isScoreStatus = (status: GameStatus) =>
  status === 'IN_PROGRESS' || status === 'HALFTIME' || status === 'FINAL';

type GameLabelFields = Pick<
  Game,
  'id' | 'season' | 'seasonType' | 'week' | 'awayTeam' | 'homeTeam'
>;

export const isHallOfFameGame = (game: GameLabelFields) =>
  game.id === HALL_OF_FAME_GAME_ID &&
  game.season === 2026 &&
  game.seasonType === 'PRE' &&
  game.week === null &&
  game.awayTeam.abbreviation === 'CAR' &&
  game.homeTeam.abbreviation === 'ARI';

export const getGameDisplayLabel = (game: GameLabelFields) => {
  if (isHallOfFameGame(game)) return 'Hall of Fame Game';
  const seasonLabel = seasonTypeLabel[game.seasonType];
  return game.week === null ? seasonLabel : `${seasonLabel} Week ${game.week}`;
};

type GameScoreboardStatusFields = Pick<
  Game,
  'status' | 'quarter' | 'clock' | 'startTime' | 'week'
>;

const CLOCK_PATTERN = /^\d{1,2}:\d{2}$/;
const RAW_SECONDS_PATTERN = /^\d+$/;

/**
 * Passes through an already-normalized "M:SS" clock untouched. Defensively
 * converts a bare integer string (raw seconds, a Highlightly-shaped leak)
 * into "M:SS" instead of ever rendering it verbatim; anything else is
 * treated as unusable and hidden rather than shown malformed.
 */
export const formatGameClock = (clock: string | null): string | null => {
  if (clock === null) return null;
  const trimmed = clock.trim();
  if (trimmed === '') return null;
  if (CLOCK_PATTERN.test(trimmed)) return trimmed;
  if (RAW_SECONDS_PATTERN.test(trimmed)) {
    const totalSeconds = Number(trimmed);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
  return null;
};

export const getScoreboardStatusLine = (
  game: GameScoreboardStatusFields,
): string | null => {
  if (game.status === 'HALFTIME') return 'Halftime';
  if (game.status === 'IN_PROGRESS') {
    const line = [
      game.quarter === null ? null : `Q${game.quarter}`,
      formatGameClock(game.clock),
    ]
      .filter(Boolean)
      .join(' · ');
    return line === '' ? null : line;
  }
  if (game.status === 'SCHEDULED' || game.status === 'PREGAME') {
    return formatGameDateTime(game);
  }
  return null;
};

export const ordinalNumber = (value: number) => {
  const remainderTen = value % 10;
  const remainderHundred = value % 100;
  if (remainderTen === 1 && remainderHundred !== 11) return `${value}st`;
  if (remainderTen === 2 && remainderHundred !== 12) return `${value}nd`;
  if (remainderTen === 3 && remainderHundred !== 13) return `${value}rd`;
  return `${value}th`;
};

export const formatDownDistance = (
  down: number | null,
  distance: number | null,
) =>
  down === null || distance === null
    ? null
    : `${ordinalNumber(down)} & ${distance}`;

export const isFinalizedGameStatus = (status: GameStatus) =>
  status === 'FINAL' ||
  status === 'POSTPONED' ||
  status === 'CANCELED' ||
  status === 'SUSPENDED';

export const countNewPlaysSince = (
  newestFirst: readonly GamePlay[],
  lastSeenSequence: number,
): number =>
  newestFirst.filter((play) => play.sequence > lastSeenSequence).length;

export const formatFreshnessAge = (ageMs: number): string => {
  if (ageMs < 1000) return 'just now';
  const seconds = Math.round(ageMs / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min ago`;
};

export const formatYardLine = (yardLine: number) => {
  if (yardLine === 50) return '50';
  return yardLine < 50 ? `Own ${yardLine}` : `Opp ${100 - yardLine}`;
};

export type GameHighlightsDisplayState =
  'cards' | 'checking' | 'unavailable' | 'hidden';

/**
 * Highlight sync only ever runs during FINAL reconciliation, so PENDING/
 * PROVIDER_ERROR only mean anything for a FINAL game -- keyed on the literal
 * `FINAL` status (not `isFinalizedGameStatus`), since POSTPONED/CANCELED/
 * SUSPENDED games never enter the highlight lifecycle at all. An early
 * AVAILABLE result (the provider responding before the game even finishes)
 * is never discarded, regardless of status -- backend coverage is
 * authoritative.
 */
export const getGameHighlightsDisplayState = (
  status: GameStatus,
  data: GameHighlightsResult | undefined,
  hasQueryError: boolean,
): GameHighlightsDisplayState => {
  if (
    data !== undefined &&
    data.coverage === 'AVAILABLE' &&
    data.highlights.length > 0
  ) {
    return 'cards';
  }
  if (status !== 'FINAL') return 'hidden';
  if (data === undefined) return hasQueryError ? 'unavailable' : 'hidden';
  if (data.coverage === 'PENDING') return 'checking';
  if (data.coverage === 'PROVIDER_ERROR') return 'unavailable';
  return 'hidden';
};
