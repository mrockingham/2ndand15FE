import {
  getTeamHub,
  getTeamRoster,
  getTeamStatLeaders,
} from '@/features/teamHub/api';
import { createApiClient } from '@/services/api/apiClient';
import { billsFixture } from '@/test/authFixtures';
import { playerAttributionFixture } from '@/test/playerFixtures';
import {
  seasonLeaderFixture,
  statsMetadataFixture,
} from '@/test/statsHubFixtures';
import {
  teamHubOverviewFixture,
  teamRosterRowFixture,
  teamRosterSemanticsFixture,
} from '@/test/teamHubFixtures';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Team Hub API', () => {
  it('uses the overview, roster, and team-leader paths with abort signals and opaque cursors', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        json({
          data: teamHubOverviewFixture,
          meta: { attribution: playerAttributionFixture },
        }),
      )
      .mockResolvedValueOnce(
        json({
          data: {
            team: billsFixture,
            season: 2025,
            roster: [teamRosterRowFixture],
          },
          meta: {
            nextCursor: 'opaque-roster',
            semantics: teamRosterSemanticsFixture,
            attribution: playerAttributionFixture,
          },
        }),
      )
      .mockResolvedValueOnce(
        json({
          data: [seasonLeaderFixture],
          meta: {
            nextCursor: 'opaque-leader',
            metric: statsMetadataFixture.metrics[0],
            attribution: playerAttributionFixture,
          },
        }),
      );
    const client = createApiClient({
      baseUrl: 'http://localhost/api/v1',
      fetchImplementation,
    });
    const controller = new AbortController();

    await getTeamHub(client, billsFixture.id, controller.signal);
    await getTeamRoster(
      client,
      billsFixture.id,
      {
        season: 2025,
        position: 'QB',
        positionGroup: 'QB',
        search: 'Alex',
        limit: 25,
      },
      controller.signal,
      'opaque-roster',
    );
    const leaders = await getTeamStatLeaders(
      client,
      billsFixture.id,
      {
        season: 2025,
        seasonType: 'REG_POST',
        metric: 'passing_yards',
        position: 'QB',
        limit: 25,
      },
      controller.signal,
      'opaque-leader',
    );

    const urls = fetchImplementation.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe(
      `http://localhost/api/v1/teams/${billsFixture.id}/hub`,
    );
    expect(urls[1]).toContain(`/teams/${billsFixture.id}/roster?`);
    expect(urls[1]).toContain('cursor=opaque-roster');
    expect(urls[2]).toContain(`/teams/${billsFixture.id}/stat-leaders?`);
    expect(urls[2]).toContain('seasonType=REG_POST');
    expect(urls[2]).not.toContain('teamId=');
    expect(leaders.rows).toEqual([seasonLeaderFixture]);
    expect(
      fetchImplementation.mock.calls.every(
        (call) => (call[1] as RequestInit).signal === controller.signal,
      ),
    ).toBe(true);
  });
});
