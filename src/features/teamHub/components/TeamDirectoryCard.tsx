import {
  Box,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { FavoriteTeamButton } from '@/features/teamHub/components/FavoriteTeamButton';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import {
  getTeamThemeTokens,
  getTeamVisualCssVariables,
} from '@/features/teamVisualIdentity/teamTheme';
import type { Team } from '@/features/teams/types';

export const TeamDirectoryCard = ({ team }: { readonly team: Team }) => {
  const theme = useTheme();
  const tokens = getTeamThemeTokens(
    getTeamVisualConfig(team.abbreviation),
    theme.palette.mode,
  );

  return (
    <Card
      variant="outlined"
      data-team-card={team.abbreviation}
      sx={{
        ...getTeamVisualCssVariables(tokens),
        height: '100%',
        borderColor: tokens.subtleBorder,
        backgroundImage: `linear-gradient(135deg, ${tokens.subtleBackgroundStrong}, transparent 64%)`,
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TeamHelmet team={team.abbreviation} size="md" />
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component="h3" variant="h5">
                <Link
                  component={RouterLink}
                  to={`/teams/${team.id}`}
                  color="inherit"
                  underline="hover"
                >
                  {team.fullName}
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {team.abbreviation} · {team.conference} {team.division}
              </Typography>
            </Box>
          </Stack>
          <FavoriteTeamButton
            teamId={team.id}
            teamName={team.fullName}
            compact
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
