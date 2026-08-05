import type { Game } from '@/features/games/types';

export const awayGameTeamFixture = {
  id: '11111111-1111-4111-8111-111111111111',
  fullName: 'Buffalo Bills',
  abbreviation: 'BUF',
  logoUrl: null,
  primaryColor: '#00338D',
  secondaryColor: '#C60C30',
} as const;

export const homeGameTeamFixture = {
  id: '22222222-2222-4222-8222-222222222222',
  fullName: 'Miami Dolphins',
  abbreviation: 'MIA',
  logoUrl: null,
  primaryColor: '#008E97',
  secondaryColor: '#FC4C02',
} as const;

export const gameFixture: Game = {
  id: '33333333-3333-4333-8333-333333333333',
  league: 'NFL',
  season: 2026,
  seasonType: 'REG',
  week: 16,
  startTime: '2026-12-20T18:00:00.000Z',
  status: 'SCHEDULED',
  awayTeam: awayGameTeamFixture,
  homeTeam: homeGameTeamFixture,
  awayScore: null,
  homeScore: null,
  quarter: null,
  clock: null,
  venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens' },
  broadcastNetwork: 'CBS',
  isNeutralSite: false,
};

export const tbdGameFixture: Game = {
  ...gameFixture,
  id: '44444444-4444-4444-8444-444444444444',
  startTime: null,
  awayTeam: homeGameTeamFixture,
  homeTeam: awayGameTeamFixture,
  venue: { name: null, city: null },
  broadcastNetwork: null,
};
