import type {
  AdminPowerRankingEdition,
  AdminPowerRankingEditionDetail,
  AdminPowerRankingEntry,
  PowerRankingConference,
  PowerRankingDivision,
  PowerRankingEdition,
  PowerRankingEditionSummary,
  PowerRankingEntry,
  PowerRankingImportResult,
  PowerRankingsData,
  PowerRankingTeam,
} from '@/features/powerRankings/types';

const conferences: readonly PowerRankingConference[] = ['AFC', 'NFC'];
const divisions: readonly PowerRankingDivision[] = [
  'East',
  'North',
  'South',
  'West',
];

const teamNames = [
  'Buffalo Bills',
  'Miami Dolphins',
  'New England Patriots',
  'New York Jets',
  'Baltimore Ravens',
  'Cincinnati Bengals',
  'Cleveland Browns',
  'Pittsburgh Steelers',
  'Houston Texans',
  'Indianapolis Colts',
  'Jacksonville Jaguars',
  'Tennessee Titans',
  'Denver Broncos',
  'Kansas City Chiefs',
  'Las Vegas Raiders',
  'Los Angeles Chargers',
  'Dallas Cowboys',
  'New York Giants',
  'Philadelphia Eagles',
  'Washington Commanders',
  'Chicago Bears',
  'Detroit Lions',
  'Green Bay Packers',
  'Minnesota Vikings',
  'Atlanta Falcons',
  'Carolina Panthers',
  'New Orleans Saints',
  'Tampa Bay Buccaneers',
  'Arizona Cardinals',
  'Los Angeles Rams',
  'San Francisco 49ers',
  'Seattle Seahawks',
];

const abbreviations = [
  'BUF',
  'MIA',
  'NE',
  'NYJ',
  'BAL',
  'CIN',
  'CLE',
  'PIT',
  'HOU',
  'IND',
  'JAX',
  'TEN',
  'DEN',
  'KC',
  'LV',
  'LAC',
  'DAL',
  'NYG',
  'PHI',
  'WAS',
  'CHI',
  'DET',
  'GB',
  'MIN',
  'ATL',
  'CAR',
  'NO',
  'TB',
  'ARI',
  'LAR',
  'SF',
  'SEA',
];

const tierForRank = (rank: number) => {
  if (rank <= 5) return 'Elite contenders';
  if (rank <= 12) return 'Strong playoff contenders';
  if (rank <= 18) return 'In the mix';
  if (rank <= 24) return 'Fringe contenders';
  if (rank <= 29) return 'Still figuring it out';
  return 'Long shots';
};

export const powerRankingTeamFixtures: readonly PowerRankingTeam[] =
  teamNames.map((name, index) => ({
    id: `team-${String(index + 1)}`,
    name,
    abbreviation: abbreviations[index]!,
    conference: conferences[index % 2]!,
    division: divisions[index % 4]!,
  }));

export const powerRankingEntryFixtures: readonly PowerRankingEntry[] =
  powerRankingTeamFixtures.map((team, index) => {
    const rank = index + 1;
    return {
      id: `entry-${String(rank)}`,
      rank,
      previousRank: rank === 1 ? null : rank + 1,
      movement: rank === 1 ? null : 1,
      tier: tierForRank(rank),
      headline: `${team.name} headline for rank ${String(rank)}`,
      summary: `${team.name} is ranked #${String(rank)} heading into the season.`,
      strengths: [`${team.name} strength one`, `${team.name} strength two`],
      concerns: [`${team.name} concern one`],
      team,
    };
  });

export const powerRankingEditionFixture: PowerRankingEdition = {
  id: 'edition-2026-preseason',
  title: '2026 NFL Power Rankings',
  subtitle: '2nd & 15 Preseason Edition',
  season: 2026,
  edition: 'preseason',
  asOf: '2026-08-30',
  methodology:
    'Rankings weigh roster talent, coaching, and offseason moves as evaluated by the 2nd & 15 editorial staff.',
  sources: ['2nd & 15 editorial staff', 'https://example.com/methodology'],
  publishedAt: '2026-08-30T12:00:00.000Z',
  video: null,
};

export const powerRankingsDataFixture: PowerRankingsData = {
  edition: powerRankingEditionFixture,
  rankings: powerRankingEntryFixtures,
};

export const powerRankingEditionSummaryFixture: PowerRankingEditionSummary = {
  id: powerRankingEditionFixture.id,
  title: powerRankingEditionFixture.title,
  subtitle: powerRankingEditionFixture.subtitle,
  season: powerRankingEditionFixture.season,
  edition: powerRankingEditionFixture.edition,
  asOf: powerRankingEditionFixture.asOf,
  status: 'PUBLISHED',
  publishedAt: powerRankingEditionFixture.publishedAt,
};

export const adminPowerRankingEditionFixture: AdminPowerRankingEdition = {
  id: powerRankingEditionFixture.id,
  title: powerRankingEditionFixture.title,
  subtitle: powerRankingEditionFixture.subtitle,
  season: powerRankingEditionFixture.season,
  edition: powerRankingEditionFixture.edition,
  asOf: powerRankingEditionFixture.asOf,
  methodology: powerRankingEditionFixture.methodology,
  sources: powerRankingEditionFixture.sources,
  status: 'DRAFT',
  publishedAt: null,
  video: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

export const adminPowerRankingEntryFixtures: readonly AdminPowerRankingEntry[] =
  powerRankingEntryFixtures.map((entry) => ({
    id: entry.id!,
    rank: entry.rank,
    previousRank: entry.previousRank,
    movement: entry.movement,
    tier: entry.tier,
    headline: entry.headline,
    summary: entry.summary,
    strengths: entry.strengths,
    concerns: entry.concerns,
    team: entry.team,
  }));

export const adminPowerRankingEditionDetailFixture: AdminPowerRankingEditionDetail =
  {
    edition: adminPowerRankingEditionFixture,
    entries: adminPowerRankingEntryFixtures,
  };

export const powerRankingImportPreviewFixture: PowerRankingImportResult = {
  mode: 'PREVIEW',
  season: 2026,
  edition: 'preseason',
  asOf: '2026-08-30',
  foundCount: 32,
  matchedTeams: 32,
  errors: [],
  warnings: [],
};

export const powerRankingImportPreviewWithErrorsFixture: PowerRankingImportResult =
  {
    ...powerRankingImportPreviewFixture,
    matchedTeams: 31,
    errors: [
      { message: 'Unknown team abbreviation "XXX".', path: 'rankings[5].team' },
    ],
  };

export const powerRankingImportUpsertFixture: PowerRankingImportResult = {
  ...powerRankingImportPreviewFixture,
  mode: 'UPSERT',
  editionId: powerRankingEditionFixture.id,
};

export const validPowerRankingsImportJson = JSON.stringify({
  season: 2026,
  edition: 'preseason',
  asOf: '2026-08-30',
  rankings: powerRankingEntryFixtures.map((entry) => ({
    rank: entry.rank,
    team: entry.team.abbreviation,
    tier: entry.tier,
    headline: entry.headline,
    summary: entry.summary,
    strengths: entry.strengths,
    concerns: entry.concerns,
  })),
});
