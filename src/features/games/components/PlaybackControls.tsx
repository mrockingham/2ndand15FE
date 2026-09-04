import FirstPageRounded from '@mui/icons-material/FirstPageRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';

export const PlaybackControls = ({
  position,
  total,
  hasPrevious,
  hasNext,
  isPlaying,
  onFirst,
  onPrevious,
  onNext,
  onTogglePlay,
}: {
  readonly position: number;
  readonly total: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly isPlaying: boolean;
  readonly onFirst: () => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onTogglePlay: () => void;
}) => (
  <Stack
    direction="row"
    spacing={1}
    data-testid="play-playback-controls"
    sx={{ alignItems: 'center', justifyContent: 'center' }}
  >
    <Tooltip title="Start from the beginning">
      <span>
        <IconButton
          size="small"
          aria-label="Start from the beginning"
          onClick={onFirst}
          disabled={!hasPrevious}
        >
          <FirstPageRounded />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Previous play">
      <span>
        <IconButton
          size="small"
          aria-label="Previous play"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <SkipPreviousRounded />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
      <span>
        <IconButton
          size="small"
          color="primary"
          aria-label={isPlaying ? 'Pause plays' : 'Play plays'}
          onClick={onTogglePlay}
          disabled={!isPlaying && !hasNext}
        >
          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Next play">
      <span>
        <IconButton
          size="small"
          aria-label="Next play"
          onClick={onNext}
          disabled={!hasNext}
        >
          <SkipNextRounded />
        </IconButton>
      </span>
    </Tooltip>
    {total > 0 ? (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 64 }}
      >
        Play {position} of {total}
      </Typography>
    ) : null}
  </Stack>
);
