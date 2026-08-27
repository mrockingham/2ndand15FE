import { useState } from 'react';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import {
  useDataHealthProbesQuery,
  useRunDataHealthProbeMutation,
} from '@/features/dataHealth/queries';
import {
  describePlayerStatsDiagnosis,
  describePlaysDiagnosis,
  describeResultDiagnosis,
  describeTeamStatsDiagnosis,
  formatCheckedAgo,
  formatQuota,
} from '@/features/dataHealth/presentation';
import type { DataHealthProbeRecord } from '@/features/dataHealth/types';
import { getAdminErrorMessage } from '@/features/admin/errorMessages';

const ComparisonLine = ({
  label,
  text,
}: {
  readonly label: string;
  readonly text: string;
}) => (
  <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
    <Typography sx={{ fontWeight: 800, minWidth: 96 }}>{label}</Typography>
    <Typography color="text.secondary">{text}</Typography>
  </Stack>
);

const ProbeHistoryRow = ({
  probe,
}: {
  readonly probe: DataHealthProbeRecord;
}) => (
  <Box sx={{ py: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>
      {formatCheckedAgo(probe.checkedAt)}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="div">
      Result: {describeResultDiagnosis(probe.resultDiagnosis)}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="div">
      Team stats: {describeTeamStatsDiagnosis(probe.teamStatsDiagnosis)}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="div">
      Player stats: {describePlayerStatsDiagnosis(probe.playerStatsDiagnosis)}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="div">
      Plays: {describePlaysDiagnosis(probe.playsDiagnosis)}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="div">
      {probe.providerReachable ? 'Provider reachable' : 'Provider unreachable'}{' '}
      · {probe.errorCode ?? 'no error'}
    </Typography>
  </Box>
);

export const ProviderProbeSection = ({
  gameId,
  isOpen,
  canProbe,
}: {
  readonly gameId: string;
  readonly isOpen: boolean;
  readonly canProbe: boolean;
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const probesQuery = useDataHealthProbesQuery(gameId, isOpen);
  const mutation = useRunDataHealthProbeMutation(gameId);

  const latestPersisted = probesQuery.data?.[0] ?? null;
  const previousProbes = probesQuery.data?.slice(1) ?? [];

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Provider Check</Typography>

      {!canProbe ? (
        <Typography variant="caption" color="text.secondary">
          Admin role required to run a Highlightly check.
        </Typography>
      ) : null}

      <Button
        variant="outlined"
        disabled={!canProbe || mutation.isPending}
        onClick={() => mutation.mutate()}
        sx={{ alignSelf: 'flex-start' }}
      >
        {mutation.isPending ? 'Checking Highlightly…' : 'Check Highlightly'}
      </Button>

      {mutation.isError ? (
        <Alert severity="error">
          Provider check failed: {getAdminErrorMessage(mutation.error)}
        </Alert>
      ) : null}

      {mutation.data ? (
        <Box>
          <Typography variant="subtitle2">Checked just now</Typography>
          <Stack direction="row" spacing={3} sx={{ my: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Requests
              </Typography>
              <Typography>{mutation.data.provider.requestCount}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography>{mutation.data.provider.durationMs} ms</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Quota
              </Typography>
              <Typography>
                {formatQuota(
                  mutation.data.provider.quotaLimit,
                  mutation.data.provider.quotaRemaining,
                )}
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <ComparisonLine
            label="Result"
            text={mutation.data.result.explanation}
          />
          <ComparisonLine
            label="Team Stats"
            text={mutation.data.teamStats.explanation}
          />
          <ComparisonLine
            label="Player Stats"
            text={mutation.data.playerStats.explanation}
          />
          <ComparisonLine
            label="Plays"
            text={mutation.data.plays.explanation}
          />
        </Box>
      ) : latestPersisted !== null ? (
        <Box>
          <Typography variant="subtitle2">
            Checked {formatCheckedAgo(latestPersisted.checkedAt)}
          </Typography>
          <Stack direction="row" spacing={3} sx={{ my: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Requests
              </Typography>
              <Typography>{latestPersisted.requestCount}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography>{latestPersisted.durationMs} ms</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Quota
              </Typography>
              <Typography>
                {formatQuota(
                  latestPersisted.quotaLimit,
                  latestPersisted.quotaRemaining,
                )}
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <ComparisonLine
            label="Result"
            text={describeResultDiagnosis(latestPersisted.resultDiagnosis)}
          />
          <ComparisonLine
            label="Team Stats"
            text={describeTeamStatsDiagnosis(
              latestPersisted.teamStatsDiagnosis,
            )}
          />
          <ComparisonLine
            label="Player Stats"
            text={describePlayerStatsDiagnosis(
              latestPersisted.playerStatsDiagnosis,
            )}
          />
          <ComparisonLine
            label="Plays"
            text={describePlaysDiagnosis(latestPersisted.playsDiagnosis)}
          />
        </Box>
      ) : probesQuery.isPending && isOpen ? (
        <CircularProgress
          size={20}
          aria-label="Loading provider check history"
        />
      ) : (
        <Typography color="text.secondary">
          Highlightly has not been queried for diagnostic availability for this
          game.
        </Typography>
      )}

      {previousProbes.length > 0 ? (
        <Box component="details" open={showHistory}>
          <Stack
            component="summary"
            direction="row"
            spacing={0.5}
            onClick={(event) => {
              event.preventDefault();
              setShowHistory((value) => !value);
            }}
            sx={{ alignItems: 'center', cursor: 'pointer', fontWeight: 750 }}
          >
            <ExpandMoreRounded fontSize="small" aria-hidden="true" />
            <span>Previous Checks</span>
          </Stack>
          {showHistory ? (
            <Stack divider={<Divider />}>
              {previousProbes.map((probe) => (
                <ProbeHistoryRow key={probe.id} probe={probe} />
              ))}
            </Stack>
          ) : null}
        </Box>
      ) : null}
    </Stack>
  );
};
