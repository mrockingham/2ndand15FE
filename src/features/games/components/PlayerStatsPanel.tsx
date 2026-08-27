import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type {
  GamePlayerStatsByCategory,
  GameTeam,
} from '@/features/games/types';

const value = (number: number | null) =>
  number === null ? '—' : number.toLocaleString();

const ratio = (made: number | null, attempts: number | null) =>
  made === null || attempts === null ? '—' : `${made}/${attempts}`;

const average = (number: number | null) =>
  number === null ? '—' : number.toFixed(1);

interface FormattedStatRow {
  readonly id: string;
  readonly cells: readonly string[];
}

const passingRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
  stats.passing.map((row) => ({
    id: row.player.id,
    cells: [
      row.player.displayName,
      ratio(row.completions, row.attempts),
      value(row.yards),
      value(row.touchdowns),
      value(row.interceptions),
    ],
  }));

const rushingRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
  stats.rushing.map((row) => ({
    id: row.player.id,
    cells: [
      row.player.displayName,
      value(row.attempts),
      value(row.yards),
      value(row.touchdowns),
      value(row.longest),
    ],
  }));

const receivingRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
  stats.receiving.map((row) => ({
    id: row.player.id,
    cells: [
      row.player.displayName,
      value(row.targets),
      value(row.receptions),
      value(row.yards),
      value(row.touchdowns),
      value(row.longest),
    ],
  }));

const defenseRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
  stats.defense.map((row) => ({
    id: row.player.id,
    cells: [
      row.player.displayName,
      value(row.tacklesTotal),
      value(row.tacklesSolo),
      value(row.sacks),
      value(row.tacklesForLoss),
      value(row.passesDefended),
      value(row.fumbles),
      value(row.fumbleRecoveries),
      value(row.touchdowns),
    ],
  }));

const kickingRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
  stats.kicking.map((row) => ({
    id: row.player.id,
    cells: [
      row.player.displayName,
      ratio(row.fieldGoalsMade, row.fieldGoalsAttempted),
      value(row.longestFieldGoal),
      ratio(row.extraPointsMade, row.extraPointsAttempted),
    ],
  }));

const puntingRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
  stats.punting.map((row) => ({
    id: row.player.id,
    cells: [
      row.player.displayName,
      value(row.punts),
      value(row.yards),
      average(row.average),
      value(row.inside20),
      value(row.touchbacks),
      value(row.longest),
    ],
  }));

const returnRows = (stats: GamePlayerStatsByCategory): FormattedStatRow[] =>
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
  }));

interface StatCategory {
  readonly key: string;
  readonly title: string;
  readonly columns: readonly string[];
  readonly awayRows: readonly FormattedStatRow[];
  readonly homeRows: readonly FormattedStatRow[];
}

const buildCategories = (
  away: GamePlayerStatsByCategory,
  home: GamePlayerStatsByCategory,
): readonly StatCategory[] => [
  {
    key: 'passing',
    title: 'Passing',
    columns: ['Player', 'C/ATT', 'YDS', 'TD', 'INT'],
    awayRows: passingRows(away),
    homeRows: passingRows(home),
  },
  {
    key: 'rushing',
    title: 'Rushing',
    columns: ['Player', 'ATT', 'YDS', 'TD', 'LONG'],
    awayRows: rushingRows(away),
    homeRows: rushingRows(home),
  },
  {
    key: 'receiving',
    title: 'Receiving',
    columns: ['Player', 'TGT', 'REC', 'YDS', 'TD', 'LONG'],
    awayRows: receivingRows(away),
    homeRows: receivingRows(home),
  },
  {
    key: 'defense',
    title: 'Defense',
    columns: ['Player', 'TOT', 'SOLO', 'SACK', 'TFL', 'PD', 'FUM', 'FR', 'TD'],
    awayRows: defenseRows(away),
    homeRows: defenseRows(home),
  },
  {
    key: 'kicking',
    title: 'Kicking',
    columns: ['Player', 'FG', 'LONG FG', 'XP'],
    awayRows: kickingRows(away),
    homeRows: kickingRows(home),
  },
  {
    key: 'punting',
    title: 'Punting',
    columns: ['Player', 'PUNTS', 'YDS', 'AVG', 'IN20', 'TB', 'LONG'],
    awayRows: puntingRows(away),
    homeRows: puntingRows(home),
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
    awayRows: returnRows(away),
    homeRows: returnRows(home),
  },
];

const PlayerStatTeamTable = ({
  teamAbbreviation,
  columns,
  rows,
}: {
  readonly teamAbbreviation: string;
  readonly columns: readonly string[];
  readonly rows: readonly FormattedStatRow[];
}) => {
  if (rows.length === 0) return null;
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 800 }}
      >
        {teamAbbreviation}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" aria-label={`${teamAbbreviation} stats table`}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={column} align={index === 0 ? 'left' : 'right'}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {row.cells.map((cell, index) => (
                  <TableCell
                    key={index}
                    align={index === 0 ? 'left' : 'right'}
                    sx={
                      index === 0
                        ? undefined
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
    </Box>
  );
};

export const PlayerStatsPanel = ({
  awayTeam,
  homeTeam,
  playerStatsAvailable,
  awayStats,
  homeStats,
}: {
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
  readonly playerStatsAvailable: boolean;
  readonly awayStats: GamePlayerStatsByCategory;
  readonly homeStats: GamePlayerStatsByCategory;
}) => {
  const categories = buildCategories(awayStats, homeStats);
  const hasAnyRows = categories.some(
    (category) => category.awayRows.length > 0 || category.homeRows.length > 0,
  );

  if (!playerStatsAvailable || !hasAnyRows) {
    return (
      <Typography color="text.secondary">
        Player statistics are not yet available for this game.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
        Player Stats
      </Typography>
      {categories.map((category) =>
        category.awayRows.length === 0 &&
        category.homeRows.length === 0 ? null : (
          <Stack key={category.key} spacing={1.5}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {category.title}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <PlayerStatTeamTable
                teamAbbreviation={awayTeam.abbreviation}
                columns={category.columns}
                rows={category.awayRows}
              />
              <PlayerStatTeamTable
                teamAbbreviation={homeTeam.abbreviation}
                columns={category.columns}
                rows={category.homeRows}
              />
            </Box>
          </Stack>
        ),
      )}
    </Stack>
  );
};
