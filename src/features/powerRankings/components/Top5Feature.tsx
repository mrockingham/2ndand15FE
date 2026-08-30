import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  movementDisplay,
  movementToneColor,
} from '@/features/powerRankings/presentation';
import type { PowerRankingEntry } from '@/features/powerRankings/types';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import {
  getTeamThemeTokens,
  getTeamVisualCssVariables,
} from '@/features/teamVisualIdentity/teamTheme';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';

// Uses the same public Team Hub overview the Team Hub hero already fetches
// (`/teams/:id/hub`), so this only adds 5 requests total -- never all 32 --
// and shares its cache with the real Team Hub pages.
const useTeamBanner = (teamId: string) => {
  const query = useTeamHubQuery(teamId);
  return query.data?.overview.homepage.banner ?? null;
};

const IssueList = ({
  title,
  items,
  color,
  onImage,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly color: 'success.main' | 'error.main';
  readonly onImage: boolean;
}) => {
  if (items.length === 0) return null;
  const onImageColor = color === 'success.main' ? '#8CFFB0' : '#FFB4A8';
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ color: onImage ? onImageColor : color }}
      >
        {title}
      </Typography>
      <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
        {items.map((item) => (
          <Typography
            component="li"
            key={item}
            sx={{ color: onImage ? 'rgba(255,255,255,0.92)' : undefined }}
          >
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

// Same header/detail layout as the ranks 6-32 `RankingRow`, but permanently
// expanded (Top 5 must show full editorial content without a click) and
// with each team's Team Hub banner as a background, per-card, all five --
// not just rank #1 -- falling back to the existing team-color gradient
// treatment when there is no banner or the image fails to load.
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
        ...getTeamVisualCssVariables(tokens),
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        borderColor: 'appSurfaces.borderStrong',
        backgroundImage: showImage
          ? undefined
          : 'linear-gradient(125deg, var(--team-hero-start), var(--team-hero-end) 55%, transparent 90%)',
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
                'linear-gradient(180deg, rgba(4,8,18,0.5) 0%, rgba(4,8,18,0.88) 100%)',
            }}
          />
        </>
      ) : null}
      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}
        >
          <Typography
            variant="h6"
            sx={{
              width: 32,
              flexShrink: 0,
              color: showImage ? '#FFFFFF' : 'text.secondary',
            }}
          >
            {entry.rank}
          </Typography>
          <TeamHelmet team={entry.team.abbreviation} size="sm" decorative />
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Link
              component={RouterLink}
              to={`/teams/${entry.team.id}`}
              color="inherit"
              underline="hover"
              sx={{ fontWeight: 700, color: showImage ? '#FFFFFF' : undefined }}
            >
              {entry.team.name}
            </Link>
            <Typography
              noWrap
              variant="body2"
              sx={{
                color: showImage ? 'rgba(255,255,255,0.85)' : 'text.secondary',
              }}
            >
              {entry.headline}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={movement.label}
            sx={{
              color: showImage ? '#FFFFFF' : movementToneColor[movement.tone],
              borderColor: showImage
                ? 'rgba(255,255,255,0.7)'
                : movementToneColor[movement.tone],
              fontWeight: 700,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
            variant="outlined"
          />
          <Chip
            size="small"
            label={entry.tier}
            variant={showImage ? 'outlined' : 'filled'}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              ...(showImage
                ? { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.7)' }
                : null),
            }}
          />
          <ExpandLessRounded
            aria-hidden="true"
            sx={{ color: showImage ? '#FFFFFF' : 'text.secondary' }}
          />
        </Stack>
        <Stack spacing={1.5} sx={{ pl: { sm: 6 }, pt: 1.5 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { sm: 'none' }, flexWrap: 'wrap' }}
          >
            <Chip
              size="small"
              label={movement.label}
              sx={{
                color: showImage ? '#FFFFFF' : movementToneColor[movement.tone],
                borderColor: showImage
                  ? 'rgba(255,255,255,0.7)'
                  : movementToneColor[movement.tone],
              }}
              variant="outlined"
            />
            <Chip
              size="small"
              label={entry.tier}
              variant={showImage ? 'outlined' : 'filled'}
              sx={
                showImage
                  ? { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.7)' }
                  : undefined
              }
            />
          </Stack>
          <Typography
            sx={{ color: showImage ? 'rgba(255,255,255,0.92)' : undefined }}
          >
            {entry.summary}
          </Typography>
          <IssueList
            title="Strengths"
            items={entry.strengths}
            color="success.main"
            onImage={showImage}
          />
          <IssueList
            title="Concerns"
            items={entry.concerns}
            color="error.main"
            onImage={showImage}
          />
        </Stack>
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
    <Stack spacing={1.5} component="section" aria-label="Top 5">
      {topFive.map((entry) => (
        <Top5Row key={entry.team.id} entry={entry} />
      ))}
    </Stack>
  );
};
