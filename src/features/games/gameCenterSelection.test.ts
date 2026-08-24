import {
  latestPlayWithFieldPosition,
  resolveSelectedPlayAfterRefresh,
} from '@/features/games/gameCenterSelection';
import {
  gamePlaysFixture,
  missingFieldPositionPlayFixture,
  scoringPlayFixture,
  turnoverPlayFixture,
} from '@/test/gamePlaysFixtures';
import type { GamePlay } from '@/features/games/types';

describe('resolveSelectedPlayAfterRefresh', () => {
  it('keeps the same selection when its ID still exists after a refresh', () => {
    expect(
      resolveSelectedPlayAfterRefresh(
        gamePlaysFixture,
        turnoverPlayFixture.id,
        turnoverPlayFixture,
      ),
    ).toBe(turnoverPlayFixture.id);
  });

  it('keeps the selection when new plays are appended', () => {
    const withNewPlay: readonly GamePlay[] = [
      ...gamePlaysFixture,
      {
        ...scoringPlayFixture,
        id: 'new-play-id',
        sequence: gamePlaysFixture.length + 1,
      },
    ];
    expect(
      resolveSelectedPlayAfterRefresh(
        withNewPlay,
        turnoverPlayFixture.id,
        turnoverPlayFixture,
      ),
    ).toBe(turnoverPlayFixture.id);
  });

  it('falls back to a play at the same sequence/period/clock when the ID disappears (FINAL replacement)', () => {
    const replacement: GamePlay = {
      ...turnoverPlayFixture,
      id: 'final-replacement-id',
    };
    const finalPlays = gamePlaysFixture.map((play) =>
      play.id === turnoverPlayFixture.id ? replacement : play,
    );
    expect(
      resolveSelectedPlayAfterRefresh(
        finalPlays,
        turnoverPlayFixture.id,
        turnoverPlayFixture,
      ),
    ).toBe(replacement.id);
  });

  it('falls back to the latest play with usable field data when no logical match exists', () => {
    const disjointPlays: readonly GamePlay[] = [
      { ...scoringPlayFixture, id: 'a', sequence: 1 },
      { ...turnoverPlayFixture, id: 'b', sequence: 2 },
    ];
    const vanishedSelection: GamePlay = {
      ...turnoverPlayFixture,
      id: 'vanished',
      sequence: 999,
      period: 4,
      clock: '00:00',
    };
    expect(
      resolveSelectedPlayAfterRefresh(
        disjointPlays,
        'vanished',
        vanishedSelection,
      ),
    ).toBe(latestPlayWithFieldPosition(disjointPlays)?.id ?? null);
  });

  it('returns null for an empty play list without throwing', () => {
    expect(
      resolveSelectedPlayAfterRefresh([], 'anything', turnoverPlayFixture),
    ).toBe(null);
  });

  it('returns null when no play has usable field data and nothing else matches', () => {
    const noFieldDataPlays = [missingFieldPositionPlayFixture];
    expect(
      resolveSelectedPlayAfterRefresh(noFieldDataPlays, 'missing', null),
    ).toBe(null);
  });

  it('picks the default latest-with-field-data play when nothing was previously selected', () => {
    expect(resolveSelectedPlayAfterRefresh(gamePlaysFixture, null, null)).toBe(
      latestPlayWithFieldPosition(gamePlaysFixture)?.id ?? null,
    );
  });
});

describe('latestPlayWithFieldPosition', () => {
  it('skips plays with no usable start/end yard line', () => {
    const result = latestPlayWithFieldPosition([
      missingFieldPositionPlayFixture,
    ]);
    expect(result).toBe(null);
  });

  it('returns null for an empty list', () => {
    expect(latestPlayWithFieldPosition([])).toBe(null);
  });
});
