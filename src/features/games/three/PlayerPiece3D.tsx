import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Mesh } from 'three';

import type { SchematicMarker } from '@/features/games/playVisualization';
import { useAnimationProgressRef } from '@/features/games/three/animationProgressContext';
import { fieldPointToVector3 } from '@/features/games/three/coordinates';

const PLAYER_HEIGHT = 1.8;

export const PlayerPiece3D = ({
  marker,
  color,
}: {
  readonly marker: SchematicMarker;
  readonly color: string;
}) => {
  const meshRef = useRef<Mesh>(null);
  const progressRef = useAnimationProgressRef();
  const start = useMemo(
    () => fieldPointToVector3(marker.start, PLAYER_HEIGHT / 2),
    [marker.start],
  );
  const end = useMemo(
    () => fieldPointToVector3(marker.end, PLAYER_HEIGHT / 2),
    [marker.end],
  );

  useFrame(() => {
    if (meshRef.current === null) return;
    meshRef.current.position.lerpVectors(start, end, progressRef.current);
  });

  const radius = marker.primary ? 0.85 : 0.7;
  return (
    <mesh ref={meshRef} position={start} castShadow>
      <capsuleGeometry args={[radius, PLAYER_HEIGHT - radius * 2, 4, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={marker.primary ? color : '#000000'}
        emissiveIntensity={marker.primary ? 0.25 : 0}
      />
    </mesh>
  );
};
