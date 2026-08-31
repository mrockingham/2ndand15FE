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
import { alpha, keyframes, useTheme } from '@mui/material/styles';
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

const energySweep = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(-170%, 0, 0) rotate(12deg);
  }
  12% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.72;
  }
  88%, 100% {
    opacity: 0;
    transform: translate3d(620%, 0, 0) rotate(12deg);
  }
`;

const energyStreak = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(-150%, 0, 0) rotate(-11deg) scaleX(0.65);
  }
  14% {
    opacity: 0.4;
  }
  52% {
    opacity: 0.85;
  }
  90%, 100% {
    opacity: 0;
    transform: translate3d(480%, 0, 0) rotate(-11deg) scaleX(1);
  }
`;

const energyFrameFlash = keyframes`
  0%, 100% {
    opacity: 0.18;
  }
  50% {
    opacity: 0.72;
  }
`;

const energySparkle = keyframes`
  0%, 100% {
    opacity: 0.12;
    transform: scale(0.35) rotate(0deg);
  }
  42% {
    opacity: 0.95;
    transform: scale(1) rotate(45deg);
  }
  68% {
    opacity: 0.28;
    transform: scale(0.55) rotate(68deg);
  }
`;

const SPARKLES = [
  { top: '8%', left: '52%', size: 3, duration: 1.7 },
  { top: '14%', left: '18%', size: 5, duration: 2.1 },
  { top: '26%', left: '76%', size: 7, duration: 2.8 },
  { top: '31%', left: '7%', size: 3, duration: 2.4 },
  { top: '43%', left: '36%', size: 4, duration: 1.9 },
  { top: '38%', left: '59%', size: 3, duration: 3.3 },
  { top: '57%', left: '88%', size: 5, duration: 2.5 },
  { top: '53%', left: '21%', size: 7, duration: 3.5 },
  { top: '62%', left: '49%', size: 3, duration: 1.8 },
  { top: '69%', left: '12%', size: 6, duration: 3.1 },
  { top: '79%', left: '64%', size: 4, duration: 2.3 },
  { top: '73%', left: '81%', size: 3, duration: 2 },
  { top: '88%', left: '32%', size: 4, duration: 2.7 },
  { top: '91%', left: '93%', size: 3, duration: 3 },
] as const;

const TeamEnergyOverlay = ({
  primary,
  secondary,
}: {
  readonly primary: string;
  readonly secondary: string;
}) => (
  <Box
    aria-hidden="true"
    data-team-energy="true"
    sx={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      opacity: 0.78,
      transition: 'opacity 220ms ease',
      // Static color pools help the motion feel native to each photo even
      // while the travelling light is between passes.
      background: [
        `radial-gradient(circle at 14% 74%, ${alpha(primary, 0.3)} 0%, transparent 44%)`,
        `radial-gradient(circle at 88% 18%, ${alpha(secondary, 0.2)} 0%, transparent 36%)`,
      ].join(', '),
      '@media (prefers-reduced-motion: reduce)': {
        opacity: 0.46,
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '-35%',
        bottom: '-35%',
        left: '-22%',
        width: '24%',
        background: `linear-gradient(90deg, transparent 0%, ${alpha(primary, 0.16)} 22%, ${alpha(secondary, 0.76)} 50%, ${alpha(primary, 0.2)} 78%, transparent 100%)`,
        filter: 'blur(7px)',
        mixBlendMode: 'screen',
        willChange: 'transform, opacity',
        animation: `${energySweep} 4.2s linear infinite`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          display: 'none',
        },
      }}
    />
    {SPARKLES.map((sparkle, index) => {
      const color = index % 2 === 0 ? secondary : primary;
      return (
        <Box
          key={`${sparkle.top}-${sparkle.left}`}
          sx={{
            position: 'absolute',
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            borderRadius: '50%',
            bgcolor: color,
            boxShadow: `0 0 ${String(sparkle.size * 2)}px ${alpha(color, 0.92)}`,
            mixBlendMode: 'screen',
            willChange: 'transform, opacity',
            animation: `${energySparkle} ${String(sparkle.duration)}s ease-in-out infinite`,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              background: `linear-gradient(90deg, transparent, ${alpha(color, 0.9)}, transparent)`,
              transform: 'translate(-50%, -50%)',
            },
            '&::before': {
              width: sparkle.size * 5,
              height: 1,
            },
            '&::after': {
              width: 1,
              height: sparkle.size * 5,
            },
            '@media (prefers-reduced-motion: reduce)': {
              display: 'none',
            },
          }}
        />
      );
    })}
    <Box
      sx={{
        position: 'absolute',
        top: '36%',
        left: '-38%',
        width: '42%',
        height: 2,
        borderRadius: 999,
        background: `linear-gradient(90deg, transparent, ${alpha(secondary, 0.92)} 46%, ${alpha(primary, 0.76)} 72%, transparent)`,
        boxShadow: [
          `0 18px 0 ${alpha(primary, 0.34)}`,
          `0 43px 0 ${alpha(secondary, 0.22)}`,
          `0 0 13px ${alpha(secondary, 0.72)}`,
        ].join(', '),
        mixBlendMode: 'screen',
        willChange: 'transform, opacity',
        animation: `${energyStreak} 4.2s linear infinite`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          display: 'none',
        },
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        boxShadow: [
          `inset 0 0 0 1px ${alpha(secondary, 0.28)}`,
          `inset 0 0 32px ${alpha(primary, 0.22)}`,
        ].join(', '),
        animation: `${energyFrameFlash} 4.2s ease-in-out infinite`,
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          opacity: 0.22,
        },
      }}
    />
  </Box>
);

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
        '&:hover [data-team-energy="true"]': {
          opacity: 1,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 240, md: 'auto' },
          isolation: 'isolate',
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
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: {
                xs: `${String(banner.focalX)}% ${String(banner.focalY)}%`,
                // This panel is narrower than the source photo on desktop,
                // so bias the crop toward the image's left side (while
                // still respecting the admin-configured vertical focal
                // point) to keep more of the player in frame.
                md: `${String(Math.max(0, banner.focalX + 25))}% ${String(banner.focalY)}%`,
              },
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
        {showImage ? (
          <TeamEnergyOverlay
            primary={tokens.primary}
            secondary={tokens.secondary}
          />
        ) : null}
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
