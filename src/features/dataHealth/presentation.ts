import type {
  DataHealthCoverageState,
  DataHealthGameRow,
  PlayerStatsDiagnosisCode,
  PlaysDiagnosisCode,
  ResultDiagnosisCode,
  TeamStatsDiagnosisCode,
} from '@/features/dataHealth/types';

export const coverageStateLabel: Readonly<
  Record<DataHealthCoverageState, string>
> = {
  COMPLETE: 'Complete',
  PARTIAL: 'Partial',
  MISSING: 'Missing',
  PENDING: 'Pending',
  UNAVAILABLE: 'Unavailable',
  UNKNOWN: 'Unknown',
};

export type CoverageStateColor =
  'success' | 'warning' | 'error' | 'info' | 'default';

export const coverageStateColor: Readonly<
  Record<DataHealthCoverageState, CoverageStateColor>
> = {
  COMPLETE: 'success',
  PARTIAL: 'warning',
  MISSING: 'error',
  PENDING: 'info',
  UNAVAILABLE: 'default',
  UNKNOWN: 'default',
};

const UNKNOWN_DIAGNOSIS_TEXT = 'Needs review — contact engineering.';

const resultDiagnosisText: Readonly<Record<ResultDiagnosisCode, string>> = {
  RESULT_COMPLETE: 'The database has the final result.',
  RESULT_PENDING: 'A result is not expected yet at this stage of the game.',
  PROVIDER_RESULT_MISSING: 'Highlightly has not reported a usable game state.',
  RESULT_USING_EDITORIAL_FALLBACK: 'An editorial result fallback is in effect.',
  RESULT_CONFLICT:
    'The provider result disagrees with what is stored; the stored value was not changed.',
  PROVIDER_HAS_RESULT_DB_MISSING:
    'Highlightly has a final score the database does not have yet.',
  PROVIDER_REQUEST_FAILED: 'The last provider check failed.',
  MISSING_PROVIDER_MAPPING: 'This game is not mapped to the provider.',
  PROBE_REQUIRED:
    "Highlightly hasn't been checked yet — run a check to learn more.",
};

const teamStatsDiagnosisText: Readonly<Record<TeamStatsDiagnosisCode, string>> =
  {
    NOT_EXPECTED_YET: 'Team statistics are not expected yet at this stage.',
    MISSING_PROVIDER_MAPPING: 'This game is not mapped to the provider.',
    PROVIDER_NO_TEAM_STATS:
      'Highlightly has not published team statistics yet.',
    PROVIDER_HAS_TEAM_STATS_DB_MISSING:
      'Highlightly has team statistics, but the database is missing them.',
    DB_TEAM_STATS_PARTIAL:
      'Stored team-stat rows are incomplete or missing core fields.',
    TEAM_STATS_COMPLETE: 'Team-stat coverage matches the provider.',
    PROVIDER_REQUEST_FAILED: 'The last provider check failed.',
    PROBE_REQUIRED:
      "Highlightly hasn't been checked yet — run a check to learn more.",
  };

const playerStatsDiagnosisText: Readonly<
  Record<PlayerStatsDiagnosisCode, string>
> = {
  NOT_EXPECTED_YET: 'Player statistics are not expected yet at this stage.',
  MISSING_PROVIDER_MAPPING: 'This game is not mapped to the provider.',
  PROVIDER_NO_PLAYER_STATS:
    'Highlightly has not published player statistics yet.',
  PROVIDER_HAS_PLAYER_STATS_DB_MISSING:
    'Highlightly has player statistics, but the database is missing them.',
  PLAYER_IDENTITY_UNRESOLVED:
    'Some provider players could not be matched confidently to internal players.',
  DB_PLAYER_STATS_PARTIAL:
    'Highlightly has more resolvable coverage than is currently persisted.',
  PLAYER_STATS_COMPLETE: 'Player-stat coverage matches the provider.',
  PROVIDER_REQUEST_FAILED: 'The last provider check failed.',
  PROBE_REQUIRED:
    "Highlightly hasn't been checked yet — run a check to learn more.",
};

const playsDiagnosisText: Readonly<Record<PlaysDiagnosisCode, string>> = {
  PLAYS_PENDING: 'Plays are not expected yet at this stage.',
  MISSING_PROVIDER_MAPPING: 'This game is not mapped to the provider.',
  PROVIDER_NO_PLAYS: 'Highlightly has not published plays yet.',
  PROVIDER_HAS_PLAYS_DB_MISSING:
    'Highlightly has plays, but the database is missing them.',
  PLAYS_PARTIAL: 'Some plays are stored, but coverage is incomplete.',
  PLAYS_COMPLETE: 'Play coverage matches the provider.',
  PLAYS_REVIEW_REQUIRED:
    'Play reconciliation is blocked and needs operator review.',
  PROVIDER_REQUEST_FAILED: 'The last provider check failed.',
  PROBE_REQUIRED:
    "Highlightly hasn't been checked yet — run a check to learn more.",
};

export const describeResultDiagnosis = (code: string): string =>
  resultDiagnosisText[code as ResultDiagnosisCode] ?? UNKNOWN_DIAGNOSIS_TEXT;

export const describeTeamStatsDiagnosis = (code: string): string =>
  teamStatsDiagnosisText[code as TeamStatsDiagnosisCode] ??
  UNKNOWN_DIAGNOSIS_TEXT;

export const describePlayerStatsDiagnosis = (code: string): string =>
  playerStatsDiagnosisText[code as PlayerStatsDiagnosisCode] ??
  UNKNOWN_DIAGNOSIS_TEXT;

export const describePlaysDiagnosis = (code: string): string =>
  playsDiagnosisText[code as PlaysDiagnosisCode] ?? UNKNOWN_DIAGNOSIS_TEXT;

export interface PageScopedStateCounts {
  readonly partial: number;
  readonly unavailable: number;
  readonly pending: number;
  readonly unknown: number;
}

const countByState = (
  states: readonly DataHealthCoverageState[],
): PageScopedStateCounts => ({
  partial: states.filter((state) => state === 'PARTIAL').length,
  unavailable: states.filter((state) => state === 'UNAVAILABLE').length,
  pending: states.filter((state) => state === 'PENDING').length,
  unknown: states.filter((state) => state === 'UNKNOWN').length,
});

export const derivePageScopedPlayerStatsCounts = (
  rows: readonly DataHealthGameRow[],
): PageScopedStateCounts =>
  countByState(rows.map((row) => row.playerStats.state));

export const derivePageScopedResultCounts = (
  rows: readonly DataHealthGameRow[],
): PageScopedStateCounts => countByState(rows.map((row) => row.result.state));

export const derivePageScopedTeamStatsCounts = (
  rows: readonly DataHealthGameRow[],
): PageScopedStateCounts =>
  countByState(rows.map((row) => row.teamStats.state));

export const formatQuota = (
  limit: number | null,
  remaining: number | null,
): string => {
  if (limit === null || remaining === null)
    return 'Not reported by the provider';
  return `${remaining.toLocaleString()} / ${limit.toLocaleString()} remaining`;
};

export type DataHealthIssueType =
  | ''
  | 'result'
  | 'teamStats'
  | 'playerStats'
  | 'plays'
  | 'providerMapping'
  | 'providerFailure'
  | 'identityResolution';

export const issueTypeOptions: readonly {
  readonly value: DataHealthIssueType;
  readonly label: string;
}[] = [
  { value: '', label: 'All' },
  { value: 'result', label: 'Missing Result' },
  { value: 'teamStats', label: 'Team Stats' },
  { value: 'playerStats', label: 'Player Stats' },
  { value: 'plays', label: 'Play-by-Play' },
  { value: 'providerMapping', label: 'Provider Mapping' },
  { value: 'providerFailure', label: 'Provider Failure' },
  { value: 'identityResolution', label: 'Identity Resolution' },
];

/**
 * Purely a client-side refinement over the current page's rows -- the backend
 * only exposes `issuesOnly`, not a category breakdown, so this never becomes
 * an extra request and is explicitly scoped to whatever page is loaded.
 */
export const filterRowsByIssueType = (
  rows: readonly DataHealthGameRow[],
  issueType: DataHealthIssueType,
): readonly DataHealthGameRow[] => {
  switch (issueType) {
    case '':
      return rows;
    case 'result':
      return rows.filter((row) => row.result.state !== 'COMPLETE');
    case 'teamStats':
      return rows.filter((row) => row.teamStats.state !== 'COMPLETE');
    case 'playerStats':
      return rows.filter((row) => row.playerStats.state !== 'COMPLETE');
    case 'plays':
      return rows.filter((row) => row.plays.state !== 'COMPLETE');
    case 'providerMapping':
      return rows.filter((row) => !row.providerMapping.available);
    case 'providerFailure':
      return rows.filter(
        (row) =>
          row.lastProbe?.resultDiagnosis === 'PROVIDER_REQUEST_FAILED' ||
          row.lastProbe?.teamStatsDiagnosis === 'PROVIDER_REQUEST_FAILED' ||
          row.lastProbe?.playerStatsDiagnosis === 'PROVIDER_REQUEST_FAILED' ||
          row.lastProbe?.playsDiagnosis === 'PROVIDER_REQUEST_FAILED',
      );
    case 'identityResolution':
      return rows.filter(
        (row) => row.playerStats.reasonCode === 'PLAYER_IDENTITY_UNRESOLVED',
      );
  }
};

export type DataHealthRowSeverity = 'high' | 'medium' | 'informational' | null;

/** A best-effort visual priority signal, not an alerting system -- built only
 * from fields already returned by the games-overview row. */
export const deriveRowSeverity = (
  row: DataHealthGameRow,
): DataHealthRowSeverity => {
  const probeDiagnoses =
    row.lastProbe === null
      ? []
      : [
          row.lastProbe.resultDiagnosis,
          row.lastProbe.teamStatsDiagnosis,
          row.lastProbe.playerStatsDiagnosis,
          row.lastProbe.playsDiagnosis,
        ];

  if (row.plays.reviewRequired) return 'high';
  if (probeDiagnoses.includes('RESULT_CONFLICT')) return 'high';
  if (probeDiagnoses.includes('PROVIDER_HAS_RESULT_DB_MISSING')) return 'high';
  if (probeDiagnoses.includes('PROVIDER_HAS_TEAM_STATS_DB_MISSING'))
    return 'high';
  if (probeDiagnoses.includes('PROVIDER_HAS_PLAYER_STATS_DB_MISSING'))
    return 'high';
  if (probeDiagnoses.includes('PROVIDER_HAS_PLAYS_DB_MISSING')) return 'high';
  if (probeDiagnoses.includes('PROVIDER_REQUEST_FAILED')) return 'high';

  if (row.playerStats.state === 'PARTIAL') return 'medium';
  if (row.teamStats.state === 'PARTIAL') return 'medium';

  if (
    row.result.state === 'UNAVAILABLE' ||
    row.teamStats.state === 'UNAVAILABLE' ||
    row.playerStats.state === 'UNAVAILABLE' ||
    row.plays.state === 'UNAVAILABLE'
  ) {
    return 'informational';
  }
  if (
    row.result.state === 'PENDING' ||
    row.teamStats.state === 'PENDING' ||
    row.playerStats.state === 'PENDING'
  ) {
    return 'informational';
  }
  return null;
};

export const formatCheckedAgo = (
  checkedAt: string,
  now = Date.now(),
): string => {
  const checkedAtMs = new Date(checkedAt).getTime();
  if (Number.isNaN(checkedAtMs)) return 'Unknown';
  const ageMs = Math.max(0, now - checkedAtMs);
  if (ageMs < 60_000) return 'Just now';
  const minutes = Math.round(ageMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};
