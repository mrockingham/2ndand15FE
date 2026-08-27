import AddRounded from '@mui/icons-material/AddRounded';
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { getHomepageErrorMessage } from '@/features/homepage/errors';
import { moveOrder, sortByPosition } from '@/features/homepage/presentation';
import {
  useAddHighlightPlacementMutation,
  useAdminHighlightsQuery,
  useDeleteHighlightPlacementMutation,
  useHighlightCandidatesQuery,
  useReorderHighlightPlacementsMutation,
  useUpdateHighlightSettingsMutation,
} from '@/features/homepage/queries';
import {
  MAX_HOMEPAGE_HIGHLIGHT_PLACEMENTS,
  MAX_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT,
  MIN_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT,
  type AdminHomepageHighlight,
  type HighlightSourceType,
  type HomepageHighlightCandidate,
} from '@/features/homepage/types';

const sourceTypeLabel: Readonly<Record<HighlightSourceType, string>> = {
  GAME_HIGHLIGHT: 'Game Highlight',
  CURATED_GAME_VIDEO: 'Game Video',
};

const HighlightRow = ({
  highlight,
  index,
  total,
  isReordering,
  onMoveUp,
  onMoveDown,
  onRequestRemove,
}: {
  readonly highlight: AdminHomepageHighlight;
  readonly index: number;
  readonly total: number;
  readonly isReordering: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onRequestRemove: () => void;
}) => {
  const matchup = `${highlight.matchup.awayTeam.abbreviation} vs ${highlight.matchup.homeTeam.abbreviation}`;
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box
          component="img"
          src={highlight.preview?.thumbnailUrl ?? undefined}
          alt=""
          sx={{
            width: { xs: '100%', sm: 140 },
            height: 90,
            objectFit: 'cover',
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        />
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="overline" color="text.secondary">
              #{index + 1}
            </Typography>
            <Chip size="small" label={sourceTypeLabel[highlight.sourceType]} />
          </Stack>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {matchup}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {highlight.preview?.title ?? 'Media unavailable'}
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          <IconButton
            aria-label={`Move highlight ${String(index + 1)} up`}
            size="small"
            disabled={index === 0 || isReordering}
            onClick={onMoveUp}
          >
            <ArrowUpwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Move highlight ${String(index + 1)} down`}
            size="small"
            disabled={index === total - 1 || isReordering}
            onClick={onMoveDown}
          >
            <ArrowDownwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Remove highlight ${String(index + 1)}`}
            size="small"
            onClick={onRequestRemove}
          >
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

const RemoveHighlightDialog = ({
  highlight,
  onClose,
}: {
  readonly highlight: AdminHomepageHighlight | null;
  readonly onClose: () => void;
}) => {
  const remove = useDeleteHighlightPlacementMutation();
  return (
    <Dialog
      open={highlight !== null}
      onClose={remove.isPending ? undefined : onClose}
    >
      <DialogTitle>Remove this highlight from the Homepage?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The original Game Center media will remain unchanged.
        </DialogContentText>
        {remove.error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getHomepageErrorMessage(remove.error)}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={remove.isPending}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={remove.isPending}
          onClick={() =>
            highlight && remove.mutate(highlight.id, { onSuccess: onClose })
          }
        >
          {remove.isPending ? 'Removing…' : 'Remove'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CandidateRow = ({
  candidate,
  atCap,
}: {
  readonly candidate: HomepageHighlightCandidate;
  readonly atCap: boolean;
}) => {
  const add = useAddHighlightPlacementMutation();
  const matchup = `${candidate.matchup.awayTeam.abbreviation} vs ${candidate.matchup.homeTeam.abbreviation}`;
  return (
    <Card sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          component="img"
          src={candidate.thumbnailUrl ?? undefined}
          alt=""
          sx={{
            width: 100,
            height: 64,
            objectFit: 'cover',
            borderRadius: 1,
            bgcolor: 'action.hover',
            flexShrink: 0,
          }}
        />
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {matchup}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {candidate.title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={sourceTypeLabel[candidate.sourceType]} />
            {candidate.gameDate ? (
              <Typography variant="caption" color="text.secondary">
                {new Date(candidate.gameDate).toLocaleDateString()}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        <Button
          size="small"
          variant={candidate.isSelected ? 'outlined' : 'contained'}
          disabled={
            candidate.isSelected ||
            add.isPending ||
            (atCap && !candidate.isSelected)
          }
          onClick={() =>
            add.mutate({
              sourceType: candidate.sourceType,
              sourceId: candidate.sourceId,
            })
          }
        >
          {candidate.isSelected ? 'Added' : 'Add'}
        </Button>
      </Stack>
      {add.error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {getHomepageErrorMessage(add.error)}
        </Alert>
      ) : null}
    </Card>
  );
};

const AddHighlightDialog = ({
  open,
  onClose,
  atCap,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly atCap: boolean;
}) => {
  const [mediaType, setMediaType] = useState<HighlightSourceType | ''>('');
  const filters = {
    limit: 25,
    mediaType: mediaType === '' ? undefined : mediaType,
  };
  const query = useHighlightCandidatesQuery(filters);
  const candidates = query.data?.pages.flatMap((page) => page.candidates) ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Highlight</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            select
            label="Media type"
            size="small"
            value={mediaType}
            onChange={(event) =>
              setMediaType(event.target.value as HighlightSourceType | '')
            }
          >
            <MenuItem value="">All types</MenuItem>
            <MenuItem value="GAME_HIGHLIGHT">Game Highlight</MenuItem>
            <MenuItem value="CURATED_GAME_VIDEO">Game Video</MenuItem>
          </TextField>
          {atCap ? (
            <Alert severity="info">
              The homepage may have at most {MAX_HOMEPAGE_HIGHLIGHT_PLACEMENTS}{' '}
              curated highlights. Remove one to add another.
            </Alert>
          ) : null}
          {query.isPending ? <AdminLoading label="Loading candidates" /> : null}
          {query.isError ? (
            <AdminError
              error={query.error}
              onRetry={() => void query.refetch()}
            />
          ) : null}
          {!query.isPending && !query.isError && candidates.length === 0 ? (
            <AdminEmpty
              title="No candidates found"
              description="No eligible game media matches these filters."
            />
          ) : null}
          <Stack spacing={1.5}>
            {candidates.map((candidate) => (
              <CandidateRow
                key={`${candidate.sourceType}:${candidate.sourceId}`}
                candidate={candidate}
                atCap={atCap}
              />
            ))}
          </Stack>
          {query.hasNextPage ? (
            <Button
              variant="outlined"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </Button>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export const AdminHighlightsSection = () => {
  const query = useAdminHighlightsQuery();
  const reorder = useReorderHighlightPlacementsMutation();
  const settingsMutation = useUpdateHighlightSettingsMutation();
  const [removing, setRemoving] = useState<AdminHomepageHighlight | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [displayLimitDraft, setDisplayLimitDraft] = useState<string | null>(
    null,
  );

  if (query.isPending)
    return <AdminLoading label="Loading Homepage Highlights" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );

  const { placements, settings } = query.data;
  const sorted = sortByPosition(placements);
  const orderedIds = sorted.map((highlight) => highlight.id);
  const atCap = placements.length >= MAX_HOMEPAGE_HIGHLIGHT_PLACEMENTS;
  const move = (
    highlight: AdminHomepageHighlight,
    direction: 'up' | 'down',
  ) => {
    const next = moveOrder(orderedIds, highlight.id, direction);
    if (next === null) return;
    reorder.mutate({ placementIds: next });
  };
  const displayLimitValue = displayLimitDraft ?? String(settings.displayLimit);
  const commitDisplayLimit = () => {
    const parsed = Number(displayLimitDraft);
    if (
      displayLimitDraft !== null &&
      Number.isInteger(parsed) &&
      parsed >= MIN_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT &&
      parsed <= MAX_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT &&
      parsed !== settings.displayLimit
    ) {
      settingsMutation.mutate({ displayLimit: parsed });
    }
    setDisplayLimitDraft(null);
  };

  return (
    <Box component="section">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
          mb: 2,
        }}
      >
        <Box>
          <Typography component="h2" variant="h5">
            Homepage Highlights
          </Typography>
          <Typography color="text.secondary">
            {placements.length} / {MAX_HOMEPAGE_HIGHLIGHT_PLACEMENTS} curated
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          disabled={atCap}
          onClick={() => setPickerOpen(true)}
        >
          Add Highlight
        </Button>
      </Stack>
      <Card sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <TextField
            label="Number shown"
            type="number"
            size="small"
            value={displayLimitValue}
            onChange={(event) => setDisplayLimitDraft(event.target.value)}
            onBlur={commitDisplayLimit}
            disabled={settingsMutation.isPending}
            slotProps={{
              htmlInput: {
                min: MIN_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT,
                max: MAX_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT,
              },
            }}
            sx={{ width: 160 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.fillWithAutomatic}
                disabled={settingsMutation.isPending}
                onChange={(event) =>
                  settingsMutation.mutate({
                    fillWithAutomatic: event.target.checked,
                  })
                }
              />
            }
            label="Fill empty spots automatically"
          />
        </Stack>
        {settingsMutation.error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getHomepageErrorMessage(settingsMutation.error)}
          </Alert>
        ) : null}
      </Card>
      {reorder.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getHomepageErrorMessage(reorder.error)}
        </Alert>
      ) : null}
      {sorted.length === 0 ? (
        <AdminEmpty
          title="No curated highlights yet"
          description="Home shows automatically selected recent game media until highlights are curated here."
        />
      ) : (
        <Stack spacing={1.5}>
          {sorted.map((highlight, index) => (
            <HighlightRow
              key={highlight.id}
              highlight={highlight}
              index={index}
              total={sorted.length}
              isReordering={reorder.isPending}
              onMoveUp={() => move(highlight, 'up')}
              onMoveDown={() => move(highlight, 'down')}
              onRequestRemove={() => setRemoving(highlight)}
            />
          ))}
        </Stack>
      )}
      <RemoveHighlightDialog
        highlight={removing}
        onClose={() => setRemoving(null)}
      />
      <AddHighlightDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        atCap={atCap}
      />
    </Box>
  );
};
