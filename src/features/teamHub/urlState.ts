import type { StatsMetadata, StatsSeasonType } from '@/features/statsHub/types';
import type {
  NormalizedTeamHubUrlState,
  TeamHubOverview,
} from '@/features/teamHub/types';

const readInteger = (value: string | null) => {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

export const normalizeTeamHubUrlState = (
  parameters: URLSearchParams,
  overview: TeamHubOverview,
  metadata?: StatsMetadata,
): NormalizedTeamHubUrlState => {
  const history = overview.historicalData;
  const requestedRosterSeason = readInteger(parameters.get('rosterSeason'));
  const rosterSeason = history.rosterSeasons.includes(
    requestedRosterSeason ?? -1,
  )
    ? requestedRosterSeason
    : history.rosterSeasons.length
      ? Math.max(...history.rosterSeasons)
      : undefined;
  const rosterPosition = parameters.get('rosterPosition')?.trim().toUpperCase();
  const rosterPositionGroup = parameters
    .get('rosterPositionGroup')
    ?.trim()
    .toUpperCase();
  const rosterSearch = parameters.get('rosterSearch')?.trim();

  let leader: NormalizedTeamHubUrlState['leader'];
  if (metadata) {
    const availableSeasons = history.statSeasons.filter((season) =>
      metadata.availableSeasons.includes(season),
    );
    const requestedSeason = readInteger(parameters.get('leaderSeason'));
    const season = availableSeasons.includes(requestedSeason ?? -1)
      ? requestedSeason
      : availableSeasons.length
        ? Math.max(...availableSeasons)
        : undefined;
    const metrics = metadata.metrics.filter(
      (metric) => metric.availableForSeasonLeaders,
    );
    const categories = metadata.categories.filter((category) =>
      metrics.some((metric) => metric.category === category.id),
    );
    const requestedMetric = metrics.find(
      (metric) => metric.id === parameters.get('leaderMetric'),
    );
    const requestedCategory = parameters.get('leaderCategory');
    const category = categories.some(
      (candidate) => candidate.id === requestedCategory,
    )
      ? requestedCategory
      : (requestedMetric?.category ?? categories[0]?.id);
    const metric =
      requestedMetric?.category === category
        ? requestedMetric
        : metrics.find((candidate) => candidate.category === category);
    const requestedType = parameters.get(
      'leaderType',
    ) as StatsSeasonType | null;
    const seasonType = metadata.seasonTypes.seasonLeaders.includes(
      requestedType as StatsSeasonType,
    )
      ? requestedType!
      : metadata.seasonTypes.seasonLeaders.includes('REG')
        ? 'REG'
        : metadata.seasonTypes.seasonLeaders[0];
    const requestedPosition = parameters
      .get('leaderPosition')
      ?.trim()
      .toUpperCase();
    const requestedGroup = parameters
      .get('leaderPositionGroup')
      ?.trim()
      .toUpperCase();
    if (season !== undefined && category && metric && seasonType) {
      leader = {
        season,
        seasonType,
        category,
        metric: metric.id,
        position:
          requestedPosition && metadata.positions.includes(requestedPosition)
            ? requestedPosition
            : undefined,
        positionGroup:
          requestedGroup && metadata.positionGroups.includes(requestedGroup)
            ? requestedGroup
            : undefined,
      };
    }
  }

  return {
    rosterSeason,
    rosterPosition:
      rosterPosition && history.positions.includes(rosterPosition)
        ? rosterPosition
        : undefined,
    rosterPositionGroup:
      rosterPositionGroup &&
      history.positionGroups.includes(rosterPositionGroup)
        ? rosterPositionGroup
        : undefined,
    rosterSearch:
      rosterSearch && rosterSearch.length >= 2 && rosterSearch.length <= 100
        ? rosterSearch
        : undefined,
    leader,
  };
};

export const serializeTeamHubUrlState = (state: NormalizedTeamHubUrlState) => {
  const parameters = new URLSearchParams();
  if (state.rosterSeason !== undefined)
    parameters.set('rosterSeason', String(state.rosterSeason));
  if (state.rosterPosition)
    parameters.set('rosterPosition', state.rosterPosition);
  if (state.rosterPositionGroup)
    parameters.set('rosterPositionGroup', state.rosterPositionGroup);
  if (state.rosterSearch) parameters.set('rosterSearch', state.rosterSearch);
  if (state.leader) {
    parameters.set('leaderSeason', String(state.leader.season));
    parameters.set('leaderType', state.leader.seasonType);
    parameters.set('leaderCategory', state.leader.category);
    parameters.set('leaderMetric', state.leader.metric);
    if (state.leader.position)
      parameters.set('leaderPosition', state.leader.position);
    if (state.leader.positionGroup)
      parameters.set('leaderPositionGroup', state.leader.positionGroup);
  }
  return parameters;
};

export type TeamDirectoryConference = 'ALL' | 'AFC' | 'NFC';
export type TeamDirectoryDivision = 'ALL' | 'East' | 'North' | 'South' | 'West';

export const normalizeTeamDirectoryUrl = (parameters: URLSearchParams) => {
  const rawConference = parameters.get('conference');
  const rawDivision = parameters.get('division');
  const conference: TeamDirectoryConference =
    rawConference === 'AFC' || rawConference === 'NFC' ? rawConference : 'ALL';
  const division: TeamDirectoryDivision =
    rawDivision === 'East' ||
    rawDivision === 'North' ||
    rawDivision === 'South' ||
    rawDivision === 'West'
      ? rawDivision
      : 'ALL';
  return {
    search: parameters.get('search')?.trim() ?? '',
    conference,
    division,
  };
};
