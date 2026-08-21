import { Box, useTheme } from '@mui/material';

import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import { getTeamThemeTokens } from '@/features/teamVisualIdentity/teamTheme';

interface TeamBadgeProps {
  readonly team: string;
  readonly size?: number;
  readonly className?: string;
  readonly decorative?: boolean;
}

const displayAbbreviation = (team: string) =>
  team
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || '2&15';

export const TeamBadge = ({
  team,
  size = 28,
  className,
  decorative = false,
}: TeamBadgeProps) => {
  const theme = useTheme();
  const config = getTeamVisualConfig(team);
  const tokens = getTeamThemeTokens(config, theme.palette.mode);
  const abbreviation = config?.abbreviation ?? displayAbbreviation(team);

  return (
    <Box
      component="span"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={
        decorative
          ? undefined
          : `${config?.teamName ?? abbreviation} team badge`
      }
      sx={{
        display: 'inline-grid',
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        placeItems: 'center',
        border: '2px solid',
        borderColor: config?.secondaryColor ?? tokens.secondary,
        borderRadius: '32%',
        color: tokens.onPrimary,
        bgcolor: config?.primaryColor ?? tokens.primary,
        fontSize: Math.max(8, Math.round(size * 0.31)),
        fontWeight: 900,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        boxShadow: `inset 0 0 0 1px ${tokens.subtleBorder}`,
      }}
    >
      {abbreviation}
    </Box>
  );
};
