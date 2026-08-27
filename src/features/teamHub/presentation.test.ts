import { groupTeams, teamGameResult } from '@/features/teamHub/presentation';
import { billsFixture, eaglesFixture } from '@/test/authFixtures';
import {
  recentTeamGameFixture,
  upcomingTeamGameFixture,
} from '@/test/teamHubFixtures';
import { hallOfFameGameFixture } from '@/test/gameFixtures';

describe('Team Hub presentation', () => {
  it('groups known conferences and divisions and alphabetizes teams', () => {
    const groups = groupTeams([eaglesFixture, billsFixture]);
    expect(groups.map((group) => group.conference)).toEqual(['AFC', 'NFC']);
    expect(groups[0].divisions.map((division) => division.division)).toEqual([
      'East',
      'North',
      'South',
      'West',
    ]);
    expect(groups[0].divisions[0].teams).toEqual([billsFixture]);
    expect(groups[1].divisions[0].teams).toEqual([eaglesFixture]);
  });

  it('derives results only from complete final scores for a participating team', () => {
    expect(teamGameResult(recentTeamGameFixture, billsFixture.id)).toBe('Win');
    expect(
      teamGameResult(
        { ...recentTeamGameFixture, awayScore: 17, homeScore: 17 },
        billsFixture.id,
      ),
    ).toBe('Tie');
    expect(teamGameResult(upcomingTeamGameFixture, billsFixture.id)).toBeNull();
    expect(
      teamGameResult(
        { ...recentTeamGameFixture, awayScore: null },
        billsFixture.id,
      ),
    ).toBeNull();
    expect(
      teamGameResult(
        recentTeamGameFixture,
        '99999999-9999-4999-8999-999999999999',
      ),
    ).toBeNull();
  });

  it('orients the Hall of Fame result for both participating teams', () => {
    expect(
      teamGameResult(hallOfFameGameFixture, hallOfFameGameFixture.awayTeam.id),
    ).toBe('Win');
    expect(
      teamGameResult(hallOfFameGameFixture, hallOfFameGameFixture.homeTeam.id),
    ).toBe('Loss');
  });
});
