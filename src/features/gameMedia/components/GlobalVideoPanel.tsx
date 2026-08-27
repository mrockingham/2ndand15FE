import AddRounded from '@mui/icons-material/AddRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import LaunchRounded from '@mui/icons-material/LaunchRounded';
import MovieRounded from '@mui/icons-material/MovieRounded';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { CuratedVideoForm } from '@/features/gameMedia/components/CuratedVideoForm';
import { RemoveGlobalVideoDialog } from '@/features/gameMedia/components/RemoveGlobalVideoDialog';
import {
  useDeleteGlobalVideoMutation,
  useGlobalVideoQuery,
  useSaveGlobalVideoMutation,
} from '@/features/gameMedia/queries';

export const GlobalVideoPanel = ({
  isAdmin,
}: {
  readonly isAdmin: boolean;
}) => {
  const query = useGlobalVideoQuery();
  const save = useSaveGlobalVideoMutation();
  const remove = useDeleteGlobalVideoMutation();
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 0.5 }}>
        Global Game Center Video
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Shown on every Game Center: first when no game-specific media exists,
        second when other media exists.
      </Typography>

      {query.isPending ? <AdminLoading label="Loading global video" /> : null}
      {query.isError ? (
        <AdminError error={query.error} onRetry={() => void query.refetch()} />
      ) : null}

      {!query.isPending && !query.isError && query.data === null ? (
        <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Typography color="text.secondary">
            No global video configured.
          </Typography>
          {isAdmin ? (
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setEditing(true)}
            >
              Add Global Video
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {!query.isPending && !query.isError && query.data ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box
            sx={{
              width: { xs: '100%', sm: 200 },
              aspectRatio: '16 / 9',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {query.data.thumbnailUrl ? (
              <Box
                component="img"
                src={query.data.thumbnailUrl}
                alt={query.data.title}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <MovieRounded
                aria-hidden
                color="disabled"
                sx={{ fontSize: 32 }}
              />
            )}
          </Box>
          <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>{query.data.title}</Typography>
            {query.data.sourceLabel ? (
              <Typography variant="body2" color="text.secondary">
                {query.data.sourceLabel}
              </Typography>
            ) : null}
            {query.data.canonicalUrl ? (
              <Link
                href={query.data.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  alignSelf: 'flex-start',
                }}
              >
                Watch on YouTube
                <LaunchRounded fontSize="inherit" />
              </Link>
            ) : null}
            {isAdmin ? (
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<EditRounded />}
                  onClick={() => setEditing(true)}
                >
                  Edit Global Video
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => setRemoving(true)}
                >
                  Remove
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="global-video-form-title"
      >
        <DialogTitle id="global-video-form-title">
          {query.data ? 'Edit global video' : 'Add global video'}
        </DialogTitle>
        <DialogContent>
          <CuratedVideoForm
            video={query.data ?? undefined}
            itemLabel="global video"
            error={save.error}
            isSubmitting={save.isPending}
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              await save.mutateAsync(input);
              setEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <RemoveGlobalVideoDialog
        open={removing}
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setRemoving(false)}
        onConfirm={() => {
          remove.mutate(undefined, { onSuccess: () => setRemoving(false) });
        }}
      />
    </Paper>
  );
};
