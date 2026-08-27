import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import TvOutlined from '@mui/icons-material/TvOutlined';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import { GameStatusChip } from '@/features/games/components/GameStatusChip';
import {
  getGameDisplayLabel,
  isScoreStatus,
} from '@/features/games/presentation';
import type { Game, GameTeam } from '@/features/games/types';
import {
  formatGameDate,
  formatGameTime,
  parseGameDate,
  TIME_TBD,
} from '@/features/games/utils/dateTime';

interface TeamRowProps {
  readonly label: 'Away' | 'Home';
  readonly score: number | null;
  readonly team: GameTeam;
  readonly winner: boolean;
}

const TeamRow = ({ label, score, team, winner }: TeamRowProps) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{ alignItems: 'center', minWidth: 0 }}
    aria-label={`${label} team ${team.fullName}${score === null ? '' : `, ${score} points`}`}
  >
    <TeamHelmet team={team.abbreviation} decorative size="sm" />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        sx={{
          overflow: 'hidden',
          fontWeight: winner ? 900 : 700,
          textOverflow: 'ellipsis',
        }}
        noWrap
      >
        {team.fullName}
      </Typography>
    </Box>
    {score === null ? null : (
      <Typography
        variant="h4"
        component="span"
        sx={{
          fontWeight: winner ? 950 : 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {score}
      </Typography>
    )}
  </Stack>
);

const venueLabel = (game: Game) =>
  [game.venue.name, game.venue.city].filter(Boolean).join(' · ');

export const GameCard = ({ game }: { readonly game: Game }) => {
  const canShowScore =
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const isFinal = game.status === 'FINAL' && canShowScore;
  const awayWins = isFinal && game.awayScore! > game.homeScore!;
  const homeWins = isFinal && game.homeScore! > game.awayScore!;
  const venue = venueLabel(game);
  const hasKickoff = parseGameDate(game.startTime) !== null;

  return (
    <Card sx={{ height: '100%', borderColor: 'appSurfaces.borderStrong' }}>
      <CardActionArea
        component={RouterLink}
        to={`/games/${game.id}`}
        aria-label={`${game.awayTeam.fullName} at ${game.homeTeam.fullName}, ${hasKickoff ? `${formatGameDate(game.startTime)}, ${formatGameTime(game.startTime)}` : TIME_TBD}`}
        sx={{ display: 'flex', height: '100%', alignItems: 'stretch' }}
      >
        <Stack spacing={1.75} sx={{ width: '100%', p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              <GameStatusChip status={game.status} />
              {game.isNeutralSite ? (
                <Chip label="Neutral site" size="small" variant="outlined" />
              ) : null}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: 'right' }}
            >
              {getGameDisplayLabel(game)}
            </Typography>
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {hasKickoff ? formatGameTime(game.startTime) : TIME_TBD}
            </Typography>
            {hasKickoff ? (
              <Typography variant="body2" color="text.secondary">
                {formatGameDate(game.startTime)}
              </Typography>
            ) : null}
          </Box>

          <Divider />
          <TeamRow
            label="Away"
            team={game.awayTeam}
            score={canShowScore ? game.awayScore : null}
            winner={awayWins}
          />
          <TeamRow
            label="Home"
            team={game.homeTeam}
            score={canShowScore ? game.homeScore : null}
            winner={homeWins}
          />

          {venue === '' && game.broadcastNetwork === null ? null : (
            <Stack spacing={0.5} sx={{ mt: 'auto' }}>
              {venue === '' ? null : (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center' }}
                >
                  <LocationOnOutlined
                    fontSize="small"
                    color="action"
                    aria-hidden="true"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {venue}
                  </Typography>
                </Stack>
              )}
              {game.broadcastNetwork === null ? null : (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: 'center' }}
                >
                  <TvOutlined
                    fontSize="small"
                    color="action"
                    aria-hidden="true"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {game.broadcastNetwork}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
};
