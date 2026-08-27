import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

import type { ContactMessageStatus } from '@/features/contact/types';

const statusLabel: Readonly<Record<ContactMessageStatus, string>> = {
  NEW: 'New',
  READ: 'Read',
  RESOLVED: 'Resolved',
  SPAM: 'Spam',
};

const colorFor = (status: ContactMessageStatus): ChipProps['color'] => {
  if (status === 'NEW') return 'primary';
  if (status === 'RESOLVED') return 'success';
  if (status === 'SPAM') return 'error';
  return 'default';
};

export const ContactStatusChip = ({
  status,
}: {
  readonly status: ContactMessageStatus;
}) => (
  <Chip
    label={statusLabel[status]}
    color={colorFor(status)}
    size="small"
    sx={{ fontWeight: 800 }}
  />
);
