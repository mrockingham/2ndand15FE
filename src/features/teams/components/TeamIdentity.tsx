import { alpha, Box, type SxProps, type Theme } from '@mui/material';
import { useState } from 'react';

import { safeTeamColor } from '@/features/teams/teamPresentation';

export interface TeamIdentityData {
  readonly abbreviation: string;
  readonly fullName: string;
  readonly logoUrl: string | null;
  readonly primaryColor: string;
}

interface TeamIdentityProps {
  readonly decorative?: boolean;
  readonly size?: number;
  readonly sx?: SxProps<Theme>;
  readonly team: TeamIdentityData;
}

export const TeamIdentity = ({
  decorative = false,
  size = 56,
  sx,
  team,
}: TeamIdentityProps) => {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const showImage = team.logoUrl !== null && failedLogoUrl !== team.logoUrl;

  return (
    <Box
      sx={[
        (theme) => {
          const accent = safeTeamColor(
            team.primaryColor,
            theme.palette.primary.main,
          );
          return {
            position: 'relative',
            display: 'grid',
            width: size,
            height: size,
            flex: `0 0 ${size}px`,
            placeItems: 'center',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: alpha(
              accent,
              theme.palette.mode === 'dark' ? 0.78 : 0.5,
            ),
            borderRadius: '50%',
            color: theme.palette.text.primary,
            bgcolor: alpha(accent, theme.palette.mode === 'dark' ? 0.2 : 0.1),
            boxShadow: `inset 0 0 0 3px ${alpha(accent, 0.08)}`,
          };
        },
        ...(sx === undefined ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {showImage ? (
        <Box
          component="img"
          src={team.logoUrl ?? undefined}
          alt={decorative ? '' : `${team.fullName} logo`}
          onError={() => setFailedLogoUrl(team.logoUrl)}
          sx={{ width: '76%', height: '76%', objectFit: 'contain' }}
        />
      ) : (
        <Box
          component="span"
          role={decorative ? undefined : 'img'}
          aria-hidden={decorative ? true : undefined}
          aria-label={decorative ? undefined : `${team.fullName} abbreviation`}
          sx={{
            fontSize: Math.max(11, size * 0.27),
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {team.abbreviation}
        </Box>
      )}
    </Box>
  );
};
