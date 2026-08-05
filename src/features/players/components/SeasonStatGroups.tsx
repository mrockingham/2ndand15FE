import { Box, Paper, Stack, Typography } from '@mui/material';

import { visibleSeasonGroups } from '@/features/players/metrics';
import { formatStatValue } from '@/features/players/presentation';
import type { PlayerSeasonStat } from '@/features/players/types';

export const SeasonStatGroups = ({
  stat,
}: {
  readonly stat: PlayerSeasonStat;
}) => {
  const groups = visibleSeasonGroups(stat);
  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          }}
        >
          <Metric label="Games" value={String(stat.games)} />
          <Metric label="Teams represented" value={String(stat.teamCount)} />
          <Metric label="Position" value={stat.position ?? 'Not available'} />
          <Metric
            label="Position group"
            value={stat.positionGroup ?? 'Not available'}
          />
        </Box>
      </Paper>
      {groups.map((group) => (
        <Paper
          key={group.key}
          component="section"
          variant="outlined"
          sx={{ p: 2.5 }}
          aria-labelledby={`stat-group-${group.key}`}
        >
          <Typography
            id={`stat-group-${group.key}`}
            component="h3"
            variant="h4"
          >
            {group.label}
          </Typography>
          {group.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {group.description}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              mt: 2,
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
            }}
          >
            {group.metrics.map((metric) => (
              <Metric
                key={metric.key}
                label={metric.label}
                value={formatStatValue(metric.value(stat), metric.suffix)}
              />
            ))}
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

const Metric = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <div>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="h5"
      sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </Typography>
  </div>
);
