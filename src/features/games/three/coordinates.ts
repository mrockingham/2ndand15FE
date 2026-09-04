import { Vector3 } from 'three';

import type { FieldPoint } from '@/features/games/playVisualization';

export const FIELD_LENGTH_YARDS = 100;
export const FIELD_WIDTH_YARDS = 53.3;
export const HALF_WIDTH_YARDS = FIELD_WIDTH_YARDS / 2;
export const ENDZONE_DEPTH_YARDS = 10;
export const HASH_INSET_YARDS = 21.3;

/**
 * PlayAnimationModel points use a 0-100 schematic field-relative scale
 * (x = yard line, y = lateral position). This maps that scale onto a
 * yard-scaled three.js world: x runs the length of the field centered at
 * midfield, z runs the width of the field, y is up.
 */
export const fieldPointToVector3 = (point: FieldPoint, height = 0): Vector3 =>
  new Vector3(
    point.x - FIELD_LENGTH_YARDS / 2,
    height,
    (point.y / 100) * FIELD_WIDTH_YARDS - HALF_WIDTH_YARDS,
  );

export const yardToWorldX = (yard: number): number =>
  yard - FIELD_LENGTH_YARDS / 2;
