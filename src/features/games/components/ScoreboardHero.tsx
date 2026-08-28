import { Box, Chip, Stack, Typography } from '@mui/material';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { GameStatusChip } from '@/features/games/components/GameStatusChip';
import {
  formatDownDistance,
  formatYardLine,
  getScoreboardStatusLine,
  isScoreStatus,
} from '@/features/games/presentation';
import type { Game, GamePlay, GameTeam } from '@/features/games/types';

const TeamColumn = ({
  team,
  score,
  side,
}: {
  readonly team: GameTeam;
  readonly score: number | null;
  readonly side: 'Away' | 'Home';
}) => (
  <Stack
    direction={{ xs: 'column', sm: side === 'Away' ? 'row' : 'row-reverse' }}
    spacing={{ xs: 0.5, sm: 1.5 }}
    sx={{ alignItems: 'center', minWidth: 0 }}
    aria-label={`${side} team ${team.fullName}${score === null ? '' : `, ${score} points`}`}
  >
    <TeamHelmet team={team.abbreviation} size="md" decorative />
    <Stack
      sx={{
        alignItems: {
          xs: 'center',
          sm: side === 'Away' ? 'flex-start' : 'flex-end',
        },
        minWidth: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {team.abbreviation}
      </Typography>
      <Typography
        sx={{
          fontWeight: 850,
          lineHeight: 1.15,
          textAlign: side === 'Away' ? 'left' : 'right',
        }}
      >
        {team.fullName}
      </Typography>
    </Stack>
    {score === null ? null : (
      <Typography
        variant="h2"
        sx={{ fontWeight: 950, fontVariantNumeric: 'tabular-nums' }}
      >
        {score}
      </Typography>
    )}
  </Stack>
);

export const ScoreboardHero = ({
  game,
  latestPlay = null,
}: {
  readonly game: Game;
  readonly latestPlay?: GamePlay | null;
}) => {
  const canShowScore =
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const statusLine = getScoreboardStatusLine(game);
  const downDistance =
    latestPlay === null
      ? null
      : formatDownDistance(
          latestPlay.end.down ?? latestPlay.start.down,
          latestPlay.end.distance ?? latestPlay.start.distance,
        );
  const yardLine =
    latestPlay === null
      ? null
      : (latestPlay.end.yardLine ?? latestPlay.start.yardLine);
  const situation = [
    downDistance,
    yardLine === null ? null : formatYardLine(yardLine),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box
      component="section"
      aria-label="Game score"
      sx={{
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'appSurfaces.borderStrong',
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 3 },
        py: { xs: 2.5, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 0.7fr 1fr', sm: '1fr auto 1fr' },
          gap: { xs: 1, sm: 3 },
          alignItems: 'center',
        }}
      >
        <TeamColumn
          team={game.awayTeam}
          score={canShowScore ? game.awayScore : null}
          side="Away"
        />
        <Stack
          spacing={0.75}
          sx={{ alignItems: 'center', textAlign: 'center' }}
        >
          <GameStatusChip status={game.status} />
          {statusLine === null ? null : (
            <Typography sx={{ fontWeight: 850 }}>{statusLine}</Typography>
          )}
          {situation === '' ? null : (
            <Typography variant="body2" color="text.secondary">
              {situation}
            </Typography>
          )}
          {latestPlay?.possessionTeam === null ||
          latestPlay?.possessionTeam === undefined ? null : (
            <Typography variant="caption" sx={{ fontWeight: 850 }}>
              {latestPlay.possessionTeam.abbreviation} ball
            </Typography>
          )}
        </Stack>
        <TeamColumn
          team={game.homeTeam}
          score={canShowScore ? game.homeScore : null}
          side="Home"
        />
      </Box>
      {game.isNeutralSite ? (
        <Chip
          label="Neutral site"
          variant="outlined"
          size="small"
          sx={{ display: 'flex', width: 'fit-content', mx: 'auto', mt: 1.5 }}
        />
      ) : null}
    </Box>
  );
};
