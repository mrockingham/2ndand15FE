import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { Box, ButtonBase, Card, Stack, Typography } from '@mui/material';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import {
  getTeamThemeTokens,
  getTeamVisualCssVariables,
} from '@/features/teamVisualIdentity/teamTheme';
import type { Team } from '@/features/teams/types';

interface TeamOptionCardProps {
  readonly disabled?: boolean;
  readonly onSelect: (teamId: string) => void;
  readonly selected: boolean;
  readonly team: Team;
}

export const TeamOptionCard = ({
  disabled = false,
  onSelect,
  selected,
  team,
}: TeamOptionCardProps) => (
  <Card
    sx={(theme) => {
      const tokens = getTeamThemeTokens(
        getTeamVisualConfig(team.abbreviation),
        theme.palette.mode,
      );
      return {
        ...getTeamVisualCssVariables(tokens),
        height: '100%',
        overflow: 'hidden',
        borderColor: selected ? tokens.subtleBorder : 'appSurfaces.border',
        backgroundImage: selected
          ? `linear-gradient(135deg, ${tokens.subtleBackgroundStrong}, transparent 70%)`
          : undefined,
        boxShadow: selected ? `0 0 0 2px ${tokens.subtleBorder}` : undefined,
      };
    }}
  >
    <ButtonBase
      role="radio"
      aria-checked={selected}
      aria-label={`${selected ? 'Selected: ' : 'Select '}${team.fullName}`}
      disabled={disabled}
      onClick={() => onSelect(team.id)}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 148,
        justifyContent: 'stretch',
        p: 2.25,
        textAlign: 'left',
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'secondary.main',
          outlineOffset: -3,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ width: '100%', alignItems: 'center' }}
      >
        <TeamHelmet team={team.abbreviation} size="md" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h4" component="span" sx={{ display: 'block' }}>
            {team.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {team.conference} {team.division}
          </Typography>
          <Typography
            variant="overline"
            color={selected ? 'var(--team-primary)' : 'text.secondary'}
            sx={{ display: 'block', mt: 1 }}
          >
            {selected ? 'SELECTED' : team.abbreviation}
          </Typography>
        </Box>
        {selected ? (
          <CheckCircleRounded color="primary" aria-hidden="true" />
        ) : null}
      </Stack>
    </ButtonBase>
  </Card>
);
