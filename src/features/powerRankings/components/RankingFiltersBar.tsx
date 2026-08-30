import SearchRounded from '@mui/icons-material/SearchRounded';
import { Box, MenuItem, Paper, TextField } from '@mui/material';

import {
  CONFERENCE_OPTIONS,
  DIVISION_OPTIONS,
  type PowerRankingsFilterState,
} from '@/features/powerRankings/presentation';

export const RankingFiltersBar = ({
  filters,
  tiers,
  onChange,
}: {
  readonly filters: PowerRankingsFilterState;
  readonly tiers: readonly string[];
  readonly onChange: (next: Partial<PowerRankingsFilterState>) => void;
}) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      <TextField
        label="Search teams or headlines"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        slotProps={{
          input: {
            startAdornment: <SearchRounded color="action" sx={{ mr: 1 }} />,
          },
        }}
      />
      <TextField
        select
        label="Conference"
        value={filters.conference}
        onChange={(event) =>
          onChange({
            conference: event.target
              .value as PowerRankingsFilterState['conference'],
          })
        }
      >
        <MenuItem value="">All conferences</MenuItem>
        {CONFERENCE_OPTIONS.map((conference) => (
          <MenuItem key={conference} value={conference}>
            {conference}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Division"
        value={filters.division}
        onChange={(event) =>
          onChange({
            division: event.target
              .value as PowerRankingsFilterState['division'],
          })
        }
      >
        <MenuItem value="">All divisions</MenuItem>
        {DIVISION_OPTIONS.map((division) => (
          <MenuItem key={division} value={division}>
            {division}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Tier"
        value={filters.tier}
        onChange={(event) => onChange({ tier: event.target.value })}
      >
        <MenuItem value="">All tiers</MenuItem>
        {tiers.map((tier) => (
          <MenuItem key={tier} value={tier}>
            {tier}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  </Paper>
);
