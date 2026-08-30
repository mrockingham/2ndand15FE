import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ErrorRounded from '@mui/icons-material/ErrorRounded';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { movementDisplay } from '@/features/powerRankings/presentation';
import type { PowerRankingEntry } from '@/features/powerRankings/types';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import { getTeamThemeTokens } from '@/features/teamVisualIdentity/teamTheme';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';

const STRENGTH_COLOR = '#7CE7B8';
const CONCERN_COLOR = '#FF9C8C';

// Uses the same public Team Hub overview the Team Hub hero already fetches
// (`/teams/:id/hub`), so this only adds 5 requests total -- never all 32 --
// and shares its cache with the real Team Hub pages.
const useTeamBanner = (teamId: string) => {
  const query = useTeamHubQuery(teamId);
  return query.data?.overview.homepage.banner ?? null;
};

const IssueColumn = ({
  title,
  items,
  color,
  icon,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly color: string;
  readonly icon: 'check' | 'error';
}) => {
  if (items.length === 0) return null;
  const Icon = icon === 'check' ? CheckCircleRounded : ErrorRounded;
  return (
    <Stack spacing={1.25}>
      <Typography sx={{ color, fontWeight: 800 }}>{title}</Typography>
      <Stack spacing={1}>
        {items.map((item) => (
          <Stack
            key={item}
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center' }}
          >
            <Icon sx={{ color, fontSize: 20, flexShrink: 0 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

// A full-bleed team-photo card with a frosted glass content panel floating
// on top -- rank, helmet, team name, movement/tier chips, headline,
// summary, and a two-column strengths/concerns list. Falls back to the
// existing team-color gradient plus TeamHelmet when a team has no banner
// image or it fails to load, so a broken URL never renders visibly broken.
const Top5Row = ({ entry }: { readonly entry: PowerRankingEntry }) => {
  const theme = useTheme();
  const config = getTeamVisualConfig(entry.team.abbreviation);
  const tokens = getTeamThemeTokens(config, theme.palette.mode);
  const banner = useTeamBanner(entry.team.id);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage =
    banner?.imageUrl != null && banner.imageUrl !== failedImageUrl;
  const movement = movementDisplay(entry.movement, entry.previousRank);

  return (
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        borderColor: 'appSurfaces.borderStrong',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'auto', md: 420 },
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={banner.imageUrl!}
          alt=""
          aria-hidden="true"
          onError={() => setFailedImageUrl(banner.imageUrl)}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -2,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${String(banner.focalX)}% ${String(banner.focalY)}%`,
          }}
        />
      ) : (
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pr: 6,
            background: `linear-gradient(160deg, ${tokens.primary}, ${tokens.secondary})`,
          }}
        >
          <TeamHelmet team={entry.team.abbreviation} size="lg" />
        </Box>
      )}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background:
            'linear-gradient(105deg, rgba(4,8,18,0.35) 0%, rgba(4,8,18,0.1) 62%, transparent 78%)',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.5)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ExpandLessRounded />
      </Box>
      <Box sx={{ p: { xs: 2, md: 3.5 }, flex: '1 1 auto', display: 'flex' }}>
        <Box
          sx={{
            width: { xs: '100%', md: '68%' },
            alignSelf: 'stretch',
            bgcolor: 'rgba(6,12,24,0.62)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 3,
            color: '#FFFFFF',
            p: { xs: 2.5, md: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Stack direction="row" sx={{ alignItems: 'flex-end' }}>
              <Typography
                sx={{
                  fontSize: { xs: 26, md: 32 },
                  fontWeight: 800,
                  lineHeight: 1,
                  mb: '4px',
                }}
              >
                #
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 48, md: 60 },
                  fontWeight: 900,
                  lineHeight: 0.9,
                }}
              >
                {entry.rank}
              </Typography>
            </Stack>
            <TeamHelmet team={entry.team.abbreviation} size="md" decorative />
            <Stack spacing={1}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                <Link
                  component={RouterLink}
                  to={`/teams/${entry.team.id}`}
                  color="inherit"
                  underline="hover"
                >
                  {entry.team.name}
                </Link>
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={movement.label}
                  variant="outlined"
                  sx={{
                    color: STRENGTH_COLOR,
                    borderColor: STRENGTH_COLOR,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  size="small"
                  label={entry.tier}
                  variant="outlined"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              {entry.headline}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {entry.summary}
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 4,
              rowGap: 2,
              mt: 'auto',
            }}
          >
            <IssueColumn
              title="Strengths"
              items={entry.strengths}
              color={STRENGTH_COLOR}
              icon="check"
            />
            <IssueColumn
              title="Concerns"
              items={entry.concerns}
              color={CONCERN_COLOR}
              icon="error"
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export const Top5Feature = ({
  entries,
}: {
  readonly entries: readonly PowerRankingEntry[];
}) => {
  const topFive = [...entries].sort((a, b) => a.rank - b.rank).slice(0, 5);
  if (topFive.length === 0) return null;
  return (
    <Stack spacing={2} component="section" aria-label="Top 5">
      {topFive.map((entry) => (
        <Top5Row key={entry.team.id} entry={entry} />
      ))}
    </Stack>
  );
};
