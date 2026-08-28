import { useState } from 'react';
import {
  Box,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';

import type {
  GamePlayerStatsByCategory,
  GamePlayerStatsCoverageState,
  GameTeam,
} from '@/features/games/types';

const value = (number: number | null) =>
  number === null ? '—' : number.toLocaleString();
const derived = (
  numerator: number | null,
  denominator: number | null,
  percent = false,
) =>
  numerator === null || denominator === null || denominator <= 0
    ? '—'
    : ((numerator / denominator) * (percent ? 100 : 1)).toFixed(1);

interface Row {
  readonly id: string;
  readonly cells: readonly string[];
}
interface Category {
  readonly key: keyof GamePlayerStatsByCategory;
  readonly title: string;
  readonly columns: readonly string[];
  readonly rows: (stats: GamePlayerStatsByCategory) => readonly Row[];
}

const playerStatCategories: readonly Category[] = [
  {
    key: 'passing',
    title: 'Passing',
    columns: [
      'Player',
      'CMP',
      'ATT',
      'YDS',
      'CMP%',
      'AVG',
      'TD',
      'INT',
      'SACKS',
    ],
    rows: (stats) =>
      stats.passing.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.completions),
          value(row.attempts),
          value(row.yards),
          derived(row.completions, row.attempts, true),
          derived(row.yards, row.attempts),
          value(row.touchdowns),
          value(row.interceptions),
          value(row.sacksSuffered),
        ],
      })),
  },
  {
    key: 'rushing',
    title: 'Rushing',
    columns: ['Player', 'ATT', 'YDS', 'AVG', 'TD', 'LONG'],
    rows: (stats) =>
      stats.rushing.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.attempts),
          value(row.yards),
          derived(row.yards, row.attempts),
          value(row.touchdowns),
          value(row.longest),
        ],
      })),
  },
  {
    key: 'receiving',
    title: 'Receiving',
    columns: ['Player', 'REC', 'TGT', 'YDS', 'AVG', 'TD', 'LONG'],
    rows: (stats) =>
      stats.receiving.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.receptions),
          value(row.targets),
          value(row.yards),
          derived(row.yards, row.receptions),
          value(row.touchdowns),
          value(row.longest),
        ],
      })),
  },
  {
    key: 'defense',
    title: 'Defense',
    columns: ['Player', 'TACKLES', 'SOLO', 'SACKS', 'TFL', 'PD', 'TD'],
    rows: (stats) =>
      stats.defense.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.tacklesTotal),
          value(row.tacklesSolo),
          value(row.sacks),
          value(row.tacklesForLoss),
          value(row.passesDefended),
          value(row.touchdowns),
        ],
      })),
  },
  {
    key: 'kicking',
    title: 'Kicking',
    columns: ['Player', 'FG', 'FGA', 'LONG', 'XP', 'XPA'],
    rows: (stats) =>
      stats.kicking.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.fieldGoalsMade),
          value(row.fieldGoalsAttempted),
          value(row.longestFieldGoal),
          value(row.extraPointsMade),
          value(row.extraPointsAttempted),
        ],
      })),
  },
  {
    key: 'punting',
    title: 'Punting',
    columns: ['Player', 'PUNTS', 'YDS', 'AVG', 'LONG', 'IN20', 'TB'],
    rows: (stats) =>
      stats.punting.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.punts),
          value(row.yards),
          value(row.average),
          value(row.longest),
          value(row.inside20),
          value(row.touchbacks),
        ],
      })),
  },
  {
    key: 'returns',
    title: 'Returns',
    columns: [
      'Player',
      'KR',
      'KR YDS',
      'KR TD',
      'KR LONG',
      'PR',
      'PR YDS',
      'PR TD',
      'PR LONG',
    ],
    rows: (stats) =>
      stats.returns.map((row) => ({
        id: row.player.id,
        cells: [
          row.player.displayName,
          value(row.kickReturns),
          value(row.kickReturnYards),
          value(row.kickReturnTouchdowns),
          value(row.longestKickReturn),
          value(row.puntReturns),
          value(row.puntReturnYards),
          value(row.puntReturnTouchdowns),
          value(row.longestPuntReturn),
        ],
      })),
  },
];

const CoverageNote = ({
  state,
}: {
  readonly state: GamePlayerStatsCoverageState;
}) => {
  if (state === 'PARTIAL')
    return (
      <Typography variant="body2" color="text.secondary">
        Some player statistics are still being matched and may update during the
        game.
      </Typography>
    );
  if (state === 'PENDING')
    return (
      <Typography color="text.secondary">
        Player statistics are updating.
      </Typography>
    );
  if (state === 'UNAVAILABLE')
    return (
      <Typography color="text.secondary">
        Player statistics are unavailable for this game.
      </Typography>
    );
  return null;
};

export const PlayerStatsPanel = ({
  awayTeam,
  homeTeam,
  coverageState,
  playerStatsAvailable,
  awayStats,
  homeStats,
}: {
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
  readonly coverageState?: GamePlayerStatsCoverageState;
  readonly playerStatsAvailable?: boolean;
  readonly awayStats: GamePlayerStatsByCategory;
  readonly homeStats: GamePlayerStatsByCategory;
}) => {
  const resolvedCoverage =
    coverageState ?? (playerStatsAvailable ? 'COMPLETE' : 'UNAVAILABLE');
  const [teamSide, setTeamSide] = useState<'away' | 'home'>('away');
  const stats = teamSide === 'away' ? awayStats : homeStats;
  const team = teamSide === 'away' ? awayTeam : homeTeam;
  const categories = playerStatCategories
    .map((category) => ({ ...category, data: category.rows(stats) }))
    .filter((category) => category.data.length > 0);
  const hasAnyRows = playerStatCategories.some(
    (category) =>
      category.rows(awayStats).length > 0 ||
      category.rows(homeStats).length > 0,
  );

  if (
    resolvedCoverage === 'UNAVAILABLE' ||
    (resolvedCoverage !== 'PENDING' && !hasAnyRows)
  )
    return <CoverageNote state="UNAVAILABLE" />;
  if (resolvedCoverage === 'PENDING' && !hasAnyRows)
    return <CoverageNote state="PENDING" />;

  return (
    <Stack spacing={2.5}>
      <CoverageNote state={resolvedCoverage} />
      <Tabs
        value={teamSide}
        onChange={(_event, value: 'away' | 'home') => setTeamSide(value)}
        aria-label="Player stats team"
      >
        <Tab value="away" label={awayTeam.fullName} />
        <Tab value="home" label={homeTeam.fullName} />
      </Tabs>
      {categories.length === 0 ? (
        <Typography color="text.secondary">
          No resolved {team.abbreviation} player rows are available yet.
        </Typography>
      ) : null}
      {categories.map((category) => (
        <Stack key={category.key} spacing={0.75}>
          <Typography
            component="h3"
            variant="subtitle2"
            sx={{ fontWeight: 900 }}
          >
            {category.title}
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              aria-label={`${team.abbreviation} ${category.title.toLowerCase()} stats table`}
              sx={{ minWidth: category.columns.length > 7 ? 700 : 520 }}
            >
              <TableHead>
                <TableRow>
                  {category.columns.map((column, index) => (
                    <TableCell
                      key={column}
                      align={index === 0 ? 'left' : 'right'}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {category.data.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell, index) => (
                      <TableCell
                        key={`${row.id}-${category.columns[index]}`}
                        align={index === 0 ? 'left' : 'right'}
                        sx={
                          index === 0
                            ? {
                                position: 'sticky',
                                left: 0,
                                bgcolor: 'background.paper',
                                fontWeight: 750,
                              }
                            : { fontVariantNumeric: 'tabular-nums' }
                        }
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};
