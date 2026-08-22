import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
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
import {
  formatGameDate,
  formatGameTime,
  parseGameDate,
  TIME_TBD,
} from '@/features/games/utils/dateTime';
import type { CurrentGameTeamStats, CurrentStatsGame } from '../currentTypes';

const coverageLabel = {
  PENDING: 'Pending',
  COMPLETE: 'Complete stats',
  PARTIAL: 'Partial stats',
  UNAVAILABLE: 'Stats unavailable',
} as const;

const value = (number: number | null) =>
  number === null ? '—' : number.toLocaleString();
const possession = (seconds: number | null) => {
  if (seconds === null) return '—';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

const TeamHeader = ({
  abbreviation,
  name,
  score,
  side,
}: {
  readonly abbreviation: string;
  readonly name: string;
  readonly score: number | null;
  readonly side: 'Away' | 'Home';
}) => (
  <Stack
    spacing={0.5}
    sx={{ alignItems: 'center', minWidth: 0, textAlign: 'center' }}
  >
    <TeamHelmet team={abbreviation} size="md" decorative />
    <Typography variant="caption" color="text.secondary">
      {side}
    </Typography>
    <Typography sx={{ fontWeight: 850 }} noWrap>
      {abbreviation}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      noWrap
      sx={{ maxWidth: '100%' }}
    >
      {name}
    </Typography>
    {score === null ? null : (
      <Typography
        variant="h4"
        sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}
      >
        {score}
      </Typography>
    )}
  </Stack>
);

const ComparisonRow = ({
  label,
  away,
  home,
}: {
  readonly label: string;
  readonly away: string;
  readonly home: string;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns:
        'minmax(48px, 1fr) minmax(118px, 1.6fr) minmax(48px, 1fr)',
      gap: 1,
      alignItems: 'center',
      py: 0.75,
    }}
  >
    <Typography
      sx={{
        fontWeight: 800,
        textAlign: 'left',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {away}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textAlign: 'center' }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontWeight: 800,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {home}
    </Typography>
  </Box>
);

const ratio = (made: number | null, attempts: number | null) =>
  made === null || attempts === null ? '—' : `${made}/${attempts}`;

const scoring = (stats: CurrentGameTeamStats | null) =>
  stats === null
    ? '—'
    : [
        stats.scoringByPeriod.q1,
        stats.scoringByPeriod.q2,
        stats.scoringByPeriod.q3,
        stats.scoringByPeriod.q4,
      ]
        .map(value)
        .join(' · ');

const primaryRows = (
  away: CurrentGameTeamStats | null,
  home: CurrentGameTeamStats | null,
) =>
  [
    [
      'Total yards',
      value(away?.totalYards ?? null),
      value(home?.totalYards ?? null),
    ],
    [
      'Passing',
      value(away?.passingYards ?? null),
      value(home?.passingYards ?? null),
    ],
    [
      'Rushing',
      value(away?.rushingYards ?? null),
      value(home?.rushingYards ?? null),
    ],
    [
      'First downs',
      value(away?.firstDowns ?? null),
      value(home?.firstDowns ?? null),
    ],
    [
      'Turnovers',
      value(away?.turnovers ?? null),
      value(home?.turnovers ?? null),
    ],
    [
      'Possession',
      possession(away?.possessionSeconds ?? null),
      possession(home?.possessionSeconds ?? null),
    ],
  ] as const;

const detailRows = (
  away: CurrentGameTeamStats | null,
  home: CurrentGameTeamStats | null,
) =>
  [
    [
      'Third downs',
      ratio(
        away?.thirdDownConversions ?? null,
        away?.thirdDownAttempts ?? null,
      ),
      ratio(
        home?.thirdDownConversions ?? null,
        home?.thirdDownAttempts ?? null,
      ),
    ],
    [
      'Fourth downs',
      ratio(
        away?.fourthDownConversions ?? null,
        away?.fourthDownAttempts ?? null,
      ),
      ratio(
        home?.fourthDownConversions ?? null,
        home?.fourthDownAttempts ?? null,
      ),
    ],
    ['Sacks', value(away?.sacks ?? null), value(home?.sacks ?? null)],
    [
      'Penalties',
      ratio(away?.penalties ?? null, away?.penaltyYards ?? null),
      ratio(home?.penalties ?? null, home?.penaltyYards ?? null),
    ],
    [
      'Red zone',
      ratio(away?.redZoneConversions ?? null, away?.redZoneAttempts ?? null),
      ratio(home?.redZoneConversions ?? null, home?.redZoneAttempts ?? null),
    ],
    [
      'Total plays',
      value(away?.totalPlays ?? null),
      value(home?.totalPlays ?? null),
    ],
    ['Q1 · Q2 · Q3 · Q4', scoring(away), scoring(home)],
  ] as const;

export const CurrentGameStatsCard = ({
  entry,
}: {
  readonly entry: CurrentStatsGame;
}) => {
  const { game, coverage, teamStats } = entry;
  const canShowScore =
    isScoreStatus(game.status) &&
    game.awayScore !== null &&
    game.homeScore !== null;
  const hasKickoff = parseGameDate(game.startTime) !== null;
  const hasComparison = teamStats.away !== null || teamStats.home !== null;

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              <GameStatusChip status={game.status} />
              <Chip
                size="small"
                variant="outlined"
                label={coverageLabel[coverage]}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {getGameDisplayLabel(game)}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {hasKickoff
              ? `${formatGameDate(game.startTime)} · ${formatGameTime(game.startTime)}`
              : TIME_TBD}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <TeamHeader
              abbreviation={game.awayTeam.abbreviation}
              name={game.awayTeam.fullName}
              score={canShowScore ? game.awayScore : null}
              side="Away"
            />
            <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
              AT
            </Typography>
            <TeamHeader
              abbreviation={game.homeTeam.abbreviation}
              name={game.homeTeam.fullName}
              score={canShowScore ? game.homeScore : null}
              side="Home"
            />
          </Box>

          <Divider />
          {hasComparison ? (
            <Box
              aria-label={`${game.awayTeam.abbreviation} and ${game.homeTeam.abbreviation} team statistics`}
            >
              {primaryRows(teamStats.away, teamStats.home).map(
                ([label, away, home]) => (
                  <ComparisonRow
                    key={label}
                    label={label}
                    away={away}
                    home={home}
                  />
                ),
              )}
              <Box component="details" sx={{ mt: 1 }}>
                <Stack
                  component="summary"
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 750,
                  }}
                >
                  <ExpandMoreRounded fontSize="small" aria-hidden="true" />
                  <span>More team stats</span>
                </Stack>
                <Box sx={{ pt: 1 }}>
                  {detailRows(teamStats.away, teamStats.home).map(
                    ([label, away, home]) => (
                      <ComparisonRow
                        key={label}
                        label={label}
                        away={away}
                        home={home}
                      />
                    ),
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">
              {coverage === 'PENDING'
                ? 'Stats will appear after game data is available.'
                : 'Team statistics unavailable for this game.'}
            </Typography>
          )}
          {coverage === 'PARTIAL' ? (
            <Typography variant="caption" color="text.secondary">
              Some team statistics are unavailable.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={RouterLink} to={`/games/${game.id}`} size="small">
          Game Center
        </Button>
      </CardActions>
    </Card>
  );
};
