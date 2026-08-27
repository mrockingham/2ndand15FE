import AddRounded from '@mui/icons-material/AddRounded';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import {
  formatAdminDateTime,
  gameStatusLabel,
  seasonTypeLabel,
} from '@/features/admin/format';
import { AutomaticHighlightPreview } from '@/features/gameMedia/components/AutomaticHighlightPreview';
import { CuratedVideoCard } from '@/features/gameMedia/components/CuratedVideoCard';
import { CuratedVideoForm } from '@/features/gameMedia/components/CuratedVideoForm';
import { DisplayModeBadge } from '@/features/gameMedia/components/DisplayModeBadge';
import { RemoveCuratedVideoDialog } from '@/features/gameMedia/components/RemoveCuratedVideoDialog';
import { getGameMediaErrorMessage } from '@/features/gameMedia/errors';
import {
  canAddCuratedVideo,
  MAX_CURATED_VIDEOS,
  moveVideoOrder,
  sortByPosition,
} from '@/features/gameMedia/presentation';
import {
  useAdminGameMediaDetailQuery,
  useCreateCuratedVideoMutation,
  useDeleteCuratedVideoMutation,
  useReorderCuratedVideosMutation,
  useUpdateCuratedVideoMutation,
} from '@/features/gameMedia/queries';
import type { CuratedVideo } from '@/features/gameMedia/types';
import { useCurrentUserQuery } from '@/features/users/queries';

type FormMode =
  | { readonly kind: 'add' }
  | { readonly kind: 'edit'; readonly video: CuratedVideo };

const isKnownStatus = (
  status: string,
): status is keyof typeof gameStatusLabel => status in gameStatusLabel;

const CreateVideoForm = ({
  gameId,
  onClose,
}: {
  readonly gameId: string;
  readonly onClose: () => void;
}) => {
  const create = useCreateCuratedVideoMutation(gameId);
  return (
    <CuratedVideoForm
      error={create.error}
      isSubmitting={create.isPending}
      onCancel={onClose}
      onSubmit={async (input) => {
        await create.mutateAsync(input);
        onClose();
      }}
    />
  );
};

const EditVideoForm = ({
  gameId,
  video,
  onClose,
}: {
  readonly gameId: string;
  readonly video: CuratedVideo;
  readonly onClose: () => void;
}) => {
  const update = useUpdateCuratedVideoMutation(gameId, video.id);
  return (
    <CuratedVideoForm
      video={video}
      error={update.error}
      isSubmitting={update.isPending}
      onCancel={onClose}
      onSubmit={async (input) => {
        await update.mutateAsync(input);
        onClose();
      }}
    />
  );
};

export const AdminGameMediaDetailPage = () => {
  const gameId = useParams().gameId ?? '';
  const query = useAdminGameMediaDetailQuery(gameId);
  const role = useCurrentUserQuery().data?.role;
  const isAdmin = role === 'ADMIN';

  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [removing, setRemoving] = useState<CuratedVideo | null>(null);

  const reorder = useReorderCuratedVideosMutation(gameId);
  const remove = useDeleteCuratedVideoMutation(gameId, removing?.id ?? '');

  if (query.isPending) return <AdminLoading label="Loading game media" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );

  const detail = query.data;
  const game = detail.game;
  const videos = sortByPosition(detail.curatedVideos);
  const orderedIds = videos.map((video) => video.id);

  const move = (video: CuratedVideo, direction: 'up' | 'down') => {
    const next = moveVideoOrder(orderedIds, video.id, direction);
    if (next === null) return;
    reorder.mutate({ orderedVideoIds: next });
  };

  const weekLabel =
    game.week === null
      ? seasonTypeLabel[game.seasonType]
      : `${seasonTypeLabel[game.seasonType]} · Week ${game.week}`;
  const statusLabel = isKnownStatus(game.status)
    ? gameStatusLabel[game.status]
    : game.status;

  return (
    <>
      <AdminPageHeader
        title={`${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`}
        description={`${weekLabel} · ${statusLabel} · ${formatAdminDateTime(game.startTime)}`}
        action={
          <Button component={RouterLink} to="/admin/game-media">
            All games
          </Button>
        }
      />
      {reorder.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getGameMediaErrorMessage(reorder.error)}
        </Alert>
      ) : null}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography component="h2" variant="h5">
            Curated videos
          </Typography>
          <DisplayModeBadge displayMode={detail.displayMode} />
        </Stack>
        <Typography color="text.secondary">
          {videos.length} / {MAX_CURATED_VIDEOS} videos
        </Typography>
      </Stack>

      {videos.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">No curated videos</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Game Center is currently using automatic media when available.
          </Typography>
          {isAdmin ? (
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setFormMode({ kind: 'add' })}
            >
              Add Video
            </Button>
          ) : null}
        </Box>
      ) : (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {videos.map((video, index) => (
            <CuratedVideoCard
              key={video.id}
              video={video}
              index={index}
              total={videos.length}
              isAdmin={isAdmin}
              isReordering={reorder.isPending}
              onEdit={() => setFormMode({ kind: 'edit', video })}
              onRemove={() => setRemoving(video)}
              onMoveUp={() => move(video, 'up')}
              onMoveDown={() => move(video, 'down')}
            />
          ))}
          {isAdmin && canAddCuratedVideo(videos.length) ? (
            <Button
              variant="outlined"
              startIcon={<AddRounded />}
              onClick={() => setFormMode({ kind: 'add' })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Video
            </Button>
          ) : null}
        </Stack>
      )}

      <Box sx={{ mt: 5 }}>
        <Typography component="h2" variant="h5" sx={{ mb: 1.5 }}>
          Automatic highlight
        </Typography>
        <AutomaticHighlightPreview
          automaticHighlightCount={game.automaticHighlightCount}
          displayMode={detail.displayMode}
        />
      </Box>

      {detail.globalVideo ? (
        <Box sx={{ mt: 3 }}>
          <Typography color="text.secondary">
            {detail.displayMode === 'GLOBAL'
              ? `Global video "${detail.globalVideo.title}" is primary here because this game has no curated or automatic media.`
              : `Global video "${detail.globalVideo.title}" is active and appears as a secondary video on this game's Game Center.`}{' '}
            Manage it from the{' '}
            <RouterLink to="/admin/game-media">Game Media</RouterLink> page.
          </Typography>
        </Box>
      ) : null}

      <Dialog
        open={formMode !== null}
        onClose={() => setFormMode(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="curated-video-form-title"
      >
        <DialogTitle id="curated-video-form-title">
          {formMode?.kind === 'edit' ? 'Edit video' : 'Add video'}
        </DialogTitle>
        <DialogContent>
          {formMode?.kind === 'add' ? (
            <CreateVideoForm
              gameId={gameId}
              onClose={() => setFormMode(null)}
            />
          ) : null}
          {formMode?.kind === 'edit' ? (
            <EditVideoForm
              gameId={gameId}
              video={formMode.video}
              onClose={() => setFormMode(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <RemoveCuratedVideoDialog
        video={removing}
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          remove.mutate(undefined, { onSuccess: () => setRemoving(null) });
        }}
      />
    </>
  );
};
