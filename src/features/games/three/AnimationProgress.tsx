import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { ProgressContext } from '@/features/games/three/animationProgressContext';

/**
 * Drives play animation progress (0-1) off an internal elapsed-time
 * accumulator rather than component state, so player/ball meshes can update
 * imperatively each frame without triggering React re-renders.
 */
export const AnimationDriver = ({
  durationMs,
  reduceMotion,
  onSettled,
  children,
}: {
  readonly durationMs: number;
  readonly reduceMotion: boolean;
  readonly onSettled?: () => void;
  readonly children: React.ReactNode;
}) => {
  const progressRef = useRef(reduceMotion || durationMs <= 0 ? 1 : 0);
  const settledRef = useRef(false);

  useFrame((_, delta) => {
    if (settledRef.current) return;
    if (reduceMotion || durationMs <= 0) {
      progressRef.current = 1;
      settledRef.current = true;
      onSettled?.();
      return;
    }
    const next = Math.min(1, progressRef.current + delta / (durationMs / 1000));
    progressRef.current = next;
    if (next >= 1) {
      settledRef.current = true;
      onSettled?.();
    }
  });

  return (
    <ProgressContext.Provider value={progressRef}>
      {children}
    </ProgressContext.Provider>
  );
};
