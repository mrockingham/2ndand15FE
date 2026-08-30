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

const MovementBadge = ({
  entry,
  onImage,
}: {
  readonly entry: PowerRankingEntry;
  readonly onImage: boolean;
}) => {
  const movement = movementDisplay(entry.movement, entry.previousRank);
  return (
    <Chip
      size="small"
      label={movement.label}
      sx={{
        color: onImage ? '#FFFFFF' : movementToneColor[movement.tone],
        borderColor: onImage
          ? 'rgba(255,255,255,0.7)'
          : movementToneColor[movement.tone],
        fontWeight: 700,
      }}
      variant="outlined"
    />
  );
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
        sx={{ mt: 1, color: onImage ? onImageColor : color }}
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

// Reuses the same banner/focal-point/overlay contract as the Team Hub hero
// (`TeamHubHero.tsx`) so Top 5 cards look at home next to the rest of the
// site. The full Team Hub overview is heavier than a banner-only lookup
// would need, but it is the only existing public source for a team's
// banner image, and this only runs for the 5 featured teams (never all 32).
const FeatureCard = ({
  entry,
  emphasis,
}: {
  readonly entry: PowerRankingEntry;
  readonly emphasis: 'primary' | 'secondary';
}) => {
  const theme = useTheme();
  const config = getTeamVisualConfig(entry.team.abbreviation);
  const tokens = getTeamThemeTokens(config, theme.palette.mode);
  const bannerQuery = useTeamHubQuery(entry.team.id);
  const banner = bannerQuery.data?.overview.homepage.banner ?? null;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage =
    banner?.imageUrl != null && banner.imageUrl !== failedImageUrl;
  const isPrimary = emphasis === 'primary';

  return (
    <Paper
      variant="outlined"
      sx={{
        ...getTeamVisualCssVariables(tokens),
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        p: { xs: 2.5, md: isPrimary ? 3.5 : 3 },
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
                'linear-gradient(180deg, rgba(4,8,18,0.45) 0%, rgba(4,8,18,0.88) 100%)',
            }}
          />
        </>
      ) : null}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { sm: 'flex-start' } }}
      >
        <TeamHelmet
          team={entry.team.abbreviation}
          size={isPrimary ? 'lg' : 'md'}
          decorative
        />
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography
              variant="overline"
              sx={{ color: showImage ? '#FFFFFF' : 'primary.light' }}
            >
              {isPrimary ? '#1 Overall' : `#${String(entry.rank)}`}
            </Typography>
            <MovementBadge entry={entry} onImage={showImage} />
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
            component="h2"
            variant={isPrimary ? 'h3' : 'h5'}
            sx={{ color: showImage ? '#FFFFFF' : undefined }}
          >
            <Link
              component={RouterLink}
              to={`/teams/${entry.team.id}`}
              color="inherit"
              underline="hover"
            >
              {entry.team.name}
            </Link>
          </Typography>
          <Typography
            variant={isPrimary ? 'h6' : 'subtitle1'}
            sx={{
              color: showImage ? 'rgba(255,255,255,0.85)' : 'text.secondary',
            }}
          >
            {entry.headline}
          </Typography>
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
      </Stack>
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
    <Box
      component="section"
      aria-label="Top 5"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
      }}
    >
      {topFive.map((entry, index) => (
        <FeatureCard
          key={entry.team.id}
          entry={entry}
          emphasis={index === 0 ? 'primary' : 'secondary'}
        />
      ))}
    </Box>
  );
};
