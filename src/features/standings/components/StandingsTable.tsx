import {
  Box,
  Chip,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  formatPointDifferential,
  formatStandingsRecord,
  formatWinPercentage,
} from '@/features/standings/presentation';
import type {
  StandingTeam,
  StandingsSeasonType,
} from '@/features/standings/types';

const numericCellSx = {
  px: 1,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
} as const;

const nullableNumber = (value: number | null) => value ?? '—';

const Differential = ({ value }: { readonly value: number | null }) => (
  <Typography
    component="span"
    variant="body2"
    color={
      value === null || value === 0
        ? 'text.primary'
        : value > 0
          ? 'success.main'
          : 'error.main'
    }
    sx={{ fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}
  >
    {formatPointDifferential(value)}
  </Typography>
);

export const StandingsTable = ({
  label,
  teams,
  seasonType,
}: {
  readonly label: string;
  readonly teams: readonly StandingTeam[];
  readonly seasonType: StandingsSeasonType;
}) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    tabIndex={0}
    aria-label={`${label} standings table; scroll horizontally for more columns`}
    sx={{ overflowX: 'auto', maxWidth: '100%' }}
  >
    <Table
      size="small"
      aria-label={`${label} standings`}
      sx={{ minWidth: 1080, tableLayout: 'fixed' }}
    >
      <TableHead>
        <TableRow>
          <TableCell
            sx={{
              position: 'sticky',
              left: 0,
              zIndex: 3,
              width: { xs: 120, sm: 260 },
              bgcolor: 'background.paper',
              fontWeight: 850,
            }}
            scope="col"
          >
            Team
          </TableCell>
          {['W', 'L', 'T', 'PCT'].map((column) => (
            <TableCell
              key={column}
              scope="col"
              sx={{ ...numericCellSx, fontWeight: 850 }}
            >
              {column}
            </TableCell>
          ))}
          {['HOME', 'AWAY', 'DIV', 'CONF', 'PF', 'PA', 'DIFF', 'STRK'].map(
            (column) => (
              <TableCell
                key={column}
                scope="col"
                sx={{ ...numericCellSx, fontWeight: 850 }}
              >
                {column}
              </TableCell>
            ),
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.teamId} hover>
            <TableCell
              component="th"
              scope="row"
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 2,
                bgcolor: 'background.paper',
                py: 0.75,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TeamHelmet team={team.abbreviation} size="sm" decorative />
                <Box sx={{ minWidth: 0 }}>
                  <Link
                    component={RouterLink}
                    to={`/teams/${team.teamId}`}
                    color="inherit"
                    underline="hover"
                    sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: 'none', sm: 'inline' } }}
                    >
                      {team.name}
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: { xs: 'inline', sm: 'none' } }}
                    >
                      {team.abbreviation}
                    </Box>
                  </Link>
                  {seasonType === 'REG' &&
                  team.playoffSeed !== null &&
                  team.playoffSeed > 0 ? (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Seed ${team.playoffSeed}`}
                      sx={{ ml: 1, height: 20, fontSize: '0.68rem' }}
                    />
                  ) : null}
                </Box>
              </Stack>
            </TableCell>
            <TableCell sx={numericCellSx}>
              {nullableNumber(team.wins)}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {nullableNumber(team.losses)}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {nullableNumber(team.ties)}
            </TableCell>
            <TableCell sx={{ ...numericCellSx, fontWeight: 850 }}>
              {formatWinPercentage(team.winPercentage)}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {formatStandingsRecord(
                team.homeWins,
                team.homeLosses,
                team.homeTies,
              )}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {formatStandingsRecord(
                team.awayWins,
                team.awayLosses,
                team.awayTies,
              )}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {formatStandingsRecord(
                team.divisionWins,
                team.divisionLosses,
                team.divisionTies,
              )}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {formatStandingsRecord(
                team.conferenceWins,
                team.conferenceLosses,
                team.conferenceTies,
              )}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {nullableNumber(team.pointsFor)}
            </TableCell>
            <TableCell sx={numericCellSx}>
              {nullableNumber(team.pointsAgainst)}
            </TableCell>
            <TableCell sx={numericCellSx}>
              <Differential value={team.pointDifferential} />
            </TableCell>
            <TableCell sx={numericCellSx}>
              {team.streakDisplay ?? '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
