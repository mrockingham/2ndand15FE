import type { GamePlay } from '@/features/games/types';

export const latestPlayWithFieldPosition = (
  plays: readonly GamePlay[],
): GamePlay | null =>
  [...plays]
    .sort((left, right) => right.sequence - left.sequence)
    .find(
      (play) => play.start.yardLine !== null || play.end.yardLine !== null,
    ) ?? null;

const findLogicalMatch = (
  plays: readonly GamePlay[],
  previousSelectedPlay: GamePlay,
): GamePlay | undefined =>
  plays.find(
    (play) =>
      play.sequence === previousSelectedPlay.sequence &&
      play.period === previousSelectedPlay.period &&
      play.clock === previousSelectedPlay.clock,
  );

/**
 * Backend GamePlay IDs are stable only for the currently-active snapshot; a
 * FINAL authoritative replacement can mint new IDs for the same logical
 * plays. Resolve the effective selection after any refresh: keep the same
 * ID if it still exists, otherwise fall back to a play at the same
 * sequence/period/clock, otherwise the latest play with usable field data.
 */
export const resolveSelectedPlayAfterRefresh = (
  plays: readonly GamePlay[],
  explicitSelectedId: string | null,
  previousSelectedPlay: GamePlay | null,
): string | null => {
  if (plays.length === 0) return null;

  if (explicitSelectedId !== null) {
    const stillExists = plays.find((play) => play.id === explicitSelectedId);
    if (stillExists) return stillExists.id;
  }

  if (previousSelectedPlay !== null) {
    const logicalMatch = findLogicalMatch(plays, previousSelectedPlay);
    if (logicalMatch) return logicalMatch.id;
  }

  return latestPlayWithFieldPosition(plays)?.id ?? null;
};
