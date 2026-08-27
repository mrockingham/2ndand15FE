import PlayCircleRounded from '@mui/icons-material/PlayCircleRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import { Box, Chip } from '@mui/material';
import { useState } from 'react';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { contentTypeLabel } from '@/features/articles/presentation';
import type { ArticleTeam } from '@/features/articles/types';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';

export const MediaThumbnail = ({
  thumbnailUrl,
  alt,
  contentType,
  team,
}: {
  readonly thumbnailUrl: string | null;
  readonly alt: string;
  readonly contentType: 'VIDEO' | 'HIGHLIGHT';
  readonly team?: ArticleTeam;
}) => {
  const [failed, setFailed] = useState(false);
  const label = contentTypeLabel(contentType);
  const config = getTeamVisualConfig(team?.abbreviation);
  const showImage = thumbnailUrl !== null && !failed;
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        borderRadius: 1,
        bgcolor: config?.primaryColor ?? 'action.hover',
        backgroundImage: config
          ? `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`
          : undefined,
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
          onError={() => setFailed(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : team ? (
        <TeamHelmet team={team.abbreviation} size="lg" decorative />
      ) : (
        <SportsFootballRounded
          aria-hidden
          sx={{ fontSize: 48, color: 'common.white', opacity: 0.85 }}
        />
      )}
      <PlayCircleRounded
        aria-hidden
        sx={{
          position: 'absolute',
          fontSize: 56,
          color: 'common.white',
          opacity: 0.9,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
          pointerEvents: 'none',
        }}
      />
      {label ? (
        <Chip
          size="small"
          label={label}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(0,0,0,0.72)',
            color: 'common.white',
            fontWeight: 700,
          }}
        />
      ) : null}
    </Box>
  );
};
