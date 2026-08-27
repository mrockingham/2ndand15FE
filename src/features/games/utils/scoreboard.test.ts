import { describe, expect, it } from 'vitest';

import { gameFixture } from '@/test/gameFixtures';
import { selectScoreboardGames } from '@/features/games/utils/scoreboard';

const NOW = new Date('2026-09-14T18:00:00.000Z');

const liveGame = {
  ...gameFixture,
  id: 'live-game',
  status: 'IN_PROGRESS' as const,
  startTime: '2026-09-14T17:00:00.000Z',
  awayScore: 17,
  homeScore: 20,
  quarter: 3,
  clock: '8:42',
};

const todayScheduledGame = {
  ...gameFixture,
  id: 'today-scheduled-game',
  status: 'SCHEDULED' as const,
  startTime: '2026-09-14T20:25:00.000Z',
};

const recentFinalGame = {
  ...gameFixture,
  id: 'recent-final-game',
  status: 'FINAL' as const,
  startTime: '2026-09-13T17:00:00.000Z',
  awayScore: 24,
  homeScore: 20,
};

const staleFinalGame = {
  ...gameFixture,
  id: 'stale-final-game',
  status: 'FINAL' as const,
  startTime: '2026-09-01T17:00:00.000Z',
  awayScore: 10,
  homeScore: 7,
};

const upcomingGame = {
  ...gameFixture,
  id: 'upcoming-game',
  status: 'SCHEDULED' as const,
  startTime: '2026-09-20T17:00:00.000Z',
};

describe('selectScoreboardGames', () => {
  it('includes live, today, recently-final, and upcoming games while dropping stale finals', () => {
    const selected = selectScoreboardGames(
      [
        staleFinalGame,
        upcomingGame,
        liveGame,
        recentFinalGame,
        todayScheduledGame,
      ],
      NOW,
    );
    const ids = selected.map((game) => game.id);
    expect(ids).toContain(liveGame.id);
    expect(ids).toContain(todayScheduledGame.id);
    expect(ids).toContain(recentFinalGame.id);
    expect(ids).toContain(upcomingGame.id);
    expect(ids).not.toContain(staleFinalGame.id);
  });

  it('returns games in chronological order regardless of input order', () => {
    const selected = selectScoreboardGames(
      [upcomingGame, liveGame, recentFinalGame, todayScheduledGame],
      NOW,
    );
    expect(selected.map((game) => game.id)).toEqual([
      recentFinalGame.id,
      liveGame.id,
      todayScheduledGame.id,
      upcomingGame.id,
    ]);
  });

  it('caps the result at maxCards', () => {
    const games = Array.from({ length: 20 }, (_, index) => ({
      ...upcomingGame,
      id: `upcoming-${index}`,
      startTime: `2026-09-${String(20 + (index % 5)).padStart(2, '0')}T17:00:00.000Z`,
    }));
    const selected = selectScoreboardGames(games, NOW, 5);
    expect(selected).toHaveLength(5);
  });

  it('does not duplicate a game that matches more than one relevance rule', () => {
    const liveToday = { ...liveGame, id: 'live-today' };
    const selected = selectScoreboardGames([liveToday], NOW);
    expect(selected).toHaveLength(1);
  });
});
