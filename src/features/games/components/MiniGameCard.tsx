import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  formatGameClock,
  gameStatusLabel,
  isScoreStatus,
} from '@/features/games/presentation';
import type { Game, GameStatus, GameTeam } from '@/features/games/types';
import {
  formatGameTime,
  formatGameWeekday,
  parseGameDate,
  TIME_TBD,
} from '@/features/games/utils/dateTime';

const statusTextColor: Readonly<Record<GameStatus, string>> = {
  SCHEDULED: 'text.secondary',
  PREGAME: 'primary.main',
  IN_PROGRESS: 'error.main',
  HALFTIME: 'warning.main',
  FINAL: 'success.main',
  POSTPONED: 'warning.main',
  CANCELED: 'error.main',
  SUSPENDED: 'warning.main',
};

const statusLine = (game: Game) => {
  if (game.status === 'IN_PROGRESS') {
    const clock = formatGameClock(game.clock);
    const quarter = game.quarter === null ? null : `Q${game.quarter}`;
    const detail = [quarter, clock].filter(Boolean).join(' · ');
    return detail === '' ? 'LIVE' : `LIVE · ${detail}`;
  }
  if (game.status === 'HALFTIME') return 'HALFTIME';
  if (game.status === 'FINAL') return 'FINAL';
  if (game.status === 'SCHEDULED' || game.status === 'PREGAME') {
    const weekday = formatGameWeekday(game.startTime)?.toUpperCase();
    const time =
      parseGameDate(game.startTime) === null
        ? null
        : formatGameTime(game.startTime);
    if (weekday === undefined || weekday === null || time === null)
      return TIME_TBD.toUpperCase();
    return `${weekday} · ${time}`;
  }
  return gameStatusLabel[game.status].toUpperCase();
};

const accessibleLabel = (game: Game, canShowScore: boolean) => {
  if (game.status === 'FINAL' && canShowScore) {
    return `${game.awayTeam.fullName} ${game.awayScore}, ${game.homeTeam.fullName} ${game.homeScore}, final`;
  }
  if (
    (game.status === 'IN_PROGRESS' || game.status === 'HALFTIME') &&
    canShowScore
  ) {
    return `${game.awayTeam.fullName} ${game.awayScore}, ${game.homeTeam.fullName} ${game.homeScore}, ${game.status === 'HALFTIME' ? 'halftime' : 'live'}`;
  }
  const kickoff =
    parseGameDate(game.startTime) === null
      ? TIME_TBD
      : `${formatGameWeekday(game.startTime)} at ${formatGameTime(game.startTime)}`;
  return `${game.awayTeam.fullName} at ${game.homeTeam.fullName}, ${kickoff}`;
};

interface TeamLineProps {
  readonly team: GameTeam;
  readonly score: number | null;
  readonly winner: boolean;
}

const TeamLine = ({ team, score, winner }: TeamLineProps) => (
  <Stack
    direction="row"
    spacing={0.75}
    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
  >
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'center', minWidth: 0 }}
    >
      <TeamHelmet team={team.abbreviation} decorative size="xs" />
      <Typography
        variant="caption"
        sx={{ fontWeight: winner ? 900 : 700, letterSpacing: 0.4 }}
        noWrap
      >
        {team.abbreviation}
      </Typography>
    </Stack>
    {score === null ? null : (
      <Typography
        variant="body2"
        component="span"
        data-winner={winner ? 'true' : undefined}
        sx={{
          fontWeight: winner ? 900 : 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {score}
      </Typography>
    )}
  </Stack>
);

interface MiniGameCardProps {
  readonly game: Game;
  readonly isFavoriteTeamGame?: boolean;
  readonly isActive?: boolean;
}

export const MiniGameCard = ({
  game,
  isFavoriteTeamGame = false,
  isActive = false,
}: MiniGameCardProps) => {
  const canShowScore =
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const isFinal = game.status === 'FINAL' && canShowScore;
  const awayWins = isFinal && game.awayScore! > game.homeScore!;
  const homeWins = isFinal && game.homeScore! > game.awayScore!;

  return (
    <ButtonBase
      component={RouterLink}
      to={`/games/${game.id}`}
      aria-label={accessibleLabel(game, canShowScore)}
      aria-current={isActive ? 'page' : undefined}
      data-favorite-team={isFavoriteTeamGame ? 'true' : undefined}
      sx={{
        flexShrink: 0,
        width: { xs: 148, sm: 176 },
        borderRadius: 1,
        border: '1px solid',
        borderColor: isFavoriteTeamGame
          ? 'primary.main'
          : 'appSurfaces.borderStrong',
        bgcolor: isActive ? 'action.selected' : 'background.paper',
        py: 0.7,
        px: 1.5,
        justifyContent: 'stretch',
        scrollSnapAlign: 'start',
      }}
    >
      <Stack spacing={0.3} sx={{ width: '100%' }}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 0.3,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: statusTextColor[game.status],
              fontWeight: 800,
              lineHeight: 1.2,
            }}
            noWrap
          >
            {statusLine(game)}
          </Typography>
          {isFavoriteTeamGame ? (
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            />
          ) : null}
        </Stack>
        <TeamLine
          team={game.awayTeam}
          score={canShowScore ? game.awayScore : null}
          winner={awayWins}
        />
        <TeamLine
          team={game.homeTeam}
          score={canShowScore ? game.homeScore : null}
          winner={homeWins}
        />
      </Stack>
    </ButtonBase>
  );
};
