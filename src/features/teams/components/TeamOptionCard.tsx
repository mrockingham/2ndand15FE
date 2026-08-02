import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { Box, ButtonBase, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { TeamIdentity } from '@/features/teams/components/TeamIdentity';
import { safeTeamColor } from '@/features/teams/teamPresentation';
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
      const accent = safeTeamColor(
        team.primaryColor,
        theme.palette.primary.main,
      );
      return {
        height: '100%',
        overflow: 'hidden',
        borderColor: selected ? accent : 'appSurfaces.border',
        boxShadow: selected
          ? `0 0 0 2px ${alpha(accent, 0.35)}, 0 20px 48px ${alpha(accent, 0.18)}`
          : undefined,
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
        <TeamIdentity team={team} size={62} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h4" component="span" sx={{ display: 'block' }}>
            {team.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {team.conference} {team.division}
          </Typography>
          <Typography
            variant="overline"
            color={selected ? 'primary.light' : 'text.secondary'}
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
