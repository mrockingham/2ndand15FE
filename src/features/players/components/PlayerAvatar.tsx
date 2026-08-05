import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import {
  playerInitials,
  safeHeadshotUrl,
} from '@/features/players/presentation';

export const PlayerAvatar = ({
  name,
  headshotUrl,
  width = 88,
}: {
  readonly name: string;
  readonly headshotUrl: string | null;
  readonly width?: number;
}) => {
  const safeUrl = safeHeadshotUrl(headshotUrl);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = safeUrl !== null && failedUrl !== safeUrl;
  return (
    <Box
      sx={{
        width,
        aspectRatio: '4 / 5',
        flex: `0 0 ${width}px`,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={safeUrl}
          alt={`${name} headshot`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailedUrl(safeUrl)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Typography
          role="img"
          aria-label={`${name} initials`}
          variant="h4"
          sx={{ fontWeight: 950 }}
        >
          {playerInitials(name)}
        </Typography>
      )}
    </Box>
  );
};
