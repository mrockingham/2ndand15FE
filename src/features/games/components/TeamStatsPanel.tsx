import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';

import { getPublicGameErrorMessage } from '@/features/games/errors';
import { isFinalizedGameStatus } from '@/features/games/presentation';
import type {
  GameStatsResult,
  GameStatus,
  GameTeam,
  GameTeamStats,
} from '@/features/games/types';

const value = (number: number | null) =>
  number === null ? '—' : number.toLocaleString();

const ratio = (made: number | null, attempts: number | null) =>
  made === null || attempts === null ? '—' : `${made}/${attempts}`;

const possession = (seconds: number | null) => {
  if (seconds === null) return '—';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

const scoring = (stats: GameTeamStats | null) =>
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
        'minmax(64px, 1fr) minmax(140px, 1.6fr) minmax(64px, 1fr)',
      gap: 1,
      alignItems: 'center',
      py: 0.75,
    }}
  >
    <Typography sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
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

const PeriodScoring = ({
  awayTeam,
  homeTeam,
  away,
  home,
}: {
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
  readonly away: GameTeamStats | null;
  readonly home: GameTeamStats | null;
}) => {
  const periods = [
    ['Q1', away?.scoringByPeriod.q1 ?? null, home?.scoringByPeriod.q1 ?? null],
    ['Q2', away?.scoringByPeriod.q2 ?? null, home?.scoringByPeriod.q2 ?? null],
    ['Q3', away?.scoringByPeriod.q3 ?? null, home?.scoringByPeriod.q3 ?? null],
    ['Q4', away?.scoringByPeriod.q4 ?? null, home?.scoringByPeriod.q4 ?? null],
    [
      'OT',
      away?.scoringByPeriod.ot1 ?? null,
      home?.scoringByPeriod.ot1 ?? null,
    ],
    [
      '2OT',
      away?.scoringByPeriod.ot2 ?? null,
      home?.scoringByPeriod.ot2 ?? null,
    ],
  ].filter(
    ([, awayScore, homeScore]) => awayScore !== null || homeScore !== null,
  );
  if (periods.length === 0) return null;
  return (
    <Box sx={{ overflowX: 'auto', mb: 1.5 }}>
      <Box
        role="table"
        aria-label="Period scoring"
        sx={{
          display: 'grid',
          gridTemplateColumns: `minmax(44px, 1fr) repeat(${periods.length}, 32px)`,
          gap: 0.5,
          minWidth: 180,
        }}
      >
        <span />
        {periods.map(([label]) => (
          <Typography
            role="columnheader"
            key={label}
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            {label}
          </Typography>
        ))}
        {[
          ['away', awayTeam.abbreviation, periods.map((period) => period[1])],
          ['home', homeTeam.abbreviation, periods.map((period) => period[2])],
        ].map(([key, abbreviation, scores]) => (
          <Box key={String(key)} sx={{ display: 'contents' }}>
            <Typography
              role="rowheader"
              variant="caption"
              sx={{ fontWeight: 850 }}
            >
              {String(abbreviation)}
            </Typography>
            {(scores as (number | null)[]).map((score, index) => (
              <Typography
                role="cell"
                key={`${String(key)}-${index}`}
                variant="caption"
                sx={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
              >
                {value(score)}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const primaryRows = (away: GameTeamStats | null, home: GameTeamStats | null) =>
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

const detailRows = (away: GameTeamStats | null, home: GameTeamStats | null) =>
  [
    [
      'Total plays',
      value(away?.totalPlays ?? null),
      value(home?.totalPlays ?? null),
    ],
    ['Sacks', value(away?.sacks ?? null), value(home?.sacks ?? null)],
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
    ['Q1 · Q2 · Q3 · Q4', scoring(away), scoring(home)],
  ] as const;

export const TeamStatsPanel = ({
  awayTeam,
  homeTeam,
  gameStatus,
  query,
}: {
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
  readonly gameStatus: GameStatus;
  readonly query: UseQueryResult<GameStatsResult, unknown>;
}) => {
  if (query.data === undefined) {
    if (query.isPending) {
      return (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress aria-label="Loading team statistics" size={28} />
        </Stack>
      );
    }
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        {getPublicGameErrorMessage(query.error)}
      </Alert>
    );
  }

  // A background refetch failure preserves the last-good data here rather
  // than blanking it; the shared FreshnessIndicator communicates staleness.
  const { coverage, teamStats } = query.data;

  if (coverage === 'UNAVAILABLE') {
    return (
      <Typography color="text.secondary">
        {isFinalizedGameStatus(gameStatus)
          ? 'Team statistics unavailable for this game.'
          : 'Team statistics will appear when game data is available.'}
      </Typography>
    );
  }

  return (
    <Box
      aria-label={`${awayTeam.abbreviation} and ${homeTeam.abbreviation} team statistics`}
    >
      <PeriodScoring
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        away={teamStats.away}
        home={teamStats.home}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 900 }}>
          {awayTeam.abbreviation}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 900, textAlign: 'right' }}
        >
          {homeTeam.abbreviation}
        </Typography>
      </Box>
      {primaryRows(teamStats.away, teamStats.home).map(
        ([label, away, home]) => (
          <ComparisonRow key={label} label={label} away={away} home={home} />
        ),
      )}
      <Box component="details" sx={{ mt: 1 }}>
        <Stack
          component="summary"
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', cursor: 'pointer', fontWeight: 750 }}
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
  );
};
