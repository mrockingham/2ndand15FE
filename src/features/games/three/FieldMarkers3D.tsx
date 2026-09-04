import { Text } from '@react-three/drei';

import {
  FIELD_WIDTH_YARDS,
  yardToWorldX,
} from '@/features/games/three/coordinates';

const MarkerLine = ({
  yard,
  color,
  label,
}: {
  readonly yard: number;
  readonly color: string;
  readonly label: string;
}) => {
  const x = yardToWorldX(yard);
  return (
    <group>
      <mesh position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.22, FIELD_WIDTH_YARDS]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <Text
        position={[x, 1.4, FIELD_WIDTH_YARDS / 2 + 1.6]}
        fontSize={1.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

export const LineOfScrimmageMarker3D = ({
  yard,
}: {
  readonly yard: number;
}) => <MarkerLine yard={yard} color="#2979FF" label="LOS" />;

export const FirstDownMarker3D = ({ yard }: { readonly yard: number }) => (
  <MarkerLine yard={yard} color="#FFD54F" label="1ST" />
);
