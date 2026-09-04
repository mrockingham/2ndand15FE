import { Line, Text } from '@react-three/drei';
import { useMemo } from 'react';
import { DoubleSide, Object3D } from 'three';

import {
  ENDZONE_DEPTH_YARDS,
  FIELD_LENGTH_YARDS,
  FIELD_WIDTH_YARDS,
  HALF_WIDTH_YARDS,
  HASH_INSET_YARDS,
  yardToWorldX,
} from '@/features/games/three/coordinates';

const dummy = new Object3D();

const HashMarks = () => {
  const positions = useMemo(() => {
    const points: { x: number; z: number }[] = [];
    for (let yard = 1; yard < FIELD_LENGTH_YARDS; yard += 1) {
      points.push({
        x: yardToWorldX(yard),
        z: HALF_WIDTH_YARDS - HASH_INSET_YARDS,
      });
      points.push({
        x: yardToWorldX(yard),
        z: -(HALF_WIDTH_YARDS - HASH_INSET_YARDS),
      });
    }
    return points;
  }, []);

  return (
    <instancedMesh
      args={[undefined, undefined, positions.length]}
      ref={(mesh) => {
        if (mesh === null) return;
        positions.forEach((position, index) => {
          dummy.position.set(position.x, 0.02, position.z);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      }}
    >
      <planeGeometry args={[0.16, 0.9]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
    </instancedMesh>
  );
};

const YardLines = () => {
  const lines = useMemo(
    () =>
      Array.from({ length: 21 }, (_, index) => index * 5).map((yard) => ({
        yard,
        major: yard % 10 === 0,
      })),
    [],
  );
  return (
    <group>
      {lines.map(({ yard, major }) => (
        <mesh
          key={yard}
          position={[yardToWorldX(yard), 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[major ? 0.12 : 0.06, FIELD_WIDTH_YARDS]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={major ? 0.85 : 0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

const YardNumbers = () => {
  const numbers = useMemo(
    () => Array.from({ length: 9 }, (_, index) => (index + 1) * 10),
    [],
  );
  return (
    <group>
      {numbers.map((yard) => {
        const label = String(yard <= 50 ? yard : 100 - yard);
        const x = yardToWorldX(yard);
        return (
          <group key={yard}>
            <Text
              position={[x, 0.02, HALF_WIDTH_YARDS - 6]}
              rotation={[-Math.PI / 2, 0, Math.PI]}
              fontSize={2.2}
              color="#ffffff"
              fillOpacity={0.75}
              anchorX="center"
              anchorY="middle"
            >
              {label}
            </Text>
            <Text
              position={[x, 0.02, -(HALF_WIDTH_YARDS - 6)]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={2.2}
              color="#ffffff"
              fillOpacity={0.75}
              anchorX="center"
              anchorY="middle"
            >
              {label}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const Field3D = ({
  offenseColor,
  defenseColor,
}: {
  readonly offenseColor: string;
  readonly defenseColor: string;
}) => {
  const totalLength = FIELD_LENGTH_YARDS + ENDZONE_DEPTH_YARDS * 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[totalLength, FIELD_WIDTH_YARDS]} />
        <meshStandardMaterial color="#123D2C" side={DoubleSide} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-FIELD_LENGTH_YARDS / 2 - ENDZONE_DEPTH_YARDS / 2, 0.005, 0]}
      >
        <planeGeometry args={[ENDZONE_DEPTH_YARDS, FIELD_WIDTH_YARDS]} />
        <meshStandardMaterial color={offenseColor} opacity={0.82} transparent />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[FIELD_LENGTH_YARDS / 2 + ENDZONE_DEPTH_YARDS / 2, 0.005, 0]}
      >
        <planeGeometry args={[ENDZONE_DEPTH_YARDS, FIELD_WIDTH_YARDS]} />
        <meshStandardMaterial color={defenseColor} opacity={0.82} transparent />
      </mesh>

      <YardLines />
      <HashMarks />
      <YardNumbers />

      <Line
        points={[
          [-FIELD_LENGTH_YARDS / 2, 0.02, -HALF_WIDTH_YARDS],
          [FIELD_LENGTH_YARDS / 2, 0.02, -HALF_WIDTH_YARDS],
          [FIELD_LENGTH_YARDS / 2, 0.02, HALF_WIDTH_YARDS],
          [-FIELD_LENGTH_YARDS / 2, 0.02, HALF_WIDTH_YARDS],
          [-FIELD_LENGTH_YARDS / 2, 0.02, -HALF_WIDTH_YARDS],
        ]}
        color="#ffffff"
        transparent
        opacity={0.8}
        lineWidth={1.5}
      />
    </group>
  );
};
