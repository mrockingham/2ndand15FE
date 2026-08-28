import { useState } from 'react';
import { Box, Link, Stack, Tab, Tabs, Typography } from '@mui/material';

import type {
  GameLeaders,
  GamePlayerPassingStats,
  GamePlayerReceivingStats,
  GamePlayerRushingStats,
  GameTeam,
} from '@/features/games/types';

type Category = 'passing' | 'rushing' | 'receiving';
type Leader =
  GamePlayerPassingStats | GamePlayerRushingStats | GamePlayerReceivingStats;
const value = (number: number | null, suffix: string) =>
  number === null ? '—' : `${number} ${suffix}`;

const LeaderSummary = ({
  leader,
  team,
  category,
}: {
  readonly leader: Leader | null;
  readonly team: GameTeam;
  readonly category: Category;
}) => {
  if (leader === null) return <Typography color="text.secondary">—</Typography>;
  const volume =
    category === 'passing'
      ? (leader as GamePlayerPassingStats).completions === null ||
        (leader as GamePlayerPassingStats).attempts === null
        ? null
        : `${(leader as GamePlayerPassingStats).completions}/${(leader as GamePlayerPassingStats).attempts}`
      : category === 'rushing'
        ? value((leader as GamePlayerRushingStats).attempts, 'CAR')
        : value((leader as GamePlayerReceivingStats).receptions, 'REC');
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {team.abbreviation}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 850 }}>
        {leader.player.displayName}
      </Typography>
      {volume === null ? null : (
        <Typography variant="caption">{volume}</Typography>
      )}
      <Typography sx={{ fontWeight: 900 }}>
        {value(leader.yards, 'YDS')}
      </Typography>
      {leader.touchdowns === null ? null : (
        <Typography variant="caption">
          {value(leader.touchdowns, 'TD')}
        </Typography>
      )}
    </Stack>
  );
};

export const PlayerQuickStats = ({
  leaders,
  awayTeam,
  homeTeam,
}: {
  readonly leaders: GameLeaders;
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
}) => {
  const [category, setCategory] = useState<Category>('passing');
  const key =
    category === 'passing'
      ? 'passer'
      : category === 'rushing'
        ? 'rusher'
        : 'receiver';
  return (
    <Stack spacing={1.5}>
      <Tabs
        value={category}
        onChange={(_event, next: Category) => setCategory(next)}
        aria-label="Player quick stats category"
        variant="scrollable"
      >
        <Tab value="passing" label="Passing" />
        <Tab value="rushing" label="Rushing" />
        <Tab value="receiving" label="Receiving" />
      </Tabs>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <LeaderSummary
          leader={leaders.away[key]}
          team={awayTeam}
          category={category}
        />
        <LeaderSummary
          leader={leaders.home[key]}
          team={homeTeam}
          category={category}
        />
      </Box>
      <Link
        href="#player-stats"
        underline="hover"
        sx={{ fontWeight: 800, fontSize: '0.875rem' }}
      >
        View All Player Stats →
      </Link>
    </Stack>
  );
};
