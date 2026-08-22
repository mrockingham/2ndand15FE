import { awayGameTeamFixture, homeGameTeamFixture } from '@/test/gameFixtures';
import type { GamePlay, GameTeamStats } from '@/features/games/types';

export const scoringPlayFixture: GamePlay = {
  id: '10000000-0000-4000-8000-000000000001',
  sequence: 1,
  period: 1,
  clock: '12:34',
  possessionTeam: awayGameTeamFixture,
  type: 'PASS',
  description: `${awayGameTeamFixture.abbreviation} pass complete for 12 yards, touchdown`,
  start: { down: 3, distance: 7, yardLine: 88 },
  end: { down: null, distance: null, yardLine: 100 },
  flags: { scoring: true, penalty: false, turnover: false },
};

export const turnoverPlayFixture: GamePlay = {
  id: '10000000-0000-4000-8000-000000000002',
  sequence: 2,
  period: 2,
  clock: '08:12',
  possessionTeam: homeGameTeamFixture,
  type: 'INTERCEPTION',
  description: `${homeGameTeamFixture.abbreviation} pass intercepted`,
  start: { down: 2, distance: 10, yardLine: 45 },
  end: { down: 1, distance: 10, yardLine: 55 },
  flags: { scoring: false, penalty: false, turnover: true },
};

export const penaltyPlayFixture: GamePlay = {
  id: '10000000-0000-4000-8000-000000000003',
  sequence: 3,
  period: 2,
  clock: '05:47',
  possessionTeam: awayGameTeamFixture,
  type: 'PENALTY',
  description: 'Holding, 10 yard penalty',
  start: { down: 1, distance: 10, yardLine: 55 },
  end: { down: 1, distance: 20, yardLine: 45 },
  flags: { scoring: false, penalty: true, turnover: false },
};

export const missingDownDistancePlayFixture: GamePlay = {
  id: '10000000-0000-4000-8000-000000000004',
  sequence: 4,
  period: 2,
  clock: '01:03',
  possessionTeam: awayGameTeamFixture,
  type: 'RUSH',
  description: 'Rush for 3 yards',
  start: { down: null, distance: null, yardLine: 48 },
  end: { down: null, distance: null, yardLine: 51 },
  flags: { scoring: false, penalty: false, turnover: false },
};

export const missingFieldPositionPlayFixture: GamePlay = {
  id: '10000000-0000-4000-8000-000000000005',
  sequence: 5,
  period: 4,
  clock: '00:00',
  possessionTeam: null,
  type: 'END_PERIOD',
  description: 'End of fourth quarter',
  start: { down: null, distance: null, yardLine: null },
  end: { down: null, distance: null, yardLine: null },
  flags: { scoring: false, penalty: false, turnover: false },
};

export const gamePlaysFixture: readonly GamePlay[] = [
  scoringPlayFixture,
  turnoverPlayFixture,
  penaltyPlayFixture,
  missingDownDistancePlayFixture,
  missingFieldPositionPlayFixture,
];

export const generateGamePlaysFixture = (count: number): readonly GamePlay[] =>
  Array.from({ length: count }, (_, index) => {
    const sequence = index + 1;
    const yardLine = Math.min(99, (index * 7) % 100);
    return {
      id: `20000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
      sequence,
      period: Math.min(4, Math.floor(index / 45) + 1),
      clock: `${String(14 - (index % 15)).padStart(2, '0')}:00`,
      possessionTeam:
        index % 2 === 0 ? awayGameTeamFixture : homeGameTeamFixture,
      type: 'RUSH',
      description: `Rush for ${index % 12} yards`,
      start: { down: (index % 4) + 1, distance: 10, yardLine },
      end: { down: (index % 4) + 1, distance: 10, yardLine: yardLine + 4 },
      flags: {
        scoring: index % 23 === 0,
        penalty: index % 17 === 0,
        turnover: index % 31 === 0,
      },
    } satisfies GamePlay;
  });

export const awayTeamStatsFixture: GameTeamStats = {
  teamId: awayGameTeamFixture.id,
  firstDowns: 21,
  totalPlays: 64,
  totalYards: 389,
  passingYards: 254,
  rushingYards: 135,
  turnovers: 1,
  sacks: 2,
  thirdDownConversions: 6,
  thirdDownAttempts: 13,
  fourthDownConversions: 1,
  fourthDownAttempts: 1,
  penalties: 5,
  penaltyYards: 42,
  possessionSeconds: 1740,
  redZoneConversions: 3,
  redZoneAttempts: 4,
  scoringByPeriod: { q1: 7, q2: 10, q3: 0, q4: 7, ot1: null, ot2: null },
};

export const homeTeamStatsFixture: GameTeamStats = {
  teamId: homeGameTeamFixture.id,
  firstDowns: 18,
  totalPlays: 59,
  totalYards: 312,
  passingYards: 201,
  rushingYards: 111,
  turnovers: 2,
  sacks: 3,
  thirdDownConversions: 4,
  thirdDownAttempts: 12,
  fourthDownConversions: 0,
  fourthDownAttempts: 1,
  penalties: 7,
  penaltyYards: 61,
  possessionSeconds: 1860,
  redZoneConversions: 2,
  redZoneAttempts: 3,
  scoringByPeriod: { q1: 3, q2: 7, q3: 7, q4: 0, ot1: null, ot2: null },
};
