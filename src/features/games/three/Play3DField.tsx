import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';

import {
  buildPlayAnimation,
  type PlayAnimationModel,
} from '@/features/games/playVisualization';
import type { GamePlay, GameTeam } from '@/features/games/types';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import { AnimationDriver } from '@/features/games/three/AnimationProgress';
import { BroadcastCamera3D } from '@/features/games/three/BroadcastCamera3D';
import { Field3D } from '@/features/games/three/Field3D';
import {
  FirstDownMarker3D,
  LineOfScrimmageMarker3D,
} from '@/features/games/three/FieldMarkers3D';
import { Football3D } from '@/features/games/three/Football3D';
import { PlayerPiece3D } from '@/features/games/three/PlayerPiece3D';

const teamColor = (team: GameTeam | null, fallback: string) =>
  (team === null
    ? null
    : getTeamVisualConfig(team.abbreviation)?.primaryColor) ?? fallback;

const animationCategoryLabel = (model: PlayAnimationModel) =>
  model.category.replaceAll('_', ' ');

const Scene = ({
  model,
  offenseColor,
  defenseColor,
  replayKey,
  reduceMotion,
  onSettled,
}: {
  readonly model: PlayAnimationModel;
  readonly offenseColor: string;
  readonly defenseColor: string;
  readonly replayKey: string;
  readonly reduceMotion: boolean;
  readonly onSettled: () => void;
}) => (
  <group key={replayKey}>
    <ambientLight intensity={0.75} />
    <directionalLight position={[30, 40, 10]} intensity={1.1} castShadow />
    <BroadcastCamera3D model={model} />
    <Field3D offenseColor={offenseColor} defenseColor={defenseColor} />
    {model.lineOfScrimmage === null ? null : (
      <LineOfScrimmageMarker3D yard={model.lineOfScrimmage} />
    )}
    {model.firstDownMarker === null ? null : (
      <FirstDownMarker3D yard={model.firstDownMarker} />
    )}
    <AnimationDriver
      durationMs={model.durationMs}
      reduceMotion={reduceMotion}
      onSettled={onSettled}
    >
      {model.markers.map((marker) => (
        <PlayerPiece3D
          key={marker.id}
          marker={marker}
          color={marker.side === 'offense' ? offenseColor : defenseColor}
        />
      ))}
      {model.ballPath === null ? null : (
        <Football3D ballPath={model.ballPath} />
      )}
    </AnimationDriver>
  </group>
);

export const Play3DField = ({
  play,
  offense,
  defense,
  replayVersion,
  expanded = false,
  reduceMotion,
}: {
  readonly play: GamePlay;
  readonly offense: GameTeam | null;
  readonly defense: GameTeam | null;
  readonly replayVersion: number;
  readonly expanded?: boolean;
  readonly reduceMotion: boolean;
}) => {
  const model = useMemo(() => buildPlayAnimation(play), [play]);
  const offenseColor = teamColor(offense, '#1565C0');
  const defenseColor = teamColor(defense, '#212121');
  const replayKey = `${play.id}-${replayVersion}-${reduceMotion ? 'reduced' : 'motion'}`;
  const [animating, setAnimating] = useState(true);
  const [previousReplayKey, setPreviousReplayKey] = useState(replayKey);
  if (replayKey !== previousReplayKey) {
    setPreviousReplayKey(replayKey);
    setAnimating(true);
  }

  return (
    <Box>
      <Box
        key={replayKey}
        data-testid="tactical-field-3d"
        role="img"
        aria-label={`${animationCategoryLabel(model)} schematic 3D play visualization. Player movement is schematic, not tracking data.`}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'appSurfaces.borderStrong',
          bgcolor: '#0b1d15',
          aspectRatio: expanded ? '12 / 5' : '12 / 5.3',
        }}
      >
        <Canvas
          shadows
          frameloop={animating ? 'always' : 'demand'}
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'low-power' }}
        >
          <Scene
            model={model}
            offenseColor={offenseColor}
            defenseColor={defenseColor}
            replayKey={replayKey}
            reduceMotion={reduceMotion}
            onSettled={() => setAnimating(false)}
          />
        </Canvas>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            left: 8,
            bottom: 6,
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Schematic 3D · not tracking data
        </Typography>
      </Box>
      {model.locationMode === 'generic' ? (
        <Typography variant="caption" color="text.secondary">
          Exact field movement is unavailable; the centered animation is
          generic.
        </Typography>
      ) : null}
    </Box>
  );
};
