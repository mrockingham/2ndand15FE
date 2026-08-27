import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { ContactStatusChip } from '@/features/contact/components/ContactStatusChip';
import { getContactErrorMessage } from '@/features/contact/errorMessages';
import {
  useContactMessageQuery,
  useUpdateContactMessageStatusMutation,
} from '@/features/contact/queries';
import type { ContactMessageStatus } from '@/features/contact/types';
import { useCurrentUserQuery } from '@/features/users/queries';

const statuses: readonly ContactMessageStatus[] = [
  'NEW',
  'READ',
  'RESOLVED',
  'SPAM',
];

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(parsed);
};

export const AdminContactMessageDetailPage = () => {
  const messageId = useParams().messageId ?? '';
  const query = useContactMessageQuery(messageId);
  const isAdmin = useCurrentUserQuery().data?.role === 'ADMIN';
  const statusMutation = useUpdateContactMessageStatusMutation(messageId);

  if (query.isPending) return <AdminLoading label="Loading message" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );

  const message = query.data;

  return (
    <>
      <AdminPageHeader
        title={message.subject ?? 'Contact message'}
        description={`From ${message.name} · Received ${formatDate(message.createdAt)}`}
        action={
          <Button component={RouterLink} to="/admin/contact-messages">
            Contact messages
          </Button>
        }
      />
      {statusMutation.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getContactErrorMessage(statusMutation.error)}
        </Alert>
      ) : null}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { sm: 'center' },
            }}
          >
            {isAdmin ? (
              <TextField
                select
                label="Status"
                value={message.status}
                disabled={statusMutation.isPending}
                onChange={(event) =>
                  statusMutation.mutate(
                    event.target.value as ContactMessageStatus,
                  )
                }
                sx={{ minWidth: 200 }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <ContactStatusChip status={message.status} />
            )}
          </Stack>
          <div>
            <Typography variant="caption" color="text.secondary">
              Name
            </Typography>
            <Typography>{message.name}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography>{message.email}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Subject
            </Typography>
            <Typography>{message.subject ?? 'Not provided'}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Message
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Received
            </Typography>
            <Typography>{formatDate(message.createdAt)}</Typography>
          </div>
        </Stack>
      </Paper>
    </>
  );
};
