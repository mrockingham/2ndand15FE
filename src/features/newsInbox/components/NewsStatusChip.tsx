import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

import {
  candidateStatusLabel,
  runStatusLabel,
  sourceStatusLabel,
} from '@/features/newsInbox/presentation';
import type {
  NewsCandidateStatus,
  NewsIngestionRunStatus,
  NewsSourceStatus,
} from '@/features/newsInbox/types';

type Status = NewsSourceStatus | NewsCandidateStatus | NewsIngestionRunStatus;

const colorFor = (status: Status): ChipProps['color'] => {
  if (['ACTIVE', 'SUCCEEDED', 'CONVERTED'].includes(status)) return 'success';
  if (['ERROR', 'FAILED', 'DISMISSED', 'DISABLED'].includes(status))
    return 'error';
  if (['PARTIAL', 'PAUSED', 'SAVED'].includes(status)) return 'warning';
  if (['REVIEWING', 'RUNNING'].includes(status)) return 'primary';
  return 'default';
};

export const SourceStatusChip = ({
  status,
}: {
  readonly status: NewsSourceStatus;
}) => (
  <Chip
    label={sourceStatusLabel[status]}
    color={colorFor(status)}
    size="small"
    sx={{ fontWeight: 800 }}
  />
);

export const CandidateStatusChip = ({
  status,
}: {
  readonly status: NewsCandidateStatus;
}) => (
  <Chip
    label={candidateStatusLabel[status]}
    color={colorFor(status)}
    size="small"
    sx={{ fontWeight: 800 }}
  />
);

export const RunStatusChip = ({
  status,
}: {
  readonly status: NewsIngestionRunStatus;
}) => (
  <Chip
    label={runStatusLabel[status]}
    color={colorFor(status)}
    size="small"
    sx={{ fontWeight: 800 }}
  />
);
