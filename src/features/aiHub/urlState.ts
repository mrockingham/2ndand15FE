import type { AiHubSeasonType } from '@/features/aiHub/types';

export const CURRENT_AI_SEASON = 2026;
export const DEFAULT_AI_SEASON_TYPE: AiHubSeasonType = 'PRE';
export const DEFAULT_AI_WEEK = 1;

export interface AiHubUrlState {
  readonly season: number;
  readonly seasonType: AiHubSeasonType;
  readonly week: number;
}

const isSeasonType = (value: string | null): value is AiHubSeasonType =>
  value === 'PRE' || value === 'REG' || value === 'POST';

export const weekLimitFor = (seasonType: AiHubSeasonType) =>
  seasonType === 'REG' ? 18 : seasonType === 'PRE' ? 5 : 5;

export const normalizeAiHubUrlState = (
  parameters: URLSearchParams,
): AiHubUrlState => {
  const parsedSeason = Number(parameters.get('season'));
  const season =
    Number.isInteger(parsedSeason) &&
    parsedSeason >= 2020 &&
    parsedSeason <= 2100
      ? parsedSeason
      : CURRENT_AI_SEASON;
  const candidateType = parameters.get('type');
  const seasonType = isSeasonType(candidateType)
    ? candidateType
    : DEFAULT_AI_SEASON_TYPE;
  const parsedWeek = Number(parameters.get('week'));
  const week =
    Number.isInteger(parsedWeek) &&
    parsedWeek >= 1 &&
    parsedWeek <= weekLimitFor(seasonType)
      ? parsedWeek
      : DEFAULT_AI_WEEK;
  return { season, seasonType, week };
};

export const serializeAiHubUrlState = (state: AiHubUrlState) =>
  new URLSearchParams({
    season: String(state.season),
    type: state.seasonType,
    week: String(state.week),
  });
