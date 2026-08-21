import type {
  AiHubSeasonType,
  FavoriteTeamPrediction,
  WeeklyInsightCard,
} from '@/features/aiHub/types';

export const formatProbability = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

export const formatNullableRate = (value: number | null) =>
  value === null ? '—' : formatProbability(value);

export const formatBrierScore = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(value);

export const matchupLabel = (card: WeeklyInsightCard) =>
  `${card.game.awayTeam.abbreviation} at ${card.game.homeTeam.abbreviation}`;

export const projectedScoreForTeam = (prediction: FavoriteTeamPrediction) => {
  if (prediction.projectedScore === null) return null;
  const teamIsHome = prediction.game.homeTeam.id === prediction.team.id;
  return {
    team: teamIsHome
      ? prediction.projectedScore.home
      : prediction.projectedScore.away,
    opponent: teamIsHome
      ? prediction.projectedScore.away
      : prediction.projectedScore.home,
  };
};

export const formatSeasonType = (value: AiHubSeasonType) =>
  value === 'PRE'
    ? 'Preseason'
    : value === 'REG'
      ? 'Regular Season'
      : 'Postseason';

export const formatFactorCode = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
