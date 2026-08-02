import { filterTeams, safeTeamColor } from '@/features/teams/teamPresentation';
import { billsFixture, eaglesFixture } from '@/test/authFixtures';

describe('team presentation utilities', () => {
  it('searches city, full name, team name, and abbreviation', () => {
    const teams = [billsFixture, eaglesFixture];

    expect(filterTeams(teams, 'Philadelphia Eagles', 'ALL')).toEqual([
      eaglesFixture,
    ]);
    expect(filterTeams(teams, 'BUF', 'ALL')).toEqual([billsFixture]);
    expect(filterTeams(teams, 'Buffalo', 'ALL')).toEqual([billsFixture]);
    expect(filterTeams(teams, 'Bills', 'ALL')).toEqual([billsFixture]);
  });

  it('filters conferences and rejects unsafe color values', () => {
    expect(filterTeams([billsFixture, eaglesFixture], '', 'NFC')).toEqual([
      eaglesFixture,
    ]);
    expect(safeTeamColor('#00338D', '#000000')).toBe('#00338D');
    expect(safeTeamColor('url(javascript:bad)', '#5B37EE')).toBe('#5B37EE');
  });
});
