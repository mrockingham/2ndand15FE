import type { GamePlay } from '@/features/games/types';

export type PlayAnimationCategory =
  | 'PASS_COMPLETE'
  | 'PASS_INCOMPLETE'
  | 'RUN'
  | 'SACK'
  | 'INTERCEPTION'
  | 'FUMBLE'
  | 'FIELD_GOAL'
  | 'PUNT'
  | 'KICKOFF'
  | 'PENALTY'
  | 'NO_PLAY'
  | 'STATIC';

export type SchematicFormation =
  'SHOTGUN' | 'BALANCED' | 'FIELD_GOAL' | 'PUNT' | 'KICKOFF';

export interface FieldPoint {
  readonly x: number;
  readonly y: number;
}

export interface SchematicMarker {
  readonly id: string;
  readonly side: 'offense' | 'defense';
  readonly symbol: 'O' | 'X';
  readonly start: FieldPoint;
  readonly end: FieldPoint;
  readonly primary: boolean;
}

export interface BallPath {
  readonly start: FieldPoint;
  readonly control: FieldPoint;
  readonly end: FieldPoint;
  readonly showTrajectory: boolean;
}

export interface PlayAnimationModel {
  readonly category: PlayAnimationCategory;
  readonly formation: SchematicFormation | null;
  readonly locationMode: 'factual' | 'generic';
  readonly startBallPosition: number | null;
  readonly endBallPosition: number | null;
  readonly lineOfScrimmage: number | null;
  readonly firstDownMarker: number | null;
  readonly direction: 'left' | 'middle' | 'right' | null;
  readonly markers: readonly SchematicMarker[];
  readonly ballPath: BallPath | null;
  readonly durationMs: number;
  readonly isTurnover: boolean;
  readonly isScoring: boolean;
  readonly isPenalty: boolean;
  readonly isNoPlay: boolean;
}

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value));

const descriptionDirection = (
  description: string,
): PlayAnimationModel['direction'] => {
  const match = description.toLowerCase().match(/\b(left|middle|right)\b/);
  return (match?.[1] as PlayAnimationModel['direction']) ?? null;
};

const categoryFor = (play: GamePlay): PlayAnimationCategory => {
  const description = play.description.toLowerCase();
  if (/\bno play\b/.test(description)) return 'NO_PLAY';
  if (play.type === 'PASS')
    return /\bpass incomplete\b/.test(description)
      ? 'PASS_INCOMPLETE'
      : 'PASS_COMPLETE';
  if (play.type === 'RUSH') return 'RUN';
  if (play.type === 'SACK') return 'SACK';
  if (play.type === 'INTERCEPTION') return 'INTERCEPTION';
  if (play.type === 'FUMBLE') return 'FUMBLE';
  if (play.type === 'FIELD_GOAL') return 'FIELD_GOAL';
  if (play.type === 'PUNT') return 'PUNT';
  if (play.type === 'KICKOFF') return 'KICKOFF';
  if (play.type === 'PENALTY' || play.flags.penalty) return 'PENALTY';
  return 'STATIC';
};

const formationFor = (
  category: PlayAnimationCategory,
): SchematicFormation | null => {
  if (
    category === 'PASS_COMPLETE' ||
    category === 'PASS_INCOMPLETE' ||
    category === 'SACK' ||
    category === 'INTERCEPTION'
  )
    return 'SHOTGUN';
  if (
    category === 'RUN' ||
    category === 'FUMBLE' ||
    category === 'PENALTY' ||
    category === 'NO_PLAY'
  )
    return 'BALANCED';
  if (category === 'FIELD_GOAL') return 'FIELD_GOAL';
  if (category === 'PUNT') return 'PUNT';
  if (category === 'KICKOFF') return 'KICKOFF';
  return null;
};

const durationFor = (category: PlayAnimationCategory) => {
  if (category === 'FIELD_GOAL' || category === 'PUNT') return 3000;
  if (category === 'KICKOFF') return 3200;
  if (category === 'PASS_COMPLETE' || category === 'INTERCEPTION') return 2600;
  if (category === 'PASS_INCOMPLETE' || category === 'SACK') return 2200;
  if (category === 'RUN' || category === 'FUMBLE') return 2100;
  if (category === 'PENALTY') return 1700;
  return 0;
};

const lateralY = (direction: PlayAnimationModel['direction']) =>
  direction === 'left' ? 27 : direction === 'right' ? 73 : 50;

const makeMarkers = (
  formation: SchematicFormation | null,
  line: number,
  destination: number,
  direction: PlayAnimationModel['direction'],
  category: PlayAnimationCategory,
): readonly SchematicMarker[] => {
  if (formation === null) return [];

  const offenseStart: FieldPoint[] = [
    { x: line - 1, y: 34 },
    { x: line - 1, y: 42 },
    { x: line - 1, y: 50 },
    { x: line - 1, y: 58 },
    { x: line - 1, y: 66 },
    { x: line - 7, y: 50 },
    { x: line - 12, y: 61 },
    { x: line - 1, y: 14 },
    { x: line - 2, y: 26 },
    { x: line - 2, y: 74 },
    { x: line - 1, y: 86 },
  ];
  if (formation === 'FIELD_GOAL') {
    offenseStart[5] = { x: line - 7, y: 50 };
    offenseStart[6] = { x: line - 12, y: 50 };
  } else if (formation === 'PUNT') {
    offenseStart[5] = { x: line - 5, y: 50 };
    offenseStart[6] = { x: line - 14, y: 50 };
  } else if (formation === 'KICKOFF') {
    offenseStart.forEach((_point, index) => {
      offenseStart[index] = {
        x: index === 5 ? line - 7 : line - 1,
        y: 8 + index * 8.4,
      };
    });
  }

  const defenseStart: FieldPoint[] = [
    { x: line + 3, y: 35 },
    { x: line + 3, y: 45 },
    { x: line + 3, y: 55 },
    { x: line + 3, y: 65 },
    { x: line + 8, y: 34 },
    { x: line + 8, y: 50 },
    { x: line + 8, y: 66 },
    { x: line + 14, y: 18 },
    { x: line + 14, y: 39 },
    { x: line + 14, y: 61 },
    { x: line + 14, y: 82 },
  ];
  if (formation === 'KICKOFF') {
    defenseStart.forEach((_point, index) => {
      defenseStart[index] = {
        x: clamp(line + 34 + (index % 3) * 6),
        y: 8 + index * 8.4,
      };
    });
  }

  const targetIndex = direction === 'left' ? 7 : direction === 'right' ? 10 : 8;
  const carrierIndex = category === 'RUN' || category === 'FUMBLE' ? 6 : 5;
  return [
    ...offenseStart.map((start, index): SchematicMarker => {
      const isPrimary =
        index ===
        (category === 'PASS_COMPLETE' ||
        category === 'PASS_INCOMPLETE' ||
        category === 'INTERCEPTION'
          ? targetIndex
          : carrierIndex);
      let end = { x: start.x + (index < 5 ? 1.2 : 2.5), y: start.y };
      if (isPrimary)
        end = {
          x:
            category === 'PASS_INCOMPLETE'
              ? clamp(destination - 2)
              : destination,
          y: lateralY(direction),
        };
      if (category === 'SACK' && index === 5) end = { x: destination, y: 50 };
      return {
        id: `offense-${index + 1}`,
        side: 'offense',
        symbol: 'O',
        start: { x: clamp(start.x), y: start.y },
        end: { x: clamp(end.x), y: end.y },
        primary: isPrimary || (category === 'SACK' && index === 5),
      };
    }),
    ...defenseStart.map((start, index): SchematicMarker => {
      const rushesQuarterback = category === 'SACK' && index < 2;
      const turnoverMarker = category === 'INTERCEPTION' && index === 8;
      const end = rushesQuarterback
        ? { x: destination, y: 48 + index * 4 }
        : turnoverMarker
          ? { x: destination, y: lateralY(direction) }
          : {
              x: start.x - (index < 4 ? 1.5 : 0.75),
              y: start.y + (50 - start.y) * 0.08,
            };
      return {
        id: `defense-${index + 1}`,
        side: 'defense',
        symbol: 'X',
        start: { x: clamp(start.x), y: start.y },
        end: { x: clamp(end.x), y: end.y },
        primary: turnoverMarker,
      };
    }),
  ];
};

const makeBallPath = (
  category: PlayAnimationCategory,
  line: number,
  destination: number,
  direction: PlayAnimationModel['direction'],
): BallPath | null => {
  if (category === 'STATIC' || category === 'NO_PLAY') return null;
  const y = lateralY(direction);
  if (
    category === 'PASS_COMPLETE' ||
    category === 'PASS_INCOMPLETE' ||
    category === 'INTERCEPTION'
  )
    return {
      start: { x: clamp(line - 1), y: 50 },
      control: { x: clamp(line + (destination - line) * 0.42), y: y - 22 },
      end: {
        x: clamp(
          category === 'PASS_INCOMPLETE' ? destination - 2 : destination,
        ),
        y,
      },
      showTrajectory: true,
    };
  if (
    category === 'FIELD_GOAL' ||
    category === 'PUNT' ||
    category === 'KICKOFF'
  )
    return {
      start: { x: clamp(line), y: 50 },
      control: { x: clamp((line + destination) / 2), y: 8 },
      end: { x: category === 'FIELD_GOAL' ? 100 : destination, y: 50 },
      showTrajectory: true,
    };
  return {
    start: { x: clamp(line - 8), y: 58 },
    control: { x: clamp((line + destination) / 2), y },
    end: { x: destination, y },
    showTrajectory: false,
  };
};

export const buildPlayAnimation = (play: GamePlay): PlayAnimationModel => {
  const category = categoryFor(play);
  const formation = formationFor(category);
  const direction = descriptionDirection(play.description);
  const locationMode =
    play.start.yardLine === null && play.end.yardLine === null
      ? 'generic'
      : 'factual';
  const start = play.start.yardLine ?? play.end.yardLine;
  const rawEnd = play.end.yardLine ?? play.start.yardLine;
  const isNoPlay = category === 'NO_PLAY';
  const end = isNoPlay ? start : rawEnd;
  const visualStart = start ?? 50;
  const genericAdvance =
    category === 'SACK'
      ? -5
      : category === 'FIELD_GOAL' ||
          category === 'PUNT' ||
          category === 'KICKOFF'
        ? 35
        : 12;
  const visualEnd = clamp(end ?? visualStart + genericAdvance);
  const firstDownMarker =
    play.start.yardLine !== null &&
    play.start.distance !== null &&
    play.start.distance > 0
      ? clamp(play.start.yardLine + play.start.distance)
      : null;

  return {
    category,
    formation,
    locationMode,
    startBallPosition: start,
    endBallPosition: end,
    lineOfScrimmage: play.start.yardLine,
    firstDownMarker,
    direction,
    markers: makeMarkers(
      formation,
      visualStart,
      visualEnd,
      direction,
      category,
    ),
    ballPath: makeBallPath(category, visualStart, visualEnd, direction),
    durationMs: durationFor(category),
    isTurnover:
      play.flags.turnover ||
      category === 'INTERCEPTION' ||
      category === 'FUMBLE',
    isScoring: play.flags.scoring,
    isPenalty: play.flags.penalty || category === 'PENALTY' || isNoPlay,
    isNoPlay,
  };
};
