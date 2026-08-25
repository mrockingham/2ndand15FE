import { billsFixture, eaglesFixture } from '@/test/authFixtures';
import type {
  DataHealthGameDetail,
  DataHealthGameRow,
  DataHealthProbeRecord,
  DataHealthProbeResult,
  DataHealthSummary,
} from '@/features/dataHealth/types';

const teamSummary = (team: typeof billsFixture) => ({
  id: team.id,
  abbreviation: team.abbreviation,
  name: team.fullName,
});

export const dataHealthCompleteGameFixture: DataHealthGameRow = {
  gameId: '10000000-0000-4000-8000-000000000001',
  season: 2026,
  seasonType: 'REG',
  week: 3,
  kickoff: '2026-09-21T17:00:00.000Z',
  status: 'FINAL',
  awayTeam: teamSummary(eaglesFixture),
  homeTeam: teamSummary(billsFixture),
  result: {
    state: 'COMPLETE',
    homeScore: 24,
    awayScore: 20,
    source: 'PROVIDER',
    reasonCode: 'RESULT_COMPLETE',
  },
  providerMapping: { available: true },
  teamStats: {
    state: 'COMPLETE',
    rowCount: 2,
    expectedRowCount: 2,
    reasonCode: 'TEAM_STATS_COMPLETE',
  },
  playerStats: {
    state: 'COMPLETE',
    rowCount: 77,
    playerCount: 77,
    reasonCode: 'PLAYER_STATS_COMPLETE',
  },
  plays: { state: 'COMPLETE', activeCount: 184, reviewRequired: false },
  lastProbe: null,
  needsInvestigation: false,
};

/**
 * A synthetic version of the "substantial partial" scenario described in the
 * product brief (illustrative real numbers, not a real backend fixture):
 * provider rows > resolved rows > persisted db rows.
 */
export const dataHealthPartialPlayerStatsGameFixture: DataHealthGameRow = {
  ...dataHealthCompleteGameFixture,
  gameId: '10000000-0000-4000-8000-000000000002',
  playerStats: {
    state: 'PARTIAL',
    rowCount: 67,
    playerCount: 67,
    reasonCode: 'PLAYER_IDENTITY_UNRESOLVED',
  },
  lastProbe: {
    checkedAt: '2026-09-21T18:30:00.000Z',
    providerReachable: true,
    playerStatsDiagnosis: 'PLAYER_IDENTITY_UNRESOLVED',
    teamStatsDiagnosis: 'TEAM_STATS_COMPLETE',
    resultDiagnosis: 'RESULT_COMPLETE',
    playsDiagnosis: 'PLAYS_COMPLETE',
  },
  needsInvestigation: true,
};

/** A synthetic "provider has no record of this matchup" scenario. */
export const dataHealthProviderUnavailableGameFixture: DataHealthGameRow = {
  ...dataHealthCompleteGameFixture,
  gameId: '10000000-0000-4000-8000-000000000003',
  result: {
    state: 'UNAVAILABLE',
    homeScore: null,
    awayScore: null,
    source: 'NONE',
    reasonCode: 'MISSING_PROVIDER_MAPPING',
  },
  providerMapping: { available: false },
  teamStats: {
    state: 'UNAVAILABLE',
    rowCount: 0,
    expectedRowCount: 2,
    reasonCode: 'MISSING_PROVIDER_MAPPING',
  },
  playerStats: {
    state: 'UNAVAILABLE',
    rowCount: 0,
    playerCount: 0,
    reasonCode: 'MISSING_PROVIDER_MAPPING',
  },
  plays: { state: 'UNAVAILABLE', activeCount: 0, reviewRequired: false },
  lastProbe: null,
  needsInvestigation: false,
};

/** A synthetic ingestion-gap scenario: provider has data, database does not. */
export const dataHealthMissingIngestionGameFixture: DataHealthGameRow = {
  ...dataHealthCompleteGameFixture,
  gameId: '10000000-0000-4000-8000-000000000004',
  playerStats: {
    state: 'MISSING',
    rowCount: 0,
    playerCount: 0,
    reasonCode: 'PROBE_REQUIRED',
  },
  lastProbe: {
    checkedAt: '2026-09-21T18:30:00.000Z',
    providerReachable: true,
    playerStatsDiagnosis: 'PROVIDER_HAS_PLAYER_STATS_DB_MISSING',
    teamStatsDiagnosis: 'TEAM_STATS_COMPLETE',
    resultDiagnosis: 'RESULT_COMPLETE',
    playsDiagnosis: 'PLAYS_COMPLETE',
  },
  needsInvestigation: true,
};

export const dataHealthPendingGameFixture: DataHealthGameRow = {
  ...dataHealthCompleteGameFixture,
  gameId: '10000000-0000-4000-8000-000000000005',
  status: 'SCHEDULED',
  result: {
    state: 'PENDING',
    homeScore: null,
    awayScore: null,
    source: 'NONE',
    reasonCode: 'RESULT_PENDING',
  },
  teamStats: {
    state: 'PENDING',
    rowCount: 0,
    expectedRowCount: 2,
    reasonCode: 'NOT_EXPECTED_YET',
  },
  playerStats: {
    state: 'PENDING',
    rowCount: 0,
    playerCount: 0,
    reasonCode: 'NOT_EXPECTED_YET',
  },
  plays: { state: 'PENDING', activeCount: 0, reviewRequired: false },
  needsInvestigation: false,
};

export const dataHealthSummaryFixture: DataHealthSummary = {
  games: 5,
  resultsComplete: 3,
  resultsMissing: 0,
  teamStatsComplete: 3,
  teamStatsMissing: 0,
  playerStatsComplete: 1,
  playerStatsMissing: 1,
  playsAvailable: 3,
  needsInvestigation: 2,
};

export const dataHealthGameListRowsFixture: readonly DataHealthGameRow[] = [
  dataHealthCompleteGameFixture,
  dataHealthPartialPlayerStatsGameFixture,
  dataHealthProviderUnavailableGameFixture,
  dataHealthMissingIngestionGameFixture,
  dataHealthPendingGameFixture,
];

export const dataHealthGameDetailFixture: DataHealthGameDetail = {
  gameId: dataHealthPartialPlayerStatsGameFixture.gameId,
  status: 'FINAL',
  homeScore: 24,
  awayScore: 20,
  hasResultFallback: false,
  providerMapping: { available: true },
  result: { state: 'COMPLETE', reasonCode: 'RESULT_COMPLETE' },
  teamStats: {
    state: 'COMPLETE',
    rowCount: 2,
    rows: [
      {
        teamId: billsFixture.id,
        isHome: true,
        sourceProvider: 'highlightly',
        sourceUpdatedAt: '2026-09-21T18:00:00.000Z',
      },
      {
        teamId: eaglesFixture.id,
        isHome: false,
        sourceProvider: 'highlightly',
        sourceUpdatedAt: '2026-09-21T18:00:00.000Z',
      },
    ],
    reasonCode: 'TEAM_STATS_COMPLETE',
  },
  playerStats: {
    state: 'PARTIAL',
    totalRows: 67,
    uniquePlayers: 67,
    homeRows: 34,
    awayRows: 33,
    latestSourceUpdatedAt: '2026-09-21T18:00:00.000Z',
    coverage: { providerRows: 82, resolvedRows: 67, unresolvedRows: 15 },
    reasonCode: 'PLAYER_IDENTITY_UNRESOLVED',
  },
  plays: {
    state: 'COMPLETE',
    activeCount: 184,
    supersededCount: 0,
    reviewRequired: false,
    blockedAt: null,
    blockReason: null,
  },
  poller: {
    schedulingClass: 'FINAL',
    lastAttemptAt: '2026-09-21T21:10:00.000Z',
    lastSuccessAt: '2026-09-21T21:10:00.000Z',
    nextPollAt: null,
    lastError: null,
  },
  lastProbe: {
    checkedAt: '2026-09-21T18:30:00.000Z',
    provider: 'highlightly',
    requestCount: 2,
    durationMs: 312,
    providerReachable: true,
    providerMatchFound: true,
    resultDiagnosis: 'RESULT_COMPLETE',
    teamStatsDiagnosis: 'TEAM_STATS_COMPLETE',
    playerStatsDiagnosis: 'PLAYER_IDENTITY_UNRESOLVED',
    playsDiagnosis: 'PLAYS_COMPLETE',
    errorCode: null,
  },
};

export const dataHealthProbeRecordFixture: DataHealthProbeRecord = {
  id: '20000000-0000-4000-8000-000000000001',
  checkedAt: '2026-09-21T18:30:00.000Z',
  requestCount: 2,
  durationMs: 312,
  providerReachable: true,
  providerMatchFound: true,
  quotaLimit: 7500,
  quotaRemaining: 6812,
  resultDiagnosis: 'RESULT_COMPLETE',
  teamStatsDiagnosis: 'TEAM_STATS_COMPLETE',
  playerStatsDiagnosis: 'PLAYER_IDENTITY_UNRESOLVED',
  playsDiagnosis: 'PLAYS_COMPLETE',
  providerTeamStatRows: 2,
  dbTeamStatRows: 2,
  providerPlayerStatRows: 82,
  normalizedPlayerStatRows: 82,
  resolvedPlayerCount: 67,
  unresolvedPlayerCount: 15,
  dbPlayerStatRows: 67,
  providerPlayCount: 184,
  dbPlayCount: 184,
  errorCode: null,
};

export const dataHealthProbeResultFixture: DataHealthProbeResult = {
  gameId: dataHealthPartialPlayerStatsGameFixture.gameId,
  checkedAt: '2026-09-21T19:00:00.000Z',
  provider: {
    reachable: true,
    matchFound: true,
    requestCount: 2,
    durationMs: 298,
    quotaLimit: 7500,
    quotaRemaining: 6810,
  },
  result: {
    providerAvailable: true,
    providerStatus: 'FINAL',
    scoreAvailable: true,
    diagnosis: 'RESULT_COMPLETE',
    explanation: 'The provider result matches what is stored.',
  },
  teamStats: {
    providerAvailable: true,
    rawRows: 2,
    normalizedRows: 2,
    databaseRows: 2,
    diagnosis: 'TEAM_STATS_COMPLETE',
    explanation:
      'Highlightly has team statistics and the database has 2 matching rows.',
  },
  playerStats: {
    providerAvailable: true,
    rawRows: 82,
    normalizedRows: 82,
    resolvedPlayers: 67,
    unresolvedPlayers: 15,
    databaseRows: 67,
    diagnosis: 'PLAYER_IDENTITY_UNRESOLVED',
    explanation:
      'Highlightly returned 82 player stat records, but not all could be tied to internal players without a full profile lookup (only 67 resolved via existing mappings). This probe does not fetch individual player profiles, so this count is an upper bound on unresolved players.',
  },
  plays: {
    providerAvailable: true,
    rawCount: 184,
    normalizedCount: 184,
    databaseActiveCount: 184,
    diagnosis: 'PLAYS_COMPLETE',
    explanation:
      'Highlightly returned 184 plays and the database has 184 active rows.',
  },
};
