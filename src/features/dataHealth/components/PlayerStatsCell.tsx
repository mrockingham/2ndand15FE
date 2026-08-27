import { Stack, Typography } from '@mui/material';

import { DataHealthStateChip } from '@/features/dataHealth/components/DataHealthStateChip';
import type { DataHealthGameRow } from '@/features/dataHealth/types';

/**
 * The list row only carries a DB-only rowCount plus a diagnosis code -- exact
 * provider/unresolved counts (e.g. "82 rows / 67 resolved / 15 unresolved")
 * only exist on the per-game detail response after opening Review. This cell
 * shows everything the list endpoint actually knows, preferring a cached
 * lastProbe diagnosis (richer) over the DB-only reasonCode when one exists.
 */
export const PlayerStatsCell = ({
  row,
}: {
  readonly row: DataHealthGameRow;
}) => {
  const { state, rowCount } = row.playerStats;
  const diagnosisCode =
    row.lastProbe?.playerStatsDiagnosis ?? row.playerStats.reasonCode;

  const detail = (() => {
    if (state === 'COMPLETE') return `${rowCount.toLocaleString()} rows`;
    if (state === 'PARTIAL') {
      return `${rowCount.toLocaleString()} rows persisted · unresolved identities`;
    }
    if (state === 'MISSING') {
      if (diagnosisCode === 'PROVIDER_HAS_PLAYER_STATS_DB_MISSING') {
        return 'Provider has data';
      }
      if (diagnosisCode === 'PLAYER_IDENTITY_UNRESOLVED') {
        return 'Blocked on identity resolution';
      }
      return 'Provider not checked';
    }
    if (state === 'UNAVAILABLE') return 'No player stats from provider';
    if (state === 'PENDING') return 'Not expected yet';
    return 'Needs review';
  })();

  return (
    <Stack spacing={0.5}>
      <DataHealthStateChip state={state} />
      <Typography variant="caption" color="text.secondary">
        {detail}
      </Typography>
    </Stack>
  );
};
