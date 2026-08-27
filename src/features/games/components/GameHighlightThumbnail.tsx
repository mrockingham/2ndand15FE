import PlayCircleRounded from '@mui/icons-material/PlayCircleRounded';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import type { GameTeam } from '@/features/games/types';

export const GameHighlightThumbnail = ({
  thumbnailUrl,
  alt,
  awayTeam,
  homeTeam,
}: {
  readonly thumbnailUrl: string | null;
  readonly alt: string;
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = thumbnailUrl !== null && !failed;
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        borderRadius: 1,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={thumbnailUrl}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <TeamHelmet team={awayTeam.abbreviation} size="md" decorative />
          <Typography variant="overline" color="text.secondary">
            vs
          </Typography>
          <TeamHelmet team={homeTeam.abbreviation} size="md" decorative />
        </Box>
      )}
      <PlayCircleRounded
        aria-hidden
        sx={{
          position: 'absolute',
          fontSize: 48,
          color: showImage ? 'common.white' : 'text.secondary',
          opacity: showImage ? 0.9 : 0.6,
          filter: showImage
            ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'
            : undefined,
          pointerEvents: 'none',
        }}
      />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5,
          bgcolor: 'rgba(0,0,0,0.72)',
          color: 'common.white',
          fontWeight: 700,
        }}
      >
        HIGHLIGHT
      </Typography>
    </Box>
  );
};
