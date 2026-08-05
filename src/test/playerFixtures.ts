import type {
  Player,
  PlayerAttribution,
  PlayerGameStat,
  PlayerSeasonStat,
} from '@/features/players/types';

export const playerAttributionFixture: PlayerAttribution = {
  source: 'nflverse',
  license: 'CC BY 4.0',
  url: 'https://github.com/nflverse/nflverse-data',
};

export const playerTeamFixture = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  abbreviation: 'BUF',
  fullName: 'Buffalo Bills',
} as const;

export const quarterbackFixture: Player = {
  id: '11111111-1111-4111-8111-111111111111',
  displayName: 'Alex Quarterback',
  firstName: 'Alex',
  lastName: 'Quarterback',
  shortName: 'A. Quarterback',
  position: 'QB',
  positionGroup: 'QB',
  birthDate: '1996-05-21',
  heightInches: 77,
  weightPounds: 237,
  college: 'Wyoming',
  rookieSeason: 2018,
  lastSeason: 2025,
  draft: { year: 2018, round: 1, pick: 7 },
  latestTeam: playerTeamFixture,
  jerseyNumber: 17,
  status: 'ACT',
  headshotUrl: 'https://example.com/alex.png',
};

export const receiverFixture: Player = {
  ...quarterbackFixture,
  id: '22222222-2222-4222-8222-222222222222',
  displayName: 'Riley Receiver',
  firstName: 'Riley',
  lastName: 'Receiver',
  shortName: null,
  position: 'WR',
  positionGroup: 'WR',
  birthDate: null,
  heightInches: null,
  weightPounds: null,
  college: null,
  rookieSeason: null,
  draft: null,
  jerseyNumber: 0,
  headshotUrl: 'javascript:alert(1)',
};

const emptyPassing = {
  completions: null,
  attempts: null,
  yards: null,
  touchdowns: null,
  interceptions: null,
  sacksSuffered: null,
  sackYardsLost: null,
  airYards: null,
  yardsAfterCatch: null,
  firstDowns: null,
  epa: null,
  twoPointConversions: null,
} as const;

const emptyRushing = {
  carries: null,
  yards: null,
  touchdowns: null,
  firstDowns: null,
  epa: null,
  fumbles: null,
  fumblesLost: null,
  twoPointConversions: null,
} as const;

const emptyReceiving = {
  targets: null,
  receptions: null,
  yards: null,
  touchdowns: null,
  airYards: null,
  yardsAfterCatch: null,
  firstDowns: null,
  epa: null,
  targetShare: null,
  twoPointConversions: null,
} as const;

const emptyDefense = {
  tacklesSolo: null,
  tacklesWithAssist: null,
  tackleAssists: null,
  tacklesForLoss: null,
  sacks: null,
  sackYards: null,
  quarterbackHits: null,
  interceptions: null,
  interceptionYards: null,
  passesDefended: null,
  forcedFumbles: null,
  fumbleRecoveries: null,
  touchdowns: null,
} as const;

const emptyKicking = {
  fieldGoalsMade: null,
  fieldGoalsAttempted: null,
  extraPointsMade: null,
  extraPointsAttempted: null,
  punts: null,
  puntYards: null,
} as const;

export const quarterbackGameFixture: PlayerGameStat = {
  id: '33333333-3333-4333-8333-333333333333',
  gameId: '44444444-4444-4444-8444-444444444444',
  season: 2025,
  week: 1,
  seasonType: 'REG',
  startTime: null,
  team: { id: playerTeamFixture.id, abbreviation: 'BUF' },
  opponent: {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    abbreviation: 'NYJ',
  },
  position: 'QB',
  positionGroup: 'QB',
  passing: {
    ...emptyPassing,
    completions: 0,
    attempts: 0,
    yards: 0,
    touchdowns: 0,
    interceptions: null,
  },
  rushing: emptyRushing,
  receiving: emptyReceiving,
  defense: emptyDefense,
  kicking: emptyKicking,
  returns: {
    puntReturnYards: null,
    puntReturnTouchdowns: null,
    kickoffReturnYards: null,
    specialTeamsTouchdowns: null,
  },
  fantasy: { standard: 0, ppr: 0 },
};

export const quarterbackSeasonFixture: PlayerSeasonStat = {
  id: '55555555-5555-4555-8555-555555555555',
  season: 2025,
  summaryType: 'REG_POST',
  position: 'QB',
  positionGroup: 'QB',
  games: 1,
  teamCount: 1,
  passing: {
    completions: 0,
    attempts: 0,
    yards: 0,
    touchdowns: 0,
    interceptions: null,
  },
  rushing: { carries: null, yards: null, touchdowns: null },
  receiving: {
    targets: null,
    receptions: null,
    yards: null,
    touchdowns: null,
  },
  defense: {
    tacklesSolo: null,
    tackleAssists: null,
    sacks: null,
    interceptions: null,
    forcedFumbles: null,
    touchdowns: null,
  },
  kicking: emptyKicking,
  fantasy: { standard: 0, ppr: null },
};

export const receiverSeasonFixture: PlayerSeasonStat = {
  ...quarterbackSeasonFixture,
  id: '66666666-6666-4666-8666-666666666666',
  position: 'WR',
  positionGroup: 'WR',
  passing: {
    completions: null,
    attempts: null,
    yards: null,
    touchdowns: null,
    interceptions: null,
  },
  receiving: {
    targets: 10,
    receptions: 0,
    yards: 120,
    touchdowns: 1,
  },
  fantasy: { standard: null, ppr: null },
};
