import {
  normalizeTeamDirectoryUrl,
  normalizeTeamHubUrlState,
  serializeTeamHubUrlState,
} from '@/features/teamHub/urlState';
import { statsMetadataFixture } from '@/test/statsHubFixtures';
import { teamHubOverviewFixture } from '@/test/teamHubFixtures';

describe('Team Hub URL state', () => {
  it('uses latest team coverage and metadata-driven leader defaults', () => {
    const state = normalizeTeamHubUrlState(
      new URLSearchParams(),
      teamHubOverviewFixture,
      statsMetadataFixture,
    );
    expect(state).toMatchObject({
      rosterSeason: 2025,
      leader: {
        season: 2025,
        seasonType: 'REG',
        category: 'PASSING',
        metric: 'passing_yards',
      },
    });
  });

  it('normalizes unsupported roster and leader state before query use', () => {
    const state = normalizeTeamHubUrlState(
      new URLSearchParams(
        'rosterSeason=2026&rosterPosition=RB&rosterPositionGroup=OFFENSE&rosterSearch=x&leaderSeason=2026&leaderType=BAD&leaderCategory=BAD&leaderMetric=bad&leaderPosition=RB',
      ),
      teamHubOverviewFixture,
      statsMetadataFixture,
    );
    expect(state).toMatchObject({
      rosterSeason: 2025,
      rosterPosition: undefined,
      rosterPositionGroup: undefined,
      rosterSearch: undefined,
      leader: {
        season: 2025,
        seasonType: 'REG',
        category: 'PASSING',
        metric: 'passing_yards',
        position: undefined,
      },
    });
    expect(serializeTeamHubUrlState(state).has('cursor')).toBe(false);
  });

  it('normalizes directory conference and division filters', () => {
    expect(
      normalizeTeamDirectoryUrl(
        new URLSearchParams('search=Bills&conference=BAD&division=East'),
      ),
    ).toEqual({ search: 'Bills', conference: 'ALL', division: 'East' });
  });
});
