import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { formatAsOfDate } from '@/features/powerRankings/presentation';
import type {
  PowerRankingEdition,
  PowerRankingEditionSummary,
} from '@/features/powerRankings/types';

export const EditionHeader = ({
  edition,
  editions,
  onSelectEdition,
}: {
  readonly edition: PowerRankingEdition;
  readonly editions: readonly PowerRankingEditionSummary[];
  readonly onSelectEdition: (edition: PowerRankingEditionSummary) => void;
}) => (
  <Stack spacing={2} component="header">
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{ justifyContent: 'space-between', alignItems: { md: 'end' } }}
    >
      <Box>
        <Typography variant="overline" color="primary.light">
          NFL POWER RANKINGS
        </Typography>
        <Typography component="h1" variant="h2">
          {edition.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {edition.subtitle}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Updated {formatAsOfDate(edition.asOf)}
      </Typography>
    </Stack>

    {editions.length > 1 ? (
      <TextField
        select
        label="Edition"
        value={edition.id}
        onChange={(event) => {
          const next = editions.find(
            (candidate) => candidate.id === event.target.value,
          );
          if (next) onSelectEdition(next);
        }}
        sx={{ maxWidth: 320 }}
      >
        {editions.map((candidate) => (
          <MenuItem key={candidate.id} value={candidate.id}>
            {candidate.title} — {formatAsOfDate(candidate.asOf)}
          </MenuItem>
        ))}
      </TextField>
    ) : null}

    <Alert severity="info" variant="outlined">
      This is independent 2nd &amp; 15 editorial analysis, not an official NFL
      ranking.
    </Alert>
  </Stack>
);
