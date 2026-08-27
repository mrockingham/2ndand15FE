import { getTeamHubErrorMessage } from '@/features/teamHub/errors';
import { teamHubKeys } from '@/features/teamHub/queryKeys';
import { ApiError } from '@/services/api/apiClient';
import { billsFixture } from '@/test/authFixtures';

describe('Team Hub query keys and errors', () => {
  it('normalizes roster and leader filters into deterministic separate families', () => {
    expect(
      teamHubKeys.roster(billsFixture.id, {
        season: 2025,
        position: ' qb ',
        positionGroup: ' qb ',
        search: ' Alex ',
        limit: 25,
      }),
    ).toEqual([
      'teamHub',
      'roster',
      billsFixture.id,
      {
        season: 2025,
        position: 'QB',
        positionGroup: 'QB',
        search: 'Alex',
        limit: 25,
      },
    ]);
    expect(
      teamHubKeys.leader(billsFixture.id, {
        season: 2025,
        seasonType: 'REG_POST',
        metric: 'passing_yards',
        position: ' qb ',
        limit: 25,
      }),
    ).toEqual([
      'teamHub',
      'leaders',
      billsFixture.id,
      {
        season: 2025,
        seasonType: 'REG_POST',
        metric: 'passing_yards',
        position: 'QB',
        positionGroup: undefined,
        limit: 25,
      },
    ]);
  });

  it('maps stable roster, leader, rate-limit, network, and server errors without raw details', () => {
    expect(
      getTeamHubErrorMessage(
        new ApiError(400, 'raw', { code: 'TEAM_ROSTER_INVALID_CURSOR' }),
      ),
    ).toMatch(/expired/i);
    expect(
      getTeamHubErrorMessage(
        new ApiError(400, 'raw', { code: 'STATS_SEASON_NOT_AVAILABLE' }),
      ),
    ).toMatch(/unavailable/i);
    expect(getTeamHubErrorMessage(new ApiError(429, 'raw'))).toMatch(
      /limited/i,
    );
    expect(getTeamHubErrorMessage(new ApiError(0, 'raw'))).toMatch(
      /connection/i,
    );
    expect(getTeamHubErrorMessage(new ApiError(500, 'raw'))).toMatch(/server/i);
    expect(getTeamHubErrorMessage(new Error('raw'))).not.toContain('raw');
  });
});
