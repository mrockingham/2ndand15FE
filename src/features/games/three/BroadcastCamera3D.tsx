import { PerspectiveCamera } from '@react-three/drei';
import { useMemo } from 'react';

import type { PlayAnimationModel } from '@/features/games/playVisualization';
import { yardToWorldX } from '@/features/games/three/coordinates';

/**
 * Fixed broadcast-style camera framing the active part of the play. No
 * free-orbit is required for M44A, so this is a one-shot compute keyed off
 * the play rather than a continuously-updating rig.
 */
export const BroadcastCamera3D = ({
  model,
}: {
  readonly model: PlayAnimationModel;
}) => {
  const { position, target } = useMemo(() => {
    const startYard = model.startBallPosition ?? 50;
    const endYard = model.endBallPosition ?? startYard;
    const centerYard = (startYard + endYard) / 2;
    const spread = Math.max(Math.abs(endYard - startYard), 12);
    const centerX = yardToWorldX(centerYard);
    return {
      position: [
        centerX - spread * 0.15,
        14 + spread * 0.28,
        24 + spread * 0.55,
      ] as const,
      target: [centerX + spread * 0.1, 0, 0] as const,
    };
  }, [model.startBallPosition, model.endBallPosition]);

  return (
    <PerspectiveCamera
      makeDefault
      fov={42}
      near={0.1}
      far={500}
      position={position}
      onUpdate={(camera) => camera.lookAt(...target)}
    />
  );
};
