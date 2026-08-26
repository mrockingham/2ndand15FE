import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { formatAdminDateTime, gameStatusLabel } from '@/features/admin/format';
import { DisplayModeBadge } from '@/features/gameMedia/components/DisplayModeBadge';
import type { AdminGameMediaListItem } from '@/features/gameMedia/types';
import { TeamHelmet } from '@/components/team/TeamHelmet';

const SCORE_BEARING_STATUSES = new Set(['IN_PROGRESS', 'HALFTIME', 'FINAL']);

const isKnownStatus = (
  status: string,
): status is keyof typeof gameStatusLabel => status in gameStatusLabel;

export const GameMediaGameCard = ({
  game,
}: {
  readonly game: AdminGameMediaListItem;
}) => {
  const showScore =
    SCORE_BEARING_STATUSES.has(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const statusLabel = isKnownStatus(game.status)
    ? gameStatusLabel[game.status]
    : game.status;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TeamHelmet
              team={game.awayTeam.abbreviation}
              size="sm"
              decorative
            />
            <Typography variant="h6">
              {game.awayTeam.abbreviation}
              {showScore ? ` ${game.awayScore}` : ''}
            </Typography>
            <Typography color="text.secondary">@</Typography>
            <Typography variant="h6">
              {game.homeTeam.abbreviation}
              {showScore ? ` ${game.homeScore}` : ''}
            </Typography>
            <TeamHelmet
              team={game.homeTeam.abbreviation}
              size="sm"
              decorative
            />
          </Stack>
          <DisplayModeBadge displayMode={game.displayMode} />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {statusLabel} · {formatAdminDateTime(game.startTime)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Curated videos: {game.curatedVideoCount} · Automatic highlights:{' '}
          {game.automaticHighlightCount}
        </Typography>
        <Button
          component={RouterLink}
          to={`/admin/game-media/${game.gameId}`}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Manage Media
        </Button>
      </CardContent>
    </Card>
  );
};
