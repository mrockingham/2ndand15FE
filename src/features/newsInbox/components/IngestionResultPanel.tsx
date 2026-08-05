import { Alert, Box, Paper, Stack, Typography } from '@mui/material';

import { RunStatusChip } from '@/features/newsInbox/components/NewsStatusChip';
import type { IngestionResult } from '@/features/newsInbox/types';

export const IngestionResultPanel = ({
  result,
}: {
  readonly result: IngestionResult;
}) => {
  const run = result.run;
  return (
    <Paper
      component="section"
      variant="outlined"
      sx={{ p: 2.5 }}
      aria-labelledby="ingestion-result-heading"
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography id="ingestion-result-heading" variant="h4">
              {result.testedOnly ? 'Source test result' : 'Ingestion result'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {result.testedOnly
                ? 'Read-only test; no candidates were created.'
                : 'Manual ingestion created private candidate metadata only.'}
            </Typography>
          </Box>
          <RunStatusChip status={run.status} />
        </Stack>
        {result.notModified ? (
          <Alert severity="info">
            The feed has not changed since its stored validator.
          </Alert>
        ) : null}
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          }}
        >
          <Metric
            label="Feed format"
            value={result.feedKind ?? 'Not returned'}
          />
          <Metric
            label="Response size"
            value={
              run.responseBytes === null
                ? 'Not returned'
                : `${run.responseBytes.toLocaleString()} bytes`
            }
          />
          <Metric label="Fetched" value={run.fetchedCount} />
          <Metric label="Created" value={run.createdCount} />
          <Metric label="Updated" value={run.updatedCount} />
          <Metric label="Skipped" value={run.skippedCount} />
          <Metric label="Failed" value={run.failedCount} />
          <Metric
            label="Conditional validator"
            value={
              run.hasResponseEtag || run.hasResponseModified ? 'Stored' : 'None'
            }
          />
        </Box>
        {run.errorSummary === null ? null : (
          <Alert severity="warning">
            {run.errorCode ? `${run.errorCode}: ` : ''}
            {run.errorSummary}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

const Metric = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | number;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
  </Box>
);
