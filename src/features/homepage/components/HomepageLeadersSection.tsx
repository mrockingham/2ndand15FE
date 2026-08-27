import { Box, Card, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import {
  formatLeaderValue,
  leaderAccessibleLabel,
  leaderCategoryLabel,
  leaderMetricLabel,
} from '@/features/homepage/presentation';
import type {
  HomepageLeader,
  HomepageLeaderCategory,
  HomepageLeaders,
} from '@/features/homepage/types';

const CATEGORIES: readonly HomepageLeaderCategory[] = [
  'passing',
  'rushing',
  'receiving',
];

const LeaderRow = ({
  leader,
  category,
}: {
  readonly leader: HomepageLeader;
  readonly category: HomepageLeaderCategory;
}) => {
  const isTop = leader.rank === 1;
  return (
    <Stack
      component={RouterLink}
      to={`/players/${leader.player.id}`}
      direction="row"
      spacing={1.75}
      aria-label={leaderAccessibleLabel(leader, category)}
      sx={{
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        p: isTop ? 1.5 : 1,
        borderRadius: 2,
        bgcolor: isTop ? 'action.hover' : 'transparent',
      }}
    >
      <Typography
        variant={isTop ? 'h4' : 'h6'}
        sx={{
          width: 32,
          flexShrink: 0,
          fontWeight: 900,
          color: isTop ? 'primary.main' : 'text.secondary',
        }}
        aria-hidden="true"
      >
        {leader.rank}
      </Typography>
      <PlayerAvatar
        name={leader.player.displayName}
        headshotUrl={leader.player.headshotUrl}
        width={isTop ? 64 : 48}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: isTop ? 800 : 700 }} noWrap>
          {leader.player.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {leader.team ? `${leader.team.abbreviation} · ` : ''}
          {leader.player.position ?? leader.player.positionGroup ?? ''}
        </Typography>
        <Typography
          variant={isTop ? 'h6' : 'body1'}
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatLeaderValue(leader.value)}
        </Typography>
      </Box>
    </Stack>
  );
};

export const HomepageLeadersSection = ({
  leaders,
}: {
  readonly leaders: HomepageLeaders;
}) => {
  const [category, setCategory] = useState<HomepageLeaderCategory>('passing');
  const rows = leaders[category];
  const hasAnyLeaders =
    leaders.passing.length > 0 ||
    leaders.rushing.length > 0 ||
    leaders.receiving.length > 0;
  if (!hasAnyLeaders) return null;

  return (
    <Card
      component="section"
      aria-labelledby="league-leaders-heading"
      sx={{ p: { xs: 2.5, md: 3 } }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography id="league-leaders-heading" component="h2" variant="h3">
          League Leaders
        </Typography>
        <Typography color="text.secondary">
          {leaders.season} Regular Season
        </Typography>
      </Box>
      <Tabs
        value={category}
        onChange={(_, next: HomepageLeaderCategory) => setCategory(next)}
        aria-label="League leaders category"
        sx={{ minHeight: 0, borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {CATEGORIES.map((value) => (
          <Tab
            key={value}
            value={value}
            label={leaderCategoryLabel[value]}
            sx={{ minHeight: 0, py: 1.25 }}
          />
        ))}
      </Tabs>
      <Typography
        component="h3"
        variant="overline"
        color="text.secondary"
        sx={{ mb: 1, display: 'block' }}
      >
        {leaderMetricLabel[category]}
      </Typography>
      {rows.length === 0 ? (
        <Typography color="text.secondary">
          No {leaderCategoryLabel[category].toLowerCase()} leaders are available
          for {leaders.season}.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((leader) => (
            <LeaderRow
              key={leader.player.id}
              leader={leader}
              category={category}
            />
          ))}
        </Stack>
      )}
    </Card>
  );
};
