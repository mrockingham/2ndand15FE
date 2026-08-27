import CloseRounded from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { DataHealthStateChip } from '@/features/dataHealth/components/DataHealthStateChip';
import { ProviderProbeSection } from '@/features/dataHealth/components/ProviderProbeSection';
import {
  describePlayerStatsDiagnosis,
  describePlaysDiagnosis,
  describeResultDiagnosis,
  describeTeamStatsDiagnosis,
  formatCheckedAgo,
} from '@/features/dataHealth/presentation';
import { useDataHealthGameQuery } from '@/features/dataHealth/queries';
import type { DataHealthGameRow } from '@/features/dataHealth/types';
import { formatAdminDateTime, seasonTypeLabel } from '@/features/admin/format';
import { getAdminErrorMessage } from '@/features/admin/errorMessages';

const SectionHeading = ({ children }: { readonly children: string }) => (
  <Typography variant="overline" color="text.secondary">
    {children}
  </Typography>
);

const Field = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => (
  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
    <Typography color="text.secondary">{label}</Typography>
    <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
  </Stack>
);

export const DataHealthDetailDrawer = ({
  row,
  open,
  onClose,
  canProbe,
}: {
  readonly row: DataHealthGameRow | null;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly canProbe: boolean;
}) => {
  const gameId = row?.gameId ?? '';
  const detailQuery = useDataHealthGameQuery(gameId, open);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="data-health-drawer-title"
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 480 }, p: 3 } }}
    >
      {row === null ? null : (
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <Box>
              <Typography id="data-health-drawer-title" variant="h5">
                {row.awayTeam.abbreviation} @ {row.homeTeam.abbreviation}
              </Typography>
              <Typography color="text.secondary">
                {row.season} {seasonTypeLabel[row.seasonType]}
                {row.week === null ? '' : ` · Week ${row.week}`} ·{' '}
                {formatAdminDateTime(row.kickoff)}
              </Typography>
            </Box>
            <IconButton aria-label="Close" onClick={onClose}>
              <CloseRounded />
            </IconButton>
          </Stack>

          {detailQuery.data === undefined ? (
            detailQuery.isPending ? (
              <Stack sx={{ alignItems: 'center', py: 4 }}>
                <CircularProgress size={28} aria-label="Loading game detail" />
              </Stack>
            ) : (
              <Box>
                <Typography color="error">
                  {getAdminErrorMessage(detailQuery.error)}
                </Typography>
                <Button onClick={() => detailQuery.refetch()}>Retry</Button>
              </Box>
            )
          ) : (
            <>
              <Box>
                <SectionHeading>Game</SectionHeading>
                <Field label="Status" value={detailQuery.data.status} />
                <Field
                  label="Score"
                  value={
                    detailQuery.data.homeScore === null ||
                    detailQuery.data.awayScore === null
                      ? '—'
                      : `${detailQuery.data.awayScore} – ${detailQuery.data.homeScore}`
                  }
                />
                <Field
                  label="Provider mapped"
                  value={
                    detailQuery.data.providerMapping.available ? 'Yes' : 'No'
                  }
                />
              </Box>

              <Divider />

              <Box>
                <SectionHeading>Result</SectionHeading>
                <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                  <DataHealthStateChip state={detailQuery.data.result.state} />
                </Stack>
                <Field
                  label="Editorial fallback"
                  value={detailQuery.data.hasResultFallback ? 'Yes' : 'No'}
                />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {describeResultDiagnosis(
                    detailQuery.data.lastProbe?.resultDiagnosis ??
                      detailQuery.data.result.reasonCode,
                  )}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <SectionHeading>Team Stats</SectionHeading>
                <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                  <DataHealthStateChip
                    state={detailQuery.data.teamStats.state}
                  />
                </Stack>
                <Field
                  label="Database rows"
                  value={`${detailQuery.data.teamStats.rowCount} of 2 expected`}
                />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {describeTeamStatsDiagnosis(
                    detailQuery.data.lastProbe?.teamStatsDiagnosis ??
                      detailQuery.data.teamStats.reasonCode,
                  )}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <SectionHeading>Player Stats</SectionHeading>
                <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                  <DataHealthStateChip
                    state={detailQuery.data.playerStats.state}
                  />
                </Stack>
                <Field
                  label="Database"
                  value={`${detailQuery.data.playerStats.totalRows} player rows persisted`}
                />
                <Field
                  label="Home / Away rows"
                  value={`${detailQuery.data.playerStats.homeRows} / ${detailQuery.data.playerStats.awayRows}`}
                />
                {detailQuery.data.playerStats.coverage === null ? null : (
                  <>
                    <Field
                      label="Provider"
                      value={`${detailQuery.data.playerStats.coverage.providerRows} player rows observed`}
                    />
                    <Field
                      label="Identity resolution"
                      value={`${detailQuery.data.playerStats.coverage.resolvedRows} resolved · ${detailQuery.data.playerStats.coverage.unresolvedRows} unresolved`}
                    />
                  </>
                )}
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {describePlayerStatsDiagnosis(
                    detailQuery.data.lastProbe?.playerStatsDiagnosis ??
                      detailQuery.data.playerStats.reasonCode,
                  )}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <SectionHeading>Plays</SectionHeading>
                <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                  <DataHealthStateChip state={detailQuery.data.plays.state} />
                </Stack>
                <Field
                  label="Active plays"
                  value={String(detailQuery.data.plays.activeCount)}
                />
                <Field
                  label="Superseded plays"
                  value={String(detailQuery.data.plays.supersededCount)}
                />
                {detailQuery.data.plays.reviewRequired ? (
                  <Typography color="warning.main" sx={{ mt: 1 }}>
                    Play reconciliation review required
                    {detailQuery.data.plays.blockReason === null
                      ? ''
                      : `: ${detailQuery.data.plays.blockReason}`}
                  </Typography>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {describePlaysDiagnosis(
                      detailQuery.data.lastProbe?.playsDiagnosis ??
                        'PLAYS_PENDING',
                    )}
                  </Typography>
                )}
              </Box>

              {detailQuery.data.poller === null ? null : (
                <>
                  <Divider />
                  <Box>
                    <SectionHeading>Poller</SectionHeading>
                    <Field
                      label="Last success"
                      value={
                        detailQuery.data.poller.lastSuccessAt === null
                          ? 'Never'
                          : formatCheckedAgo(
                              detailQuery.data.poller.lastSuccessAt,
                            )
                      }
                    />
                    <Field
                      label="Next poll"
                      value={
                        detailQuery.data.poller.nextPollAt === null
                          ? '—'
                          : formatAdminDateTime(
                              detailQuery.data.poller.nextPollAt,
                            )
                      }
                    />
                    {detailQuery.data.poller.lastError === null ? null : (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{ mt: 1 }}
                      >
                        {detailQuery.data.poller.lastError}
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              <Divider />

              <ProviderProbeSection
                gameId={gameId}
                isOpen={open}
                canProbe={canProbe}
              />
            </>
          )}
        </Stack>
      )}
    </Drawer>
  );
};
