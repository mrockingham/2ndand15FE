import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import { Chip } from '@mui/material';

import {
  coverageStateColor,
  coverageStateLabel,
} from '@/features/dataHealth/presentation';
import type { DataHealthCoverageState } from '@/features/dataHealth/types';

const iconFor = (state: DataHealthCoverageState) => {
  switch (state) {
    case 'COMPLETE':
      return <CheckCircleRounded fontSize="small" />;
    case 'PARTIAL':
      return <WarningAmberRounded fontSize="small" />;
    case 'MISSING':
      return <ErrorOutlineRounded fontSize="small" />;
    case 'PENDING':
      return <ScheduleRounded fontSize="small" />;
    case 'UNAVAILABLE':
      return <RemoveCircleOutlineRounded fontSize="small" />;
    case 'UNKNOWN':
      return <HelpOutlineRounded fontSize="small" />;
  }
};

export const DataHealthStateChip = ({
  state,
}: {
  readonly state: DataHealthCoverageState;
}) => (
  <Chip
    icon={iconFor(state)}
    label={coverageStateLabel[state]}
    color={coverageStateColor[state]}
    size="small"
    variant={
      state === 'UNAVAILABLE' || state === 'UNKNOWN' ? 'outlined' : 'filled'
    }
    sx={{ fontWeight: 800 }}
  />
);
