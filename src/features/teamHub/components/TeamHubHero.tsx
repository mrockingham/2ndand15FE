import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { FavoriteTeamButton } from '@/features/teamHub/components/FavoriteTeamButton';
import type { TeamHomepageBanner } from '@/features/teamHub/types';
import type { Team } from '@/features/teams/types';
import { getTeamVisualCssVariables } from '@/features/teamVisualIdentity/teamTheme';
import type { TeamThemeTokens } from '@/features/teamVisualIdentity/teamVisualTypes';

export const TeamHubHero = ({
  banner,
  team,
  teamTokens,
  preview = false,
}: {
  readonly banner: TeamHomepageBanner;
  readonly team: Team;
  readonly teamTokens: TeamThemeTokens;
  readonly preview?: boolean;
}) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage =
    banner.imageUrl !== null && banner.imageUrl !== failedImageUrl;

  return (
    <Paper
      component={preview ? 'div' : 'header'}
      variant="outlined"
      data-team-hub-identity={team.abbreviation}
      data-banner-image={showImage ? 'custom' : 'fallback'}
      data-banner-overlay-opacity={banner.overlayOpacity}
      sx={{
        ...getTeamVisualCssVariables(teamTokens),
        position: 'relative',
        isolation: 'isolate',
        minHeight: { xs: 250, md: preview ? 280 : 320 },
        p: { xs: 2.5, md: 4 },
        overflow: 'hidden',
        borderColor: teamTokens.subtleBorder,
        backgroundImage: `linear-gradient(125deg, ${teamTokens.heroStart}, ${teamTokens.heroEnd} 48%, transparent 82%)`,
      }}
    >
      {showImage ? (
        <>
          <Box
            component="img"
            src={banner.imageUrl!}
            alt=""
            aria-hidden="true"
            onError={() => setFailedImageUrl(banner.imageUrl)}
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: -3,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${String(banner.focalX)}% ${String(banner.focalY)}%`,
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: -2,
              bgcolor: 'var(--team-primary)',
              opacity: banner.overlayOpacity / 100,
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              background:
                'linear-gradient(90deg, rgba(4,8,18,0.92) 0%, rgba(4,8,18,0.62) 52%, rgba(4,8,18,0.34) 100%), linear-gradient(0deg, rgba(4,8,18,0.72), transparent 65%)',
            }}
          />
        </>
      ) : null}
      <Stack
        spacing={3}
        sx={{ minHeight: 'inherit', justifyContent: 'center' }}
      >
        {preview ? null : (
          <Button
            component={RouterLink}
            to="/teams"
            startIcon={<ArrowBackRounded />}
            sx={{
              alignSelf: 'flex-start',
              color: showImage ? '#FFFFFF' : undefined,
            }}
          >
            All teams
          </Button>
        )}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { md: 'center' } }}
        >
          <TeamHelmet team={team.abbreviation} size="lg" />
          <Box sx={{ flexGrow: 1, color: showImage ? '#FFFFFF' : undefined }}>
            <Typography
              variant="overline"
              color={showImage ? 'inherit' : 'var(--team-primary)'}
            >
              {team.abbreviation} · {team.conference} {team.division}
            </Typography>
            <Typography component={preview ? 'h3' : 'h1'} variant="h2">
              {team.fullName}
            </Typography>
            <Typography
              color={showImage ? 'rgba(255,255,255,0.82)' : 'text.secondary'}
            >
              {team.city} · {team.name} · Active NFL team
            </Typography>
          </Box>
          {preview ? null : (
            <Stack spacing={1.25} sx={{ alignItems: { md: 'flex-end' } }}>
              <FavoriteTeamButton teamId={team.id} teamName={team.fullName} />
              <Button
                component={RouterLink}
                to={`/stats?teamId=${team.id}`}
                sx={{ color: showImage ? '#FFFFFF' : undefined }}
              >
                Team-filtered Stats
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
