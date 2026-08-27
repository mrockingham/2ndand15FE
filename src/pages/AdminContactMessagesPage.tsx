import {
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { ContactStatusChip } from '@/features/contact/components/ContactStatusChip';
import { useContactMessagesQuery } from '@/features/contact/queries';
import type { ContactMessageStatus } from '@/features/contact/types';

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
  }).format(parsed);
};

const previewOf = (message: string) =>
  message.length > 80 ? `${message.slice(0, 80)}…` : message;

export const AdminContactMessagesPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const statusValue = parameters.get('status') ?? '';
  const filters = {
    limit: 25,
    status: statuses.includes(statusValue as ContactMessageStatus)
      ? (statusValue as ContactMessageStatus)
      : undefined,
  };
  const query = useContactMessagesQuery(filters);
  const messages = query.data?.pages.flatMap((page) => page.messages) ?? [];
  const updateStatus = (value: string) => {
    const next = new URLSearchParams(parameters);
    if (value) next.set('status', value);
    else next.delete('status');
    setParameters(next);
  };

  return (
    <>
      <AdminPageHeader
        title="Contact messages"
        description="Review messages submitted through the public contact form."
      />
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <TextField
          select
          label="Status"
          value={statusValue}
          onChange={(event) => updateStatus(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Paper>
      {query.isPending ? (
        <AdminLoading label="Loading contact messages" />
      ) : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {!query.isPending && !query.isError && messages.length === 0 ? (
        <AdminEmpty
          title="No messages found"
          description="No contact messages match these filters."
        />
      ) : null}
      {messages.length ? (
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Contact messages">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Received</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  component={RouterLink}
                  to={`/admin/contact-messages/${message.id}`}
                  hover
                  sx={{ textDecoration: 'none' }}
                >
                  <TableCell>
                    <ContactStatusChip status={message.status} />
                  </TableCell>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>{message.subject ?? '—'}</TableCell>
                  <TableCell>{formatDate(message.createdAt)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {previewOf(message.message)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
      {query.hasNextPage ? (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load more messages'}
          </Button>
        </Box>
      ) : null}
    </>
  );
};
