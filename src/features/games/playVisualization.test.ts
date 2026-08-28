import { buildPlayAnimation } from '@/features/games/playVisualization';
import { scoringPlayFixture } from '@/test/gamePlaysFixtures';
import type { GamePlay } from '@/features/games/types';

const play = (overrides: Partial<GamePlay>): GamePlay => ({
  ...scoringPlayFixture,
  flags: { scoring: false, penalty: false, turnover: false },
  ...overrides,
});

describe('buildPlayAnimation', () => {
  it('builds a completed pass with a bounded direction hint and factual path', () => {
    const model = buildPlayAnimation(
      play({
        type: 'PASS',
        description: 'Quarterback pass short right to Receiver for 12 yards.',
        start: { down: 1, distance: 10, yardLine: 25 },
        end: { down: 1, distance: 10, yardLine: 37 },
      }),
    );
    expect(model.category).toBe('PASS_COMPLETE');
    expect(model.direction).toBe('right');
    expect(model.startBallPosition).toBe(25);
    expect(model.endBallPosition).toBe(37);
    expect(model.ballPath?.showTrajectory).toBe(true);
    expect(
      model.markers.filter((marker) => marker.side === 'offense'),
    ).toHaveLength(11);
    expect(
      model.markers.filter((marker) => marker.side === 'defense'),
    ).toHaveLength(11);
  });

  it.each([
    ['PASS', 'Pass incomplete short left.', 'PASS_INCOMPLETE'],
    ['RUSH', 'Runner right guard for 4 yards.', 'RUN'],
    ['SACK', 'Quarterback sacked for a loss.', 'SACK'],
    ['INTERCEPTION', 'Pass intercepted.', 'INTERCEPTION'],
    ['FUMBLE', 'Fumble recovered by defense.', 'FUMBLE'],
    ['FIELD_GOAL', 'Field goal is good.', 'FIELD_GOAL'],
    ['PUNT', 'Punter punts 48 yards.', 'PUNT'],
    ['KICKOFF', 'Kicker kicks to the end zone.', 'KICKOFF'],
  ] as const)(
    'classifies %s plays deterministically',
    (type, description, category) => {
      const model = buildPlayAnimation(play({ type, description }));
      expect(model.category).toBe(category);
      expect(model.ballPath).not.toBeNull();
    },
  );

  it('keeps the run ball with the carrier and converges sack rushers', () => {
    const run = buildPlayAnimation(
      play({
        type: 'RUSH',
        description: 'Runner up the middle for 5 yards.',
      }),
    );
    expect(run.ballPath?.showTrajectory).toBe(false);

    const sack = buildPlayAnimation(
      play({
        type: 'SACK',
        description: 'Quarterback sacked for a 6 yard loss.',
        start: { down: 2, distance: 8, yardLine: 52 },
        end: { down: 3, distance: 14, yardLine: 46 },
      }),
    );
    expect(
      sack.markers.filter(
        (marker) => marker.side === 'defense' && marker.end.x === 46,
      ),
    ).toHaveLength(2);
  });

  it('uses long schematic arcs for kicks and factual turnover state', () => {
    const fieldGoal = buildPlayAnimation(
      play({
        type: 'FIELD_GOAL',
        description: '35 yard field goal.',
        start: { down: 4, distance: 6, yardLine: 83 },
        end: { down: null, distance: null, yardLine: 100 },
      }),
    );
    expect(fieldGoal.ballPath?.end.x).toBe(100);
    expect(fieldGoal.ballPath?.control.y).toBe(8);

    const interception = buildPlayAnimation(
      play({
        type: 'INTERCEPTION',
        description: 'Pass intercepted short right.',
        flags: { scoring: false, penalty: false, turnover: true },
      }),
    );
    expect(interception.isTurnover).toBe(true);
    expect(interception.ballPath?.showTrajectory).toBe(true);
  });

  it('keeps touchdown status factual without changing the schematic category', () => {
    const model = buildPlayAnimation(
      play({
        type: 'RUSH',
        description: 'Runner for a touchdown.',
        flags: { scoring: true, penalty: false, turnover: false },
      }),
    );
    expect(model.category).toBe('RUN');
    expect(model.isScoring).toBe(true);
  });

  it('does not advance a bounded no-play penalty', () => {
    const model = buildPlayAnimation(
      play({
        type: 'PENALTY',
        description: 'Defensive pass interference - No Play.',
        start: { down: 1, distance: 10, yardLine: 42 },
        end: { down: 1, distance: 10, yardLine: 70 },
        flags: { scoring: false, penalty: true, turnover: false },
      }),
    );
    expect(model.category).toBe('NO_PLAY');
    expect(model.endBallPosition).toBe(42);
    expect(model.durationMs).toBe(0);
  });

  it('marks missing location as generic without claiming precise field positions', () => {
    const model = buildPlayAnimation(
      play({
        type: 'PASS',
        description: 'Pass incomplete.',
        start: { down: null, distance: null, yardLine: null },
        end: { down: null, distance: null, yardLine: null },
      }),
    );
    expect(model.locationMode).toBe('generic');
    expect(model.startBallPosition).toBeNull();
    expect(model.endBallPosition).toBeNull();
    expect(model.ballPath).not.toBeNull();
  });

  it('keeps missing down and distance from creating a first-down marker', () => {
    const model = buildPlayAnimation(
      play({
        start: { down: null, distance: null, yardLine: 44 },
        end: { down: null, distance: null, yardLine: 51 },
      }),
    );
    expect(model.firstDownMarker).toBeNull();
  });
});
