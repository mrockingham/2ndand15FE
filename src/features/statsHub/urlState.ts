import type {
  NormalizedStatsUrlState,
  StatsMetadata,
  StatsMetric,
  StatsSeasonType,
  StatsView,
  StatsWeeklySeasonType,
} from '@/features/statsHub/types';
import { isUuid } from '@/features/players/presentation';

const readInteger = (value: string | null) => {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

const metricSupportsView = (metric: StatsMetric, view: StatsView) =>
  view === 'season'
    ? metric.availableForSeasonLeaders
    : metric.availableForWeekLeaders;

const firstMetric = (
  metadata: StatsMetadata,
  view: StatsView,
  category: string,
) =>
  metadata.metrics.find(
    (metric) =>
      metric.category === category && metricSupportsView(metric, view),
  );

export const normalizeStatsUrlState = (
  parameters: URLSearchParams,
  metadata: StatsMetadata,
): NormalizedStatsUrlState | null => {
  const latestSeason = Math.max(...metadata.availableSeasons);
  if (!Number.isFinite(latestSeason)) return null;

  const view: StatsView = parameters.get('view') === 'week' ? 'week' : 'season';
  const requestedSeason = readInteger(parameters.get('season'));
  const season = metadata.availableSeasons.includes(requestedSeason ?? -1)
    ? requestedSeason!
    : latestSeason;
  const seasonTypes =
    view === 'season'
      ? metadata.seasonTypes.seasonLeaders
      : metadata.seasonTypes.weeklyLeaders;
  const requestedType = parameters.get('type') as StatsSeasonType | null;
  const seasonType = seasonTypes.includes(requestedType as never)
    ? requestedType!
    : seasonTypes.includes('REG' as never)
      ? 'REG'
      : seasonTypes[0];
  if (seasonType === undefined) return null;

  const supportedMetrics = metadata.metrics.filter((metric) =>
    metricSupportsView(metric, view),
  );
  const availableCategories = metadata.categories.filter((category) =>
    supportedMetrics.some((metric) => metric.category === category.id),
  );
  const requestedMetric = supportedMetrics.find(
    (metric) => metric.id === parameters.get('metric'),
  );
  const requestedCategory = parameters.get('category');
  const category = availableCategories.some(
    (candidate) => candidate.id === requestedCategory,
  )
    ? requestedCategory!
    : (requestedMetric?.category ?? availableCategories[0]?.id);
  if (category === undefined) return null;
  const metric =
    requestedMetric?.category === category
      ? requestedMetric
      : firstMetric(metadata, view, category);
  if (metric === undefined) return null;

  const requestedWeek = readInteger(parameters.get('week'));
  const week =
    view === 'week'
      ? requestedWeek !== undefined && requestedWeek >= 1 && requestedWeek <= 22
        ? requestedWeek
        : 1
      : undefined;
  const requestedPosition = parameters.get('position')?.trim().toUpperCase();
  const requestedGroup = parameters.get('positionGroup')?.trim().toUpperCase();
  const recentSeason = readInteger(parameters.get('recentSeason'));
  const requestedRecentType = parameters.get('recentType');
  const recentType = metadata.seasonTypes.recentPerformance.includes(
    requestedRecentType as StatsWeeklySeasonType,
  )
    ? (requestedRecentType as StatsWeeklySeasonType)
    : undefined;
  const maxRecent = metadata.limits.recentGames.maximum;
  const requestedGames = readInteger(parameters.get('recentGames'));
  const allowedGames = [5, 10, 20].filter((value) => value <= maxRecent);
  const defaultRecent = allowedGames.includes(
    metadata.limits.recentGames.default,
  )
    ? metadata.limits.recentGames.default
    : (allowedGames[0] ??
      Math.min(metadata.limits.recentGames.default, maxRecent));

  return {
    view,
    season,
    seasonType,
    week,
    category,
    metric: metric.id,
    teamId: isUuid(parameters.get('teamId'))
      ? parameters.get('teamId')!
      : undefined,
    position:
      requestedPosition && metadata.positions.includes(requestedPosition)
        ? requestedPosition
        : undefined,
    positionGroup:
      requestedGroup && metadata.positionGroups.includes(requestedGroup)
        ? requestedGroup
        : undefined,
    recentPlayerId: isUuid(parameters.get('recentPlayerId'))
      ? parameters.get('recentPlayerId')!
      : undefined,
    recentSeason: metadata.availableSeasons.includes(recentSeason ?? -1)
      ? recentSeason
      : undefined,
    recentSeasonType: recentType,
    recentGames:
      requestedGames !== undefined && allowedGames.includes(requestedGames)
        ? requestedGames
        : defaultRecent,
  };
};

export const serializeStatsUrlState = (state: NormalizedStatsUrlState) => {
  const parameters = new URLSearchParams();
  parameters.set('view', state.view);
  parameters.set('season', String(state.season));
  parameters.set('type', state.seasonType);
  if (state.week !== undefined) parameters.set('week', String(state.week));
  parameters.set('category', state.category);
  parameters.set('metric', state.metric);
  if (state.teamId) parameters.set('teamId', state.teamId);
  if (state.position) parameters.set('position', state.position);
  if (state.positionGroup) parameters.set('positionGroup', state.positionGroup);
  if (state.recentPlayerId)
    parameters.set('recentPlayerId', state.recentPlayerId);
  if (state.recentSeason)
    parameters.set('recentSeason', String(state.recentSeason));
  if (state.recentSeasonType)
    parameters.set('recentType', state.recentSeasonType);
  parameters.set('recentGames', String(state.recentGames));
  return parameters;
};

export const updateStatsUrlState = (
  state: NormalizedStatsUrlState,
  metadata: StatsMetadata,
  changes: Partial<NormalizedStatsUrlState>,
) => {
  const merged = { ...state, ...changes };
  const parameters = serializeStatsUrlState(merged);
  return normalizeStatsUrlState(parameters, metadata);
};
