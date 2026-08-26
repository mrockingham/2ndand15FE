import {
  canAddCuratedVideo,
  moveVideoOrder,
  sortByPosition,
} from '@/features/gameMedia/presentation';
import {
  curatedVideoFixture,
  secondCuratedVideoFixture,
  thirdCuratedVideoFixture,
} from '@/test/gameMediaFixtures';

describe('canAddCuratedVideo', () => {
  it('allows adding below the cap and blocks at the cap', () => {
    expect(canAddCuratedVideo(0)).toBe(true);
    expect(canAddCuratedVideo(3)).toBe(true);
    expect(canAddCuratedVideo(4)).toBe(false);
  });
});

describe('sortByPosition', () => {
  it('orders videos by position ascending without mutating the input', () => {
    const input = [
      thirdCuratedVideoFixture,
      curatedVideoFixture,
      secondCuratedVideoFixture,
    ];
    const sorted = sortByPosition(input);
    expect(sorted.map((video) => video.id)).toEqual([
      curatedVideoFixture.id,
      secondCuratedVideoFixture.id,
      thirdCuratedVideoFixture.id,
    ]);
    expect(input[0]).toBe(thirdCuratedVideoFixture);
  });
});

describe('moveVideoOrder', () => {
  const ids = ['a', 'b', 'c'];

  it('moves an item up', () => {
    expect(moveVideoOrder(ids, 'b', 'up')).toEqual(['b', 'a', 'c']);
  });

  it('moves an item down', () => {
    expect(moveVideoOrder(ids, 'b', 'down')).toEqual(['a', 'c', 'b']);
  });

  it('returns null at the top boundary', () => {
    expect(moveVideoOrder(ids, 'a', 'up')).toBeNull();
  });

  it('returns null at the bottom boundary', () => {
    expect(moveVideoOrder(ids, 'c', 'down')).toBeNull();
  });

  it('returns null for an unknown id', () => {
    expect(moveVideoOrder(ids, 'z', 'up')).toBeNull();
  });
});
