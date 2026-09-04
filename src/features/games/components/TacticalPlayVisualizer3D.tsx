import FullscreenRounded from '@mui/icons-material/FullscreenRounded';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { Play3DBoundary } from '@/features/games/components/Play3DBoundary';
import { PlayDeck } from '@/features/games/components/PlayDeck';
import { PlaybackControls } from '@/features/games/components/PlaybackControls';
import { usePlayPlaybackNavigation } from '@/features/games/components/usePlayPlaybackNavigation';
import type { Game, GamePlay, GameTeam } from '@/features/games/types';
import { isWebglAvailable } from '@/features/games/three/webgl';

const playTeams = (game: Game, play: GamePlay) => {
  if (play.possessionTeam?.id === game.homeTeam.id)
    return { offense: game.homeTeam, defense: game.awayTeam };
  if (play.possessionTeam?.id === game.awayTeam.id)
    return { offense: game.awayTeam, defense: game.homeTeam };
  return { offense: null as GameTeam | null, defense: null as GameTeam | null };
};

export const TacticalPlayVisualizer3D = ({
  game,
  play,
  plays,
  replayMode,
  replayVersion,
  onReplay,
  onExpand,
  onReturnToLive,
  onSelectPlay,
  onUnavailable,
}: {
  readonly game: Game;
  readonly play: GamePlay;
  readonly plays: readonly GamePlay[];
  readonly replayMode: boolean;
  readonly replayVersion: number;
  readonly onReplay: () => void;
  readonly onExpand: () => void;
  readonly onReturnToLive: () => void;
  readonly onSelectPlay: (playId: string) => void;
  readonly onUnavailable: () => void;
}) => {
  const { offense, defense } = playTeams(game, play);
  const isLive = game.status === 'IN_PROGRESS' || game.status === 'HALFTIME';
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [webglAvailable] = useState(() => isWebglAvailable());
  const notifiedRef = useRef(false);

  const {
    orderedPlays,
    currentIndex,
    hasPrevious,
    hasNext,
    isPlaying,
    stackDirection,
    goToFirst,
    goToPrevious,
    goToNext,
    jumpTo,
    togglePlaying,
  } = usePlayPlaybackNavigation({ play, plays, reduceMotion, onSelectPlay });

  useEffect(() => {
    if (!webglAvailable && !notifiedRef.current) {
      notifiedRef.current = true;
      console.warn(
        '[Play3D] WebGL feature detection failed; falling back to 2D.',
      );
      onUnavailable();
    }
  }, [webglAvailable, onUnavailable]);

  if (!webglAvailable) {
    return (
      <Alert severity="warning" data-testid="play-3d-fallback-notice">
        3D visualization is unavailable in this browser. Showing the 2D tactical
        view instead.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Chip
          size="small"
          color={replayMode ? 'secondary' : isLive ? 'success' : 'default'}
          label={replayMode ? 'REPLAY' : isLive ? 'LIVE PLAY' : 'LATEST PLAY'}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Player movement is a schematic 3D visualization based on play-by-play data, not tracking data.">
          <IconButton
            size="small"
            aria-label="About schematic 3D play visualization"
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        {isLive && replayMode ? (
          <Button size="small" onClick={onReturnToLive}>
            Return to Live
          </Button>
        ) : null}
        <Button size="small" startIcon={<ReplayRounded />} onClick={onReplay}>
          Replay
        </Button>
        <Button
          size="small"
          startIcon={<FullscreenRounded />}
          onClick={onExpand}
        >
          Expand
        </Button>
      </Stack>
      <Play3DBoundary
        play={play}
        offense={offense}
        defense={defense}
        replayVersion={replayVersion}
        reduceMotion={reduceMotion}
        onUnavailable={onUnavailable}
      />
      <PlaybackControls
        position={currentIndex === -1 ? 0 : currentIndex + 1}
        total={orderedPlays.length}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isPlaying={isPlaying}
        onFirst={goToFirst}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onTogglePlay={togglePlaying}
      />
      <Typography variant="caption" color="text.secondary">
        Field position and play result use stored play-by-play data. Formation
        and player movement are schematic, not tracking data.
      </Typography>
      <PlayDeck
        plays={orderedPlays}
        currentPlayId={play.id}
        direction={stackDirection}
        reduceMotion={reduceMotion}
        onSelectPlay={jumpTo}
      />
    </Stack>
  );
};
