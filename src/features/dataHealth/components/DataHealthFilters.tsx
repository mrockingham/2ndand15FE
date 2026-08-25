import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
} from '@mui/material';

import { gameStatusLabel, seasonTypeLabel } from '@/features/admin/format';
import {
  issueTypeOptions,
  type DataHealthIssueType,
} from '@/features/dataHealth/presentation';
import type { GameStatus, SeasonType } from '@/features/games/types';
import type { Team } from '@/features/teams/types';

export interface DataHealthFilterValue {
  readonly season: number | undefined;
  readonly seasonType: SeasonType | undefined;
  readonly week: number | undefined;
  readonly teamId: string | undefined;
  readonly gameStatus: GameStatus | undefined;
  readonly issuesOnly: boolean;
  readonly issueType: DataHealthIssueType;
}

const seasonTypes: readonly SeasonType[] = ['PRE', 'REG', 'POST'];
const gameStatuses: readonly GameStatus[] = [
  'SCHEDULED',
  'PREGAME',
  'IN_PROGRESS',
  'HALFTIME',
  'FINAL',
  'POSTPONED',
  'CANCELED',
  'SUSPENDED',
];
const weeks = Array.from({ length: 22 }, (_, index) => index + 1);

export const DataHealthFilters = ({
  value,
  onChange,
  teams,
  currentSeason,
}: {
  readonly value: DataHealthFilterValue;
  readonly onChange: (patch: Partial<DataHealthFilterValue>) => void;
  readonly teams: readonly Team[];
  readonly currentSeason: number;
}) => {
  const seasons = Array.from(
    { length: 8 },
    (_, index) => currentSeason + 1 - index,
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        <FormControl size="small">
          <InputLabel id="data-health-season-label">Season</InputLabel>
          <Select<string>
            labelId="data-health-season-label"
            label="Season"
            value={value.season === undefined ? '' : String(value.season)}
            onChange={(event) =>
              onChange({
                season:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
          >
            <MenuItem value="">All seasons</MenuItem>
            {seasons.map((season) => (
              <MenuItem key={season} value={String(season)}>
                {season}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="data-health-season-type-label">
            Season Type
          </InputLabel>
          <Select<string>
            labelId="data-health-season-type-label"
            label="Season Type"
            value={value.seasonType ?? ''}
            onChange={(event) =>
              onChange({
                seasonType:
                  event.target.value === ''
                    ? undefined
                    : (event.target.value as SeasonType),
              })
            }
          >
            <MenuItem value="">All season types</MenuItem>
            {seasonTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {seasonTypeLabel[type]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="data-health-week-label">Week</InputLabel>
          <Select<string>
            labelId="data-health-week-label"
            label="Week"
            value={value.week === undefined ? '' : String(value.week)}
            onChange={(event) =>
              onChange({
                week:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
          >
            <MenuItem value="">All weeks</MenuItem>
            {weeks.map((week) => (
              <MenuItem key={week} value={String(week)}>
                Week {week}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="data-health-team-label">Team</InputLabel>
          <Select
            labelId="data-health-team-label"
            label="Team"
            value={value.teamId ?? ''}
            onChange={(event) =>
              onChange({
                teamId:
                  event.target.value === '' ? undefined : event.target.value,
              })
            }
          >
            <MenuItem value="">All teams</MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.fullName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="data-health-status-label">Game Status</InputLabel>
          <Select<string>
            labelId="data-health-status-label"
            label="Game Status"
            value={value.gameStatus ?? ''}
            onChange={(event) =>
              onChange({
                gameStatus:
                  event.target.value === ''
                    ? undefined
                    : (event.target.value as GameStatus),
              })
            }
          >
            <MenuItem value="">All statuses</MenuItem>
            {gameStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {gameStatusLabel[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="data-health-issue-type-label">Issue Type</InputLabel>
          <Select<string>
            labelId="data-health-issue-type-label"
            label="Issue Type"
            value={value.issueType}
            onChange={(event) =>
              onChange({
                issueType: event.target
                  .value as DataHealthFilterValue['issueType'],
              })
            }
          >
            {issueTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          sx={{ alignSelf: 'center' }}
          control={
            <Switch
              checked={value.issuesOnly}
              onChange={(event) =>
                onChange({ issuesOnly: event.target.checked })
              }
            />
          }
          label="Only Problems"
        />
      </Box>
    </Paper>
  );
};
