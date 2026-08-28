import type {
  StandingTeam,
  StandingsGroup,
  StandingsResponse,
  StandingsSeasonType,
  StandingsView,
} from '@/features/standings/types';

const divisions = {
  AFC: {
    East: [
      ['Buffalo Bills', 'BUF'],
      ['New York Jets', 'NYJ'],
      ['New England Patriots', 'NE'],
      ['Miami Dolphins', 'MIA'],
    ],
    North: [
      ['Cincinnati Bengals', 'CIN'],
      ['Baltimore Ravens', 'BAL'],
      ['Cleveland Browns', 'CLE'],
      ['Pittsburgh Steelers', 'PIT'],
    ],
    South: [
      ['Tennessee Titans', 'TEN'],
      ['Jacksonville Jaguars', 'JAX'],
      ['Indianapolis Colts', 'IND'],
      ['Houston Texans', 'HOU'],
    ],
    West: [
      ['Denver Broncos', 'DEN'],
      ['Los Angeles Chargers', 'LAC'],
      ['Las Vegas Raiders', 'LV'],
      ['Kansas City Chiefs', 'KC'],
    ],
  },
  NFC: {
    East: [
      ['Philadelphia Eagles', 'PHI'],
      ['Dallas Cowboys', 'DAL'],
      ['New York Giants', 'NYG'],
      ['Washington Commanders', 'WAS'],
    ],
    North: [
      ['Green Bay Packers', 'GB'],
      ['Chicago Bears', 'CHI'],
      ['Detroit Lions', 'DET'],
      ['Minnesota Vikings', 'MIN'],
    ],
    South: [
      ['Tampa Bay Buccaneers', 'TB'],
      ['Carolina Panthers', 'CAR'],
      ['Atlanta Falcons', 'ATL'],
      ['New Orleans Saints', 'NO'],
    ],
    West: [
      ['Seattle Seahawks', 'SEA'],
      ['Los Angeles Rams', 'LAR'],
      ['San Francisco 49ers', 'SF'],
      ['Arizona Cardinals', 'ARI'],
    ],
  },
} as const;

const divisionNames = ['East', 'North', 'South', 'West'] as const;

const makeTeam = (
  name: string,
  abbreviation: string,
  conference: 'AFC' | 'NFC',
  division: StandingTeam['division'],
  index: number,
  season: number,
  seasonType: StandingsSeasonType,
): StandingTeam => ({
  teamId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  name,
  abbreviation,
  conference,
  division,
  season,
  seasonType,
  wins: index === 0 ? 3 : Math.max(0, 2 - (index % 3)),
  losses: index === 0 ? 0 : index % 3,
  ties: index === 2 ? 1 : 0,
  winPercentage: index === 0 ? 1 : index === 1 ? 0.5 : 0.333,
  homeWins: index === 3 ? null : 1,
  homeLosses: index === 3 ? null : 0,
  homeTies: index === 3 ? null : index === 2 ? 1 : 0,
  awayWins: 1,
  awayLosses: 1,
  awayTies: 0,
  divisionWins: 0,
  divisionLosses: 0,
  divisionTies: 0,
  conferenceWins: 1,
  conferenceLosses: 0,
  conferenceTies: 0,
  nonConferenceWins: null,
  nonConferenceLosses: null,
  nonConferenceTies: null,
  pointsFor: index === 2 ? null : 88 - index,
  pointsAgainst: 48 + index,
  pointDifferential: index === 0 ? 40 : index === 1 ? -21 : 0,
  streakType: index === 0 ? 'W' : 'L',
  streakLength: index === 0 ? 3 : 1,
  streakDisplay: index === 0 ? 'W3' : 'L1',
  lastFiveWins: null,
  lastFiveLosses: null,
  lastFiveTies: null,
  lastFiveDisplay: null,
  conferenceRank: (index % 16) + 1,
  playoffSeed: (index % 16) + 1,
  divisionRank: null,
  leagueRank: null,
  clinchedCode: null,
  eliminated: null,
});

const allTeams = (season: number, type: StandingsSeasonType) => {
  let index = 0;
  return (['AFC', 'NFC'] as const).flatMap((conference) =>
    divisionNames.flatMap((division) =>
      divisions[conference][division].map(([name, abbreviation]) =>
        makeTeam(
          name,
          abbreviation,
          conference,
          division,
          index++,
          season,
          type,
        ),
      ),
    ),
  );
};

const groupsFor = (
  view: StandingsView,
  season: number,
  seasonType: StandingsSeasonType,
): readonly StandingsGroup[] => {
  const teams = allTeams(season, seasonType);
  if (view === 'league')
    return [{ key: 'NFL', label: 'National Football League', teams }];
  return (['AFC', 'NFC'] as const).map((conference) => ({
    key: conference,
    label:
      conference === 'AFC'
        ? 'American Football Conference'
        : 'National Football Conference',
    ...(view === 'conference'
      ? { teams: teams.filter((team) => team.conference === conference) }
      : {
          children: divisionNames.map((division) => ({
            key: `${conference}_${division.toUpperCase()}`,
            label: `${conference} ${division}`,
            teams: teams.filter(
              (team) =>
                team.conference === conference && team.division === division,
            ),
          })),
        }),
  }));
};

export const standingsResponseFixture = (
  view: StandingsView = 'division',
  season = 2026,
  seasonType: StandingsSeasonType = season === 2025 ? 'REG' : 'PRE',
): StandingsResponse => ({
  data: {
    season,
    seasonType,
    view,
    groups: groupsFor(view, season, seasonType),
  },
  meta: {
    availableViews: ['division', 'conference', 'league'],
    availableSeasonTypes: [seasonType],
    provider: 'highlightly',
    updatedAt: '2026-08-28T19:11:00.301Z',
  },
});
