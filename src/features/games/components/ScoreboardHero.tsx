import { Box, Chip, Stack, Typography } from '@mui/material';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { GameStatusChip } from '@/features/games/components/GameStatusChip';
import {
  getScoreboardStatusLine,
  isScoreStatus,
} from '@/features/games/presentation';
import type { Game, GameTeam } from '@/features/games/types';

const TeamColumn = ({
  team,
  score,
  side,
  winner,
  align,
}: {
  readonly team: GameTeam;
  readonly score: number | null;
  readonly side: 'AWAY' | 'HOME';
  readonly winner: boolean;
  readonly align: 'start' | 'end';
}) => (
  <Stack
    spacing={1}
    sx={{
      alignItems: {
        xs: 'center',
        sm: align === 'start' ? 'flex-start' : 'flex-end',
      },
      textAlign: { xs: 'center', sm: align === 'start' ? 'left' : 'right' },
    }}
    aria-label={`${side === 'AWAY' ? 'Away' : 'Home'} team ${team.fullName}${score === null ? '' : `, ${score} points`}`}
  >
    <TeamHelmet team={team.abbreviation} size="lg" decorative />
    <Typography variant="overline">{side}</Typography>
    <Typography variant="h3">{team.fullName}</Typography>
    {score === null ? null : (
      <Typography
        variant="h2"
        sx={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: winner ? 950 : 700,
        }}
      >
        {score}
      </Typography>
    )}
  </Stack>
);

export const ScoreboardHero = ({ game }: { readonly game: Game }) => {
  const canShowScore =
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const awayWins =
    canShowScore &&
    game.status === 'FINAL' &&
    game.awayScore! > game.homeScore!;
  const homeWins =
    canShowScore &&
    game.status === 'FINAL' &&
    game.homeScore! > game.awayScore!;
  const statusLine = getScoreboardStatusLine(game);

  return (
    <Stack spacing={2.5}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <GameStatusChip status={game.status} />
        {game.isNeutralSite ? (
          <Chip label="Neutral site" variant="outlined" size="small" />
        ) : null}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
          alignItems: 'center',
        }}
      >
        <TeamColumn
          team={game.awayTeam}
          score={canShowScore ? game.awayScore : null}
          side="AWAY"
          winner={awayWins}
          align="start"
        />
        <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">
            @
          </Typography>
          {statusLine === null ? null : (
            <Typography sx={{ fontWeight: 800 }}>{statusLine}</Typography>
          )}
        </Stack>
        <TeamColumn
          team={game.homeTeam}
          score={canShowScore ? game.homeScore : null}
          side="HOME"
          winner={homeWins}
          align="end"
        />
      </Box>
    </Stack>
  );
};
