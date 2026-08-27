import type { TeamHubOverview, TeamRosterRow } from '@/features/teamHub/types';
import { publicArticleFixture } from '@/test/articleFixtures';
import { billsFixture, eaglesFixture } from '@/test/authFixtures';
import { gameFixture, homeGameTeamFixture } from '@/test/gameFixtures';
import { quarterbackFixture } from '@/test/playerFixtures';

const billsGameTeam = {
  id: billsFixture.id,
  fullName: billsFixture.fullName,
  abbreviation: billsFixture.abbreviation,
  logoUrl: billsFixture.logoUrl,
  primaryColor: billsFixture.primaryColor,
  secondaryColor: billsFixture.secondaryColor,
};

export const upcomingTeamGameFixture = {
  ...gameFixture,
  awayTeam: billsGameTeam,
  homeTeam: homeGameTeamFixture,
};

export const recentTeamGameFixture = {
  ...gameFixture,
  id: '77777777-7777-4777-8777-777777777777',
  startTime: '2026-01-04T18:00:00.000Z',
  status: 'FINAL' as const,
  awayTeam: billsGameTeam,
  homeTeam: homeGameTeamFixture,
  awayScore: 24,
  homeScore: 17,
};

export const teamHubOverviewFixture: TeamHubOverview = {
  team: billsFixture,
  schedule: {
    season: 2026,
    upcoming: [upcomingTeamGameFixture],
    recent: [recentTeamGameFixture],
  },
  news: { articles: [publicArticleFixture] },
  historicalData: {
    defaultSeason: 2025,
    rosterSeasons: [2024, 2025],
    statSeasons: [2024, 2025],
    positions: ['QB', 'WR'],
    positionGroups: ['QB', 'WR'],
    coverageNotes: [
      'Historical roster and player-stat coverage reflects imported nflverse data only.',
      'No current 2026 roster membership or live 2026 player statistics are inferred.',
    ],
  },
};

export const teamRosterRowFixture: TeamRosterRow = {
  player: {
    id: quarterbackFixture.id,
    displayName: quarterbackFixture.displayName,
    headshotUrl: quarterbackFixture.headshotUrl,
  },
  season: 2025,
  historicalTeam: {
    id: billsFixture.id,
    abbreviation: billsFixture.abbreviation,
    fullName: billsFixture.fullName,
  },
  latestKnownTeam: {
    id: eaglesFixture.id,
    abbreviation: eaglesFixture.abbreviation,
    fullName: eaglesFixture.fullName,
  },
  position: 'QB',
  positionGroup: 'QB',
  jerseyNumber: 0,
  status: null,
  firstWeek: 1,
  lastWeek: 18,
  rosterWeekCount: 17,
};

export const teamRosterSemanticsFixture = {
  membership:
    'A player appears when at least one stored weekly roster record links the player to this team and season.',
  firstWeek: 'Earliest stored roster week for the selected team and season.',
  lastWeek: 'Latest stored roster week for the selected team and season.',
  latestKnownTeam:
    'Latest team in the imported player profile; it is not current-season roster proof.',
} as const;
