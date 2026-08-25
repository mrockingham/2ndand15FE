import {
  deriveRowSeverity,
  derivePageScopedPlayerStatsCounts,
  describePlayerStatsDiagnosis,
  describePlaysDiagnosis,
  describeResultDiagnosis,
  describeTeamStatsDiagnosis,
  filterRowsByIssueType,
  formatCheckedAgo,
  formatQuota,
} from '@/features/dataHealth/presentation';
import {
  dataHealthGameListRowsFixture,
  dataHealthMissingIngestionGameFixture,
  dataHealthPartialPlayerStatsGameFixture,
  dataHealthProviderUnavailableGameFixture,
} from '@/test/dataHealthFixtures';

describe('diagnosis text maps', () => {
  it('covers every verified diagnosis code, including PROBE_REQUIRED, without falling back to a raw code', () => {
    expect(describeResultDiagnosis('PROBE_REQUIRED')).not.toBe(
      'PROBE_REQUIRED',
    );
    expect(describeTeamStatsDiagnosis('PROBE_REQUIRED')).not.toBe(
      'PROBE_REQUIRED',
    );
    expect(describePlayerStatsDiagnosis('PROBE_REQUIRED')).not.toBe(
      'PROBE_REQUIRED',
    );
    expect(describePlaysDiagnosis('PROBE_REQUIRED')).not.toBe('PROBE_REQUIRED');
  });

  it('never exposes a raw unrecognized code to the UI', () => {
    expect(describePlayerStatsDiagnosis('SOME_FUTURE_CODE')).not.toBe(
      'SOME_FUTURE_CODE',
    );
  });

  it('distinguishes an ingestion gap from unresolved identities in plain language', () => {
    const ingestionGap = describePlayerStatsDiagnosis(
      'PROVIDER_HAS_PLAYER_STATS_DB_MISSING',
    );
    const unresolved = describePlayerStatsDiagnosis(
      'PLAYER_IDENTITY_UNRESOLVED',
    );
    expect(ingestionGap).not.toBe(unresolved);
    expect(ingestionGap.toLowerCase()).toContain('database');
    expect(unresolved.toLowerCase()).toContain('match');
  });
});

describe('derivePageScopedPlayerStatsCounts', () => {
  it('counts partial, unavailable, and pending states from the current page only', () => {
    const counts = derivePageScopedPlayerStatsCounts(
      dataHealthGameListRowsFixture,
    );
    expect(counts).toEqual({
      partial: 1,
      unavailable: 1,
      pending: 1,
      unknown: 0,
    });
  });
});

describe('filterRowsByIssueType', () => {
  it('returns every row for the empty/All filter', () => {
    expect(
      filterRowsByIssueType(dataHealthGameListRowsFixture, ''),
    ).toHaveLength(5);
  });

  it('filters to rows with non-complete player stats', () => {
    const result = filterRowsByIssueType(
      dataHealthGameListRowsFixture,
      'playerStats',
    );
    expect(result.map((row) => row.gameId)).not.toContain(
      dataHealthGameListRowsFixture[0]!.gameId,
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters to rows with a missing provider mapping', () => {
    const result = filterRowsByIssueType(
      dataHealthGameListRowsFixture,
      'providerMapping',
    );
    expect(result).toEqual([dataHealthProviderUnavailableGameFixture]);
  });

  it('filters to rows flagged as identity-resolution issues', () => {
    const result = filterRowsByIssueType(
      dataHealthGameListRowsFixture,
      'identityResolution',
    );
    expect(result).toEqual([dataHealthPartialPlayerStatsGameFixture]);
  });
});

describe('deriveRowSeverity', () => {
  it('treats a provider-has-data/db-missing diagnosis as high severity', () => {
    expect(deriveRowSeverity(dataHealthMissingIngestionGameFixture)).toBe(
      'high',
    );
  });

  it('treats unresolved player identities as medium severity', () => {
    expect(deriveRowSeverity(dataHealthPartialPlayerStatsGameFixture)).toBe(
      'medium',
    );
  });

  it('treats a provider-unavailable game as informational, not high severity', () => {
    expect(deriveRowSeverity(dataHealthProviderUnavailableGameFixture)).toBe(
      'informational',
    );
  });

  it('has no severity for a fully complete game', () => {
    expect(deriveRowSeverity(dataHealthGameListRowsFixture[0]!)).toBe(null);
  });
});

describe('formatQuota', () => {
  it('formats remaining/limit with thousands separators', () => {
    expect(formatQuota(7500, 6812)).toBe('6,812 / 7,500 remaining');
  });

  it('reports unknown quota without inventing numbers', () => {
    expect(formatQuota(null, null)).toBe('Not reported by the provider');
  });
});

describe('formatCheckedAgo', () => {
  const now = new Date('2026-09-21T19:00:00.000Z').getTime();

  it('shows "Just now" for a very recent check', () => {
    expect(formatCheckedAgo('2026-09-21T18:59:45.000Z', now)).toBe('Just now');
  });

  it('shows minutes for a recent check', () => {
    expect(formatCheckedAgo('2026-09-21T18:42:00.000Z', now)).toBe('18m ago');
  });

  it('shows hours for an older check', () => {
    expect(formatCheckedAgo('2026-09-21T15:00:00.000Z', now)).toBe('4h ago');
  });

  it('shows days for a much older check', () => {
    expect(formatCheckedAgo('2026-09-18T19:00:00.000Z', now)).toBe('3d ago');
  });
});
