import type {
  StandingsFilters,
  StandingsView,
} from '@/features/standings/types';

export const STANDINGS_SEASONS = [2026, 2025] as const;

export const standingsSeasonTypes = (season: number) =>
  season === 2025 ? (['REG'] as const) : (['PRE'] as const);

export const normalizeStandingsUrlState = (
  parameters: URLSearchParams,
): StandingsFilters => {
  const requestedSeason = Number(parameters.get('season'));
  const season = STANDINGS_SEASONS.includes(requestedSeason as 2026 | 2025)
    ? requestedSeason
    : 2026;
  const allowedTypes = standingsSeasonTypes(season);
  const requestedType = parameters.get('seasonType');
  const seasonType = allowedTypes.includes(requestedType as never)
    ? (requestedType as 'PRE' | 'REG')
    : allowedTypes[0];
  const requestedView = parameters.get('view');
  const view: StandingsView =
    requestedView === 'conference' || requestedView === 'league'
      ? requestedView
      : 'division';
  return { season, seasonType, view };
};

export const serializeStandingsUrlState = (state: StandingsFilters) => {
  const parameters = new URLSearchParams();
  parameters.set('season', String(state.season));
  parameters.set('seasonType', state.seasonType);
  parameters.set('view', state.view);
  return parameters;
};

export const updateStandingsUrlState = (
  state: StandingsFilters,
  changes: Partial<StandingsFilters>,
) => {
  const season = changes.season ?? state.season;
  const types = standingsSeasonTypes(season);
  const requestedType = changes.seasonType ?? state.seasonType;
  return {
    ...state,
    ...changes,
    season,
    seasonType: types.includes(requestedType as never)
      ? requestedType
      : types[0],
  } as StandingsFilters;
};
