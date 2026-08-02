import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AuditEventList } from '@/features/admin/components/AuditEventList';
import { useAuditEventsQuery } from '@/features/admin/queries';

export const AdminAuditPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [action, setAction] = useState(searchParams.get('action') ?? '');
  const [entityType, setEntityType] = useState(
    searchParams.get('entityType') ?? '',
  );
  const [entityId, setEntityId] = useState(searchParams.get('entityId') ?? '');
  const cursor = searchParams.get('cursor') ?? undefined;
  const filters = {
    limit: 50,
    cursor,
    action: searchParams.get('action') || undefined,
    entityType: searchParams.get('entityType') || undefined,
    entityId: searchParams.get('entityId') || undefined,
  };
  const query = useAuditEventsQuery(filters);
  const applyFilters = () => {
    const next = new URLSearchParams();
    if (action.trim()) next.set('action', action.trim());
    if (entityType.trim()) next.set('entityType', entityType.trim());
    if (entityId.trim()) next.set('entityId', entityId.trim());
    setSearchParams(next);
  };
  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Administrative schedule changes with sanitized before-and-after differences. Complete audit access is restricted to administrators."
      />
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          />
          <TextField
            fullWidth
            select
            label="Entity type"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
          >
            <MenuItem value="">All types</MenuItem>
            <MenuItem value="GAME">Game</MenuItem>
            <MenuItem value="SCHEDULE_IMPORT">Schedule import</MenuItem>
            <MenuItem value="USER">User</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Entity ID"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
          />
          <Button variant="contained" onClick={applyFilters}>
            Apply filters
          </Button>
        </Stack>
      </Paper>
      {query.isPending ? <AdminLoading label="Loading audit events" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}
      {query.data?.events.length === 0 ? (
        <AdminEmpty
          title="No audit events"
          description="No events match these filters."
        />
      ) : null}
      {query.data?.events ? (
        <AuditEventList events={query.data.events} />
      ) : null}
      {query.data?.nextCursor ? (
        <Button
          sx={{ mt: 2 }}
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.set('cursor', query.data.nextCursor ?? '');
            setSearchParams(next);
          }}
        >
          Next page
        </Button>
      ) : null}
    </>
  );
};
