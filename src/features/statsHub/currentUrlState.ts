import type { SeasonType } from '@/features/games/types';
import type { CurrentStatsFilters, CurrentStatsResult } from './currentTypes';

export type StatsMode = 'current' | 'historical';

const historicalKeys = [
  'view',
  'type',
  'category',
  'metric',
  'position',
  'positionGroup',
  'recentPlayerId',
  'recentSeason',
  'recentType',
  'recentGames',
] as const;

export const resolveStatsMode = (parameters: URLSearchParams): StatsMode => {
  const explicit = parameters.get('mode');
  if (explicit === 'historical' || explicit === 'current') return explicit;
  if (historicalKeys.some((key) => parameters.has(key))) return 'historical';
  if (parameters.has('season') && !parameters.has('seasonType'))
    return 'historical';
  return 'current';
};

const readInteger = (value: string | null) => {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
};

const readSeasonType = (value: string | null): SeasonType | undefined =>
  value === 'PRE' || value === 'REG' || value === 'POST' ? value : undefined;

const isUuid = (value: string | null) =>
  value !== null &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const readCurrentStatsFilters = (
  parameters: URLSearchParams,
): CurrentStatsFilters => {
  const weekValue = parameters.get('week');
  const week = weekValue === 'ALL' ? 'ALL' : readInteger(weekValue);
  return {
    season: readInteger(parameters.get('season')),
    seasonType: readSeasonType(parameters.get('seasonType')),
    week,
    teamId: isUuid(parameters.get('teamId'))
      ? parameters.get('teamId')!
      : undefined,
  };
};

export const serializeCurrentStatsState = (
  result: Pick<CurrentStatsResult, 'season' | 'seasonType' | 'week'>,
  teamId?: string,
) => {
  const parameters = new URLSearchParams();
  parameters.set('mode', 'current');
  parameters.set('season', String(result.season));
  parameters.set('seasonType', result.seasonType);
  parameters.set('week', String(result.week));
  if (teamId) parameters.set('teamId', teamId);
  return parameters;
};
