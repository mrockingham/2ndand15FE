import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
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

const INK = '#0B111E';
const SUBTLE_INK = '#475569';
const PANEL_BACKGROUND = '#F6F7F9';
const STRENGTH_COLOR = '#16A34A';
const CONCERN_COLOR = '#EA580C';

// Uses the same public Team Hub overview the Team Hub hero already fetches
// (`/teams/:id/hub`), so this only adds 5 requests total -- never all 32 --
// and shares its cache with the real Team Hub pages.
const useTeamBanner = (teamId: string) => {
  const query = useTeamHubQuery(teamId);
  return query.data?.overview.homepage.banner ?? null;
};

// A team's public `name` is always "<City> <Mascot>" (e.g. "Philadelphia
// Eagles"), so the mascot is reliably the final word -- there is no
// separate city field on the Power Rankings API contract to split on.
const splitTeamName = (name: string) => {
  const words = name.trim().split(/\s+/);
  const mascot = words.pop() ?? name;
  return { city: words.join(' '), mascot };
};

const IssueColumn = ({
  title,
  items,
  color,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly color: string;
}) => {
  if (items.length === 0) return null;
  return (
    <Stack spacing={1.25}>
      <Typography
        variant="overline"
        sx={{ color, fontWeight: 800, letterSpacing: 1 }}
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
                bgcolor: color,
                mt: '8px',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ color: INK }}>{item}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

// A split card: the team's Team Hub banner photo fills the left side, with
// the city/mascot lockup (plus a faint watermark helmet) overlaid at its
// bottom; a light editorial panel on the right carries rank, tier/movement,
// headline, summary, and strengths/concerns. Falls back to the existing
// team-color gradient plus TeamHelmet when there is no banner image or it
// fails to load, so a broken URL never renders visibly broken.
const Top5Row = ({ entry }: { readonly entry: PowerRankingEntry }) => {
  const theme = useTheme();
  const config = getTeamVisualConfig(entry.team.abbreviation);
  const tokens = getTeamThemeTokens(config, theme.palette.mode);
  const banner = useTeamBanner(entry.team.id);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage =
    banner?.imageUrl != null && banner.imageUrl !== failedImageUrl;
  const movement = movementDisplay(entry.movement, entry.previousRank);
  const { city, mascot } = splitTeamName(entry.team.name);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '36% 64%' },
        overflow: 'hidden',
        borderColor: 'appSurfaces.borderStrong',
        borderRadius: 4,
      }}
    >
      <Box sx={{ position: 'relative', minHeight: { xs: 240, md: 'auto' } }}>
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
              background: `linear-gradient(160deg, ${tokens.primary}, ${tokens.secondary})`,
            }}
          />
        )}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(0deg, rgba(4,8,18,0.92) 0%, rgba(4,8,18,0.15) 55%, transparent 75%)',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            opacity: 0.16,
            transform: 'scale(2.4)',
            transformOrigin: 'bottom right',
          }}
        >
          <TeamHelmet team={entry.team.abbreviation} size="lg" />
        </Box>
        <Stack sx={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
          <Typography
            variant="overline"
            sx={{
              color: tokens.secondary,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            {city}
          </Typography>
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 900,
              fontStyle: 'italic',
              lineHeight: 0.95,
              fontSize: { xs: 34, md: 44 },
              textTransform: 'uppercase',
            }}
          >
            {mascot}
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          position: 'relative',
          bgcolor: PANEL_BACKGROUND,
          color: INK,
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <ChevronRightRounded
          aria-hidden="true"
          sx={{ position: 'absolute', top: 20, right: 20, color: INK }}
        />
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
                color: INK,
                lineHeight: 0.9,
              }}
            >
              {entry.rank}
            </Typography>
          </Stack>
          <TeamHelmet team={entry.team.abbreviation} size="lg" decorative />
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: INK }}>
              <Link
                component={RouterLink}
                to={`/teams/${entry.team.id}`}
                color="inherit"
                underline="hover"
              >
                {mascot}
              </Link>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={movement.label}
                sx={{ bgcolor: INK, color: '#FFFFFF', fontWeight: 700 }}
              />
              <Chip
                size="small"
                label={entry.tier}
                variant="outlined"
                sx={{ color: INK, borderColor: 'rgba(11,17,30,0.25)' }}
              />
            </Stack>
          </Stack>
        </Stack>
        <Divider sx={{ borderColor: 'rgba(11,17,30,0.1)' }} />
        <Stack spacing={1.5}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: INK }}>
            {entry.headline}
          </Typography>
          <Typography sx={{ color: SUBTLE_INK }}>{entry.summary}</Typography>
        </Stack>
        <Divider sx={{ borderColor: 'rgba(11,17,30,0.1)' }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 4,
            rowGap: 2,
          }}
        >
          <IssueColumn
            title="Strengths"
            items={entry.strengths}
            color={STRENGTH_COLOR}
          />
          <Box
            sx={{
              borderLeft: { sm: '1px solid rgba(11,17,30,0.1)' },
              pl: { sm: 3 },
            }}
          >
            <IssueColumn
              title="Concerns"
              items={entry.concerns}
              color={CONCERN_COLOR}
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
