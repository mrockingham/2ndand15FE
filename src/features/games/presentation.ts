import { formatGameDateTime } from '@/features/games/utils/dateTime';
import type { Game, GameStatus, SeasonType } from '@/features/games/types';

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

export const getScoreboardStatusLine = (
  game: GameScoreboardStatusFields,
): string | null => {
  if (game.status === 'HALFTIME') return 'Halftime';
  if (game.status === 'IN_PROGRESS') {
    const line = [game.quarter === null ? null : `Q${game.quarter}`, game.clock]
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

export const formatYardLine = (yardLine: number) => {
  if (yardLine === 50) return '50';
  return yardLine < 50 ? `Own ${yardLine}` : `Opp ${100 - yardLine}`;
};
