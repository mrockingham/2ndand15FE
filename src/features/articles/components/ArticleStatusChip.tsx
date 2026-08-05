import { Chip } from '@mui/material';
import type { ArticleStatus } from '@/features/articles/types';
const colors: Record<
  ArticleStatus,
  'default' | 'info' | 'success' | 'warning'
> = {
  DRAFT: 'default',
  SCHEDULED: 'info',
  PUBLISHED: 'success',
  UNPUBLISHED: 'warning',
  ARCHIVED: 'default',
};
export const ArticleStatusChip = ({
  status,
}: {
  readonly status: ArticleStatus;
}) => (
  <Chip
    size="small"
    color={colors[status]}
    variant={status === 'ARCHIVED' ? 'outlined' : 'filled'}
    label={status}
  />
);
