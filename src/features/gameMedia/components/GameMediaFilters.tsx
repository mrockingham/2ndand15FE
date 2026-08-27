import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@mui/material';

import { seasonTypeLabel } from '@/features/admin/format';
import type { SeasonType } from '@/features/games/types';

export interface GameMediaFilterValue {
  readonly season: number | undefined;
  readonly seasonType: SeasonType | undefined;
  readonly week: number | undefined;
}

const seasonTypes: readonly SeasonType[] = ['PRE', 'REG', 'POST'];
const weeks = Array.from({ length: 22 }, (_, index) => index + 1);

export const GameMediaFilters = ({
  value,
  onChange,
  currentSeason,
}: {
  readonly value: GameMediaFilterValue;
  readonly onChange: (patch: Partial<GameMediaFilterValue>) => void;
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        <FormControl size="small">
          <InputLabel id="game-media-season-label">Season</InputLabel>
          <Select<string>
            labelId="game-media-season-label"
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
          <InputLabel id="game-media-season-type-label">Season Type</InputLabel>
          <Select<string>
            labelId="game-media-season-type-label"
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
          <InputLabel id="game-media-week-label">Week</InputLabel>
          <Select<string>
            labelId="game-media-week-label"
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
      </Box>
    </Paper>
  );
};
