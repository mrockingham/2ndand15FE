import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { PlayerAttribution } from '@/features/players/components/PlayerAttribution';
import { PlayerSearchPicker } from '@/features/players/components/PlayerSearchPicker';
import { seasonMetricGroups } from '@/features/players/metrics';
import {
  formatStatValue,
  isUuid,
  parsePlayerSeason,
  summaryTypeLabel,
} from '@/features/players/presentation';
import {
  usePlayerQuery,
  usePlayerSeasonsQuery,
} from '@/features/players/queries';
import type {
  PlayerSeasonStat,
  PlayerSummaryType,
} from '@/features/players/types';

const summaryTypePreference: readonly PlayerSummaryType[] = [
  'REG_POST',
  'REG',
  'POST',
];

export const PlayerComparePage = () => {
  const [parameters, setParameters] = useSearchParams();
  const leftId = isUuid(parameters.get('left'))
    ? (parameters.get('left') ?? '')
    : '';
  const requestedRightId = isUuid(parameters.get('right'))
    ? (parameters.get('right') ?? '')
    : '';
  const sameSelection = leftId !== '' && requestedRightId === leftId;
  const rightId = sameSelection ? '' : requestedRightId;
  const leftPlayer = usePlayerQuery(leftId);
  const rightPlayer = usePlayerQuery(rightId);
  const leftSeasons = usePlayerSeasonsQuery(leftId);
  const rightSeasons = usePlayerSeasonsQuery(rightId);
  const leftYears = new Set(
    leftSeasons.data?.seasons.map((row) => row.season) ?? [],
  );
  const commonSeasons = [
    ...new Set(rightSeasons.data?.seasons.map((row) => row.season) ?? []),
  ]
    .filter((season) => leftYears.has(season))
    .sort((a, b) => b - a);
  const requestedSeason = parsePlayerSeason(parameters.get('season'));
  const season =
    requestedSeason && commonSeasons.includes(requestedSeason)
      ? requestedSeason
      : commonSeasons[0];
  const sharedSummaryTypes = findSharedSummaryTypes(
    leftSeasons.data?.seasons ?? [],
    rightSeasons.data?.seasons ?? [],
    season,
  );
  const requestedSummaryType = parseSummaryType(parameters.get('type'));
  const summaryType =
    requestedSummaryType && sharedSummaryTypes.includes(requestedSummaryType)
      ? requestedSummaryType
      : sharedSummaryTypes[0];
  const leftSummary = findSummary(
    leftSeasons.data?.seasons ?? [],
    season,
    summaryType,
  );
  const rightSummary = findSummary(
    rightSeasons.data?.seasons ?? [],
    season,
    summaryType,
  );
  const summariesReady =
    leftPlayer.data !== undefined &&
    rightPlayer.data !== undefined &&
    leftSeasons.isSuccess &&
    rightSeasons.isSuccess;

  useEffect(() => {
    if (!summariesReady) return;
    const next = new URLSearchParams(parameters);
    if (season === undefined) {
      next.delete('season');
      next.delete('type');
    } else {
      next.set('season', String(season));
      if (summaryType) next.set('type', summaryType);
      else next.delete('type');
    }
    if (next.toString() === parameters.toString()) return;
    setParameters(next, { replace: true });
  }, [parameters, season, setParameters, summariesReady, summaryType]);

  const updatePlayer = (side: 'left' | 'right', playerId: string | null) => {
    const next = new URLSearchParams(parameters);
    if (playerId) next.set(side, playerId);
    else next.delete(side);
    next.delete('season');
    next.delete('type');
    setParameters(next);
  };

  const left = leftPlayer.data?.player ?? null;
  const right = rightPlayer.data?.player ?? null;
  const differentPositions =
    left &&
    right &&
    (left.positionGroup ?? left.position) !==
      (right.positionGroup ?? right.position);
  const loadingSelection =
    (leftPlayer.isPending && leftId !== '') ||
    (rightPlayer.isPending && rightId !== '');
  const selectionError = leftPlayer.isError || rightPlayer.isError;
  const attribution =
    leftSeasons.data?.attribution ?? rightSeasons.data?.attribution;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack spacing={4}>
        <Box>
          <Button
            component={RouterLink}
            to="/players"
            startIcon={<ArrowBackRounded />}
          >
            Players
          </Button>
          <Typography
            variant="overline"
            color="primary.light"
            sx={{ display: 'block', mt: 2 }}
          >
            BOUNDED COMPARISON
          </Typography>
          <Typography component="h1" variant="h2">
            Compare two players
          </Typography>
          <Typography color="text.secondary">
            Select exactly two players and one shared season. Values come from
            existing public season summaries.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <PlayerSearchPicker
            label="Left player"
            selected={left}
            excludedId={right?.id}
            onSelect={(player) => updatePlayer('left', player?.id ?? null)}
          />
          <PlayerSearchPicker
            label="Right player"
            selected={right}
            excludedId={left?.id}
            onSelect={(player) => updatePlayer('right', player?.id ?? null)}
          />
        </Box>
        {loadingSelection ? (
          <Typography role="status">Loading selected player…</Typography>
        ) : null}
        {selectionError ? (
          <Alert severity="error">
            One selected player could not be loaded. Change the selection and
            try again.
          </Alert>
        ) : null}
        {sameSelection ? (
          <Alert severity="warning">Choose two different players.</Alert>
        ) : null}
        {left && right && differentPositions ? (
          <Alert severity="warning">
            These players have different positions or position groups. Their
            role-specific totals are not directly equivalent, and no overall
            winner is calculated.
          </Alert>
        ) : null}
        {left && right && (leftSeasons.isPending || rightSeasons.isPending) ? (
          <Typography role="status">Loading shared seasons…</Typography>
        ) : null}
        {left &&
        right &&
        !leftSeasons.isPending &&
        !rightSeasons.isPending &&
        commonSeasons.length === 0 ? (
          <Alert severity="info">
            These players do not share a season with summary data, so they
            cannot be compared.
          </Alert>
        ) : null}
        {summariesReady &&
        season !== undefined &&
        sharedSummaryTypes.length === 0 ? (
          <Alert severity="info">
            These players both have summary data for {season}, but they do not
            share a directly equivalent summary type. A comparison is not
            available for this season.
          </Alert>
        ) : null}
        {left && right && season && leftSummary && rightSummary ? (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Comparison season"
                value={season}
                onChange={(event) => {
                  const next = new URLSearchParams(parameters);
                  next.set('season', event.target.value);
                  next.delete('type');
                  setParameters(next);
                }}
                sx={{ minWidth: 220 }}
              >
                {commonSeasons.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              {sharedSummaryTypes.length > 1 ? (
                <TextField
                  select
                  label="Summary type"
                  value={summaryType}
                  onChange={(event) => {
                    const next = new URLSearchParams(parameters);
                    next.set('type', event.target.value);
                    setParameters(next);
                  }}
                  sx={{ minWidth: 280 }}
                >
                  {sharedSummaryTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {summaryTypeLabel[type]}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null}
            </Stack>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography component="h2" variant="h3">
                {season} comparison
              </Typography>
              <Typography color="text.secondary">
                {left.displayName}: {summaryTypeLabel[leftSummary.summaryType]}{' '}
                · {right.displayName}:{' '}
                {summaryTypeLabel[rightSummary.summaryType]}
              </Typography>
            </Paper>
            <ComparisonTable
              leftName={left.displayName}
              rightName={right.displayName}
              left={leftSummary}
              right={rightSummary}
            />
            <Alert severity="info">
              An em dash means a value was unavailable, not zero. “Higher value”
              appears only for metrics where larger totals are straightforwardly
              meaningful; negative metrics such as interceptions thrown are
              never emphasized.
            </Alert>
          </>
        ) : null}
        {attribution ? <PlayerAttribution attribution={attribution} /> : null}
      </Stack>
    </Container>
  );
};

const findSharedSummaryTypes = (
  leftRows: readonly PlayerSeasonStat[],
  rightRows: readonly PlayerSeasonStat[],
  season: number | undefined,
) => {
  if (season === undefined) return [];
  const leftTypes = new Set(
    leftRows
      .filter((row) => row.season === season)
      .map((row) => row.summaryType),
  );
  const rightTypes = new Set(
    rightRows
      .filter((row) => row.season === season)
      .map((row) => row.summaryType),
  );
  return summaryTypePreference.filter(
    (type) => leftTypes.has(type) && rightTypes.has(type),
  );
};

const findSummary = (
  rows: readonly PlayerSeasonStat[],
  season: number | undefined,
  summaryType: PlayerSummaryType | undefined,
) =>
  rows.find((row) => row.season === season && row.summaryType === summaryType);

const parseSummaryType = (value: string | null) =>
  summaryTypePreference.find((type) => type === value);

const ComparisonTable = ({
  leftName,
  rightName,
  left,
  right,
}: {
  readonly leftName: string;
  readonly rightName: string;
  readonly left: PlayerSeasonStat;
  readonly right: PlayerSeasonStat;
}) => (
  <Stack spacing={3}>
    {seasonMetricGroups.map((group) => {
      const metrics = group.metrics
        .filter(
          (metric) =>
            metric.value(left) !== null || metric.value(right) !== null,
        )
        .sort(
          (a, b) =>
            Number(metricShared(b, left, right)) -
            Number(metricShared(a, left, right)),
        );
      if (metrics.length === 0) return null;
      return (
        <TableContainer key={group.key} component={Paper} variant="outlined">
          <Table aria-label={`${group.label} comparison`}>
            <caption>
              {group.description ??
                `${group.label} totals for the selected season`}
            </caption>
            <TableHead>
              <TableRow>
                <TableCell>{group.label}</TableCell>
                <TableCell align="right">{leftName}</TableCell>
                <TableCell align="right">{rightName}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.map((metric) => {
                const leftValue = metric.value(left);
                const rightValue = metric.value(right);
                const leftHigher =
                  metric.higherIsBetter === true &&
                  leftValue !== null &&
                  rightValue !== null &&
                  leftValue > rightValue;
                const rightHigher =
                  metric.higherIsBetter === true &&
                  leftValue !== null &&
                  rightValue !== null &&
                  rightValue > leftValue;
                return (
                  <TableRow key={metric.key}>
                    <TableCell component="th" scope="row">
                      {metric.label}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: leftHigher ? 950 : 500 }}
                    >
                      {formatStatValue(leftValue, metric.suffix)}
                      {leftHigher ? (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ display: 'block' }}
                        >
                          Higher value
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: rightHigher ? 950 : 500 }}
                    >
                      {formatStatValue(rightValue, metric.suffix)}
                      {rightHigher ? (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ display: 'block' }}
                        >
                          Higher value
                        </Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    })}
  </Stack>
);

const metricShared = (
  metric: { readonly value: (stat: PlayerSeasonStat) => number | null },
  left: PlayerSeasonStat,
  right: PlayerSeasonStat,
) => metric.value(left) !== null && metric.value(right) !== null;
