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
