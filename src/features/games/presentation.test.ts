import {
  getGameDisplayLabel,
  isHallOfFameGame,
} from '@/features/games/presentation';
import {
  gameFixture,
  hallOfFameGameFixture,
  preseasonWeekOneFixture,
} from '@/test/gameFixtures';

describe('public game labels', () => {
  it('recognizes only the reviewed Hall of Fame Game identity', () => {
    expect(isHallOfFameGame(hallOfFameGameFixture)).toBe(true);
    expect(getGameDisplayLabel(hallOfFameGameFixture)).toBe(
      'Hall of Fame Game',
    );
    expect(
      getGameDisplayLabel({
        ...hallOfFameGameFixture,
        id: '88888888-8888-4888-8888-888888888888',
      }),
    ).toBe('Preseason');
  });

  it('labels numbered weeks without inventing null or zero', () => {
    expect(getGameDisplayLabel(preseasonWeekOneFixture)).toBe(
      'Preseason Week 1',
    );
    expect(getGameDisplayLabel(gameFixture)).toBe('Regular Season Week 16');
    expect(getGameDisplayLabel(hallOfFameGameFixture)).not.toMatch(
      /Week (?:null|0)/,
    );
  });
});
