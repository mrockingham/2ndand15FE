import { Box, Stack, Typography } from '@mui/material';

import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type {
  GameLeaders,
  GamePlayerPassingStats,
  GamePlayerReceivingStats,
  GamePlayerRushingStats,
  GameTeam,
} from '@/features/games/types';

type Leader =
  GamePlayerPassingStats | GamePlayerRushingStats | GamePlayerReceivingStats;

const value = (number: number | null, suffix = '') =>
  number === null ? '—' : `${number.toLocaleString()}${suffix}`;

const secondary = (kind: 'Passing' | 'Rushing' | 'Receiving', row: Leader) => {
  if (kind === 'Passing') {
    const passing = row as GamePlayerPassingStats;
    return [
      passing.completions === null || passing.attempts === null
        ? null
        : `${passing.completions}/${passing.attempts}`,
      passing.touchdowns === null ? null : `${passing.touchdowns} TD`,
      passing.interceptions === null ? null : `${passing.interceptions} INT`,
    ].filter(Boolean);
  }
  const volume =
    kind === 'Rushing'
      ? (row as GamePlayerRushingStats).attempts
      : (row as GamePlayerReceivingStats).receptions;
  return [
    volume === null ? null : `${volume} ${kind === 'Rushing' ? 'CAR' : 'REC'}`,
    row.touchdowns === null ? null : `${row.touchdowns} TD`,
  ].filter(Boolean);
};

const LeaderSide = ({
  leader,
  team,
  align,
}: {
  readonly leader: Leader | null;
  readonly team: GameTeam;
  readonly align: 'left' | 'right';
}) => {
  if (leader === null) return <Box />;
  return (
    <Stack
      spacing={0.4}
      sx={{
        alignItems: align === 'left' ? 'flex-start' : 'flex-end',
        minWidth: 0,
      }}
    >
      <PlayerAvatar
        name={leader.player.displayName}
        headshotUrl={leader.player.headshotUrl}
        width={40}
      />
      <Typography variant="body2" sx={{ fontWeight: 850, textAlign: align }}>
        {leader.player.displayName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {team.abbreviation}
      </Typography>
    </Stack>
  );
};

export const GameLeadersPanel = ({
  leaders,
  awayTeam,
  homeTeam,
}: {
  readonly leaders: GameLeaders;
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
}) => {
  const categories = [
    ['Passing', leaders.away.passer, leaders.home.passer],
    ['Rushing', leaders.away.rusher, leaders.home.rusher],
    ['Receiving', leaders.away.receiver, leaders.home.receiver],
  ] as const;
  const available = categories.filter(
    ([, away, home]) => away !== null || home !== null,
  );
  if (available.length === 0) {
    return (
      <Typography color="text.secondary">
        Game leaders are not available yet.
      </Typography>
    );
  }
  return (
    <Stack spacing={2}>
      {available.map(([kind, away, home]) => (
        <Box key={kind}>
          <Typography variant="overline" color="text.secondary">
            {kind}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
              gap: 1,
              alignItems: 'end',
            }}
          >
            <LeaderSide leader={away} team={awayTeam} align="left" />
            <Stack spacing={0.25} sx={{ alignItems: 'center', pb: 0.5 }}>
              <Typography
                sx={{ fontWeight: 950, fontVariantNumeric: 'tabular-nums' }}
              >
                {away === null ? '—' : value(away.yards, ' YDS')}
                {' · '}
                {home === null ? '—' : value(home.yards, ' YDS')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                {away === null ? '' : secondary(kind, away).join(' · ')}
                {away !== null && home !== null ? ' | ' : ''}
                {home === null ? '' : secondary(kind, home).join(' · ')}
              </Typography>
            </Stack>
            <LeaderSide leader={home} team={homeTeam} align="right" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};
