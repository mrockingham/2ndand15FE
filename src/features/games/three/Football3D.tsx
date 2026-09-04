import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Mesh, QuadraticBezierCurve3 } from 'three';

import type { BallPath } from '@/features/games/playVisualization';
import { useAnimationProgressRef } from '@/features/games/three/animationProgressContext';
import { fieldPointToVector3 } from '@/features/games/three/coordinates';

const BALL_HEIGHT = 1.1;
const ARC_LIFT = 6;

export const Football3D = ({ ballPath }: { readonly ballPath: BallPath }) => {
  const meshRef = useRef<Mesh>(null);
  const progressRef = useAnimationProgressRef();

  const curve = useMemo(() => {
    const start = fieldPointToVector3(ballPath.start, BALL_HEIGHT);
    const end = fieldPointToVector3(ballPath.end, BALL_HEIGHT);
    const control = fieldPointToVector3(
      ballPath.control,
      ballPath.showTrajectory ? BALL_HEIGHT + ARC_LIFT : BALL_HEIGHT,
    );
    return new QuadraticBezierCurve3(start, control, end);
  }, [ballPath]);

  useFrame(() => {
    if (meshRef.current === null) return;
    const point = curve.getPoint(progressRef.current);
    meshRef.current.position.copy(point);
  });

  return (
    <group>
      {ballPath.showTrajectory ? (
        <Line
          points={curve.getPoints(24)}
          color="#ffffff"
          transparent
          opacity={0.5}
          dashed
          dashSize={0.6}
          gapSize={0.4}
        />
      ) : null}
      <mesh ref={meshRef} position={curve.getPoint(0)} scale={[1, 0.6, 0.6]}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial color="#8b4a24" />
      </mesh>
    </group>
  );
};
