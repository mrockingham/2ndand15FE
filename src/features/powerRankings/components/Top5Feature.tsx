import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import {
  Box,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { movementDisplay } from '@/features/powerRankings/presentation';
import type { PowerRankingEntry } from '@/features/powerRankings/types';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import { getTeamThemeTokens } from '@/features/teamVisualIdentity/teamTheme';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';

const PANEL_BACKGROUND = '#0B111E';
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
  dotColor,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly dotColor: string;
}) => {
  if (items.length === 0) return null;
  return (
    <Stack spacing={1.25}>
      <Typography
        variant="overline"
        sx={{ color: dotColor, fontWeight: 800, letterSpacing: 1 }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>
        {items.map((item) => (
          <Stack
            key={item}
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'flex-start' }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: dotColor,
                mt: '8px',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

// A wide, split "editorial" card: a dark content panel with the full
// rank/team/headline/summary/strengths/concerns copy on one side, and that
// team's Team Hub banner photo filling the other side edge-to-edge. Falls
// back to the existing team-color gradient + helmet when there is no banner
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
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '58% 42%' },
        overflow: 'hidden',
        borderColor: 'appSurfaces.borderStrong',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: PANEL_BACKGROUND,
          color: '#FFFFFF',
          p: { xs: 3, md: 4 },
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
                fontSize: { xs: 28, md: 34 },
                fontWeight: 800,
                color: tokens.secondary,
                lineHeight: 1,
                mb: '4px',
              }}
            >
              #
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 52, md: 68 },
                fontWeight: 900,
                lineHeight: 0.9,
              }}
            >
              {entry.rank}
            </Typography>
          </Stack>
          <TeamHelmet team={entry.team.abbreviation} size="lg" decorative />
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
                  color: tokens.secondary,
                  borderColor: tokens.secondary,
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
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <Stack spacing={1.5}>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            {entry.headline}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
            {entry.summary}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 4,
            rowGap: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            pt: 2.5,
            mt: 'auto',
          }}
        >
          <IssueColumn
            title="Strengths"
            items={entry.strengths}
            dotColor={STRENGTH_COLOR}
          />
          <Box
            sx={{
              borderLeft: { sm: '1px solid rgba(255,255,255,0.1)' },
              pl: { sm: 3 },
            }}
          >
            <IssueColumn
              title="Concerns"
              items={entry.concerns}
              dotColor={CONCERN_COLOR}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ position: 'relative', minHeight: { xs: 220, md: 'auto' } }}>
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.5)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ExpandLessRounded fontSize="small" />
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
