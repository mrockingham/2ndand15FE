import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  movementDisplay,
  movementToneColor,
} from '@/features/powerRankings/presentation';
import type { PowerRankingEntry } from '@/features/powerRankings/types';

const MovementBadge = ({ entry }: { readonly entry: PowerRankingEntry }) => {
  const movement = movementDisplay(entry.movement, entry.previousRank);
  return (
    <Chip
      size="small"
      label={movement.label}
      sx={{
        color: movementToneColor[movement.tone],
        borderColor: movementToneColor[movement.tone],
        fontWeight: 700,
      }}
      variant="outlined"
    />
  );
};

const FeaturedEntry = ({ entry }: { readonly entry: PowerRankingEntry }) => (
  <Paper
    variant="outlined"
    sx={{ p: { xs: 2.5, md: 3.5 }, borderColor: 'appSurfaces.borderStrong' }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2.5}
      sx={{ alignItems: { sm: 'flex-start' } }}
    >
      <TeamHelmet team={entry.team.abbreviation} size="lg" decorative />
      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography variant="overline" color="primary.light">
            #{entry.rank}
          </Typography>
          <MovementBadge entry={entry} />
          <Chip size="small" label={entry.tier} />
        </Stack>
        <Typography component="h2" variant="h3">
          <Link
            component={RouterLink}
            to={`/teams/${entry.team.id}`}
            color="inherit"
            underline="hover"
          >
            {entry.team.name}
          </Link>
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {entry.headline}
        </Typography>
        <Typography>{entry.summary}</Typography>
        {entry.strengths.length ? (
          <Box>
            <Typography variant="subtitle2" color="success.main" sx={{ mt: 1 }}>
              Strengths
            </Typography>
            <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
              {entry.strengths.map((strength) => (
                <Typography component="li" key={strength}>
                  {strength}
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : null}
        {entry.concerns.length ? (
          <Box>
            <Typography variant="subtitle2" color="error.main" sx={{ mt: 1 }}>
              Concerns
            </Typography>
            <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
              {entry.concerns.map((concern) => (
                <Typography component="li" key={concern}>
                  {concern}
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </Stack>
  </Paper>
);

const CompactEntry = ({ entry }: { readonly entry: PowerRankingEntry }) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <TeamHelmet team={entry.team.abbreviation} size="sm" decorative />
      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="overline" color="text.secondary">
            #{entry.rank}
          </Typography>
          <MovementBadge entry={entry} />
        </Stack>
        <Typography noWrap sx={{ fontWeight: 700 }}>
          <Link
            component={RouterLink}
            to={`/teams/${entry.team.id}`}
            color="inherit"
            underline="hover"
          >
            {entry.team.name}
          </Link>
        </Typography>
        <Typography noWrap color="text.secondary" variant="body2">
          {entry.headline}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
);

export const Top5Feature = ({
  entries,
}: {
  readonly entries: readonly PowerRankingEntry[];
}) => {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const [featured, ...compact] = sorted;
  if (!featured) return null;
  return (
    <Stack spacing={2} component="section" aria-label="Top 5">
      <FeaturedEntry entry={featured} />
      {compact.length ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {compact.map((entry) => (
            <CompactEntry key={entry.team.id} entry={entry} />
          ))}
        </Box>
      ) : null}
    </Stack>
  );
};
