import { Box, Card, CardContent, Typography } from '@mui/material';

import {
  derivePageScopedPlayerStatsCounts,
  derivePageScopedResultCounts,
  derivePageScopedTeamStatsCounts,
} from '@/features/dataHealth/presentation';
import type {
  DataHealthGameRow,
  DataHealthSummary,
} from '@/features/dataHealth/types';

const SummaryCard = ({
  title,
  headline,
  pageScoped,
  emphasize,
}: {
  readonly title: string;
  readonly headline: string;
  readonly pageScoped?: string;
  readonly emphasize?: boolean;
}) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 850, color: emphasize ? 'warning.main' : undefined }}
      >
        {headline}
      </Typography>
      {pageScoped === undefined ? null : (
        <Typography variant="caption" color="text.secondary">
          On this page: {pageScoped}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const DataHealthSummaryCards = ({
  summary,
  rows,
}: {
  readonly summary: DataHealthSummary;
  readonly rows: readonly DataHealthGameRow[];
}) => {
  const resultCounts = derivePageScopedResultCounts(rows);
  const teamStatsCounts = derivePageScopedTeamStatsCounts(rows);
  const playerStatsCounts = derivePageScopedPlayerStatsCounts(rows);

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        mb: 3,
      }}
    >
      <SummaryCard title="Games" headline={summary.games.toLocaleString()} />
      <SummaryCard
        title="Results"
        headline={`${summary.resultsComplete} complete · ${summary.resultsMissing} missing`}
        pageScoped={`${resultCounts.partial} partial · ${resultCounts.unavailable} unavailable · ${resultCounts.pending} pending`}
      />
      <SummaryCard
        title="Team Stats"
        headline={`${summary.teamStatsComplete} complete · ${summary.teamStatsMissing} missing`}
        pageScoped={`${teamStatsCounts.partial} partial · ${teamStatsCounts.unavailable} unavailable · ${teamStatsCounts.pending} pending`}
      />
      <SummaryCard
        title="Player Stats"
        headline={`${summary.playerStatsComplete} complete · ${summary.playerStatsMissing} missing`}
        pageScoped={`${playerStatsCounts.partial} partial · ${playerStatsCounts.unavailable} unavailable · ${playerStatsCounts.pending} pending`}
      />
      <SummaryCard
        title="Needs Investigation"
        headline={summary.needsInvestigation.toLocaleString()}
        emphasize={summary.needsInvestigation > 0}
      />
    </Box>
  );
};
