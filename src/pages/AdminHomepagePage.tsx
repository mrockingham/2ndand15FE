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
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { getHomepageErrorMessage } from '@/features/homepage/errors';
import { moveOrder, sortByPosition } from '@/features/homepage/presentation';
import {
  useAdminHeroSlidesQuery,
  useAdminTopStoriesQuery,
  useDeleteHeroSlideMutation,
  useReorderHeroSlidesMutation,
  useReorderTopStoriesMutation,
  useUnmarkTopStoryMutation,
  useUpdateHeroSlideMutation,
} from '@/features/homepage/queries';
import { MAX_HERO_SLIDES, MAX_TOP_STORIES } from '@/features/homepage/types';
import type { AdminHeroSlide, AdminTopStory } from '@/features/homepage/types';

const heroSlideTextPreview = (slide: AdminHeroSlide) => {
  for (const block of slide.contentBlocks) {
    const text = block.content.children
      .flatMap((child) => child.children)
      .map((inline) =>
        inline.type === 'text' ? inline.text : (inline.children[0]?.text ?? ''),
      )
      .join(' ')
      .trim();
    if (text !== '') return text;
  }
  return 'No text yet';
};

const HeroSlideRow = ({
  slide,
  index,
  total,
  isReordering,
  onMoveUp,
  onMoveDown,
  onRequestDelete,
}: {
  readonly slide: AdminHeroSlide;
  readonly index: number;
  readonly total: number;
  readonly isReordering: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onRequestDelete: () => void;
}) => {
  const update = useUpdateHeroSlideMutation(slide.id);
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box
          component="img"
          src={slide.imageUrl}
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
            <Chip
              size="small"
              color={slide.isActive ? 'success' : 'default'}
              label={slide.isActive ? 'Active' : 'Inactive'}
            />
          </Stack>
          <Typography noWrap>{heroSlideTextPreview(slide)}</Typography>
          {update.error ? (
            <Alert severity="error" sx={{ py: 0 }}>
              {getHomepageErrorMessage(update.error)}
            </Alert>
          ) : null}
        </Stack>
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={1}
          sx={{ flexShrink: 0 }}
        >
          <Button
            component={RouterLink}
            to={`/admin/homepage/hero/${slide.id}`}
            size="small"
          >
            Edit
          </Button>
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                size="small"
                checked={slide.isActive}
                disabled={update.isPending}
                onChange={(event) =>
                  update.mutate({ isActive: event.target.checked })
                }
              />
            }
            label={slide.isActive ? 'Disable' : 'Enable'}
          />
        </Stack>
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          <IconButton
            aria-label={`Move slide ${String(index + 1)} up`}
            size="small"
            disabled={index === 0 || isReordering}
            onClick={onMoveUp}
          >
            <ArrowUpwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Move slide ${String(index + 1)} down`}
            size="small"
            disabled={index === total - 1 || isReordering}
            onClick={onMoveDown}
          >
            <ArrowDownwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Delete slide ${String(index + 1)}`}
            size="small"
            onClick={onRequestDelete}
          >
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

const DeleteHeroSlideDialog = ({
  slide,
  onClose,
}: {
  readonly slide: AdminHeroSlide | null;
  readonly onClose: () => void;
}) => {
  const remove = useDeleteHeroSlideMutation(slide?.id ?? '');
  return (
    <Dialog
      open={slide !== null}
      onClose={remove.isPending ? undefined : onClose}
    >
      <DialogTitle>Delete Hero slide?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This removes the slide from the homepage carousel. It does not delete
          the externally hosted image.
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
          onClick={() => remove.mutate(undefined, { onSuccess: onClose })}
        >
          {remove.isPending ? 'Deleting…' : 'Delete slide'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const HeroCarouselSection = () => {
  const query = useAdminHeroSlidesQuery();
  const reorder = useReorderHeroSlidesMutation();
  const [deleting, setDeleting] = useState<AdminHeroSlide | null>(null);

  if (query.isPending) return <AdminLoading label="Loading Hero slides" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );

  const slides = sortByPosition(query.data.slides);
  const orderedIds = slides.map((slide) => slide.id);
  const move = (slide: AdminHeroSlide, direction: 'up' | 'down') => {
    const next = moveOrder(orderedIds, slide.id, direction);
    if (next === null) return;
    reorder.mutate({ slideIds: next });
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
            Hero Carousel
          </Typography>
          <Typography color="text.secondary">
            {query.data.meta.totalCount} / {MAX_HERO_SLIDES} slides ·{' '}
            {query.data.meta.readyForPublish
              ? 'Ready to publish'
              : `Needs ${String(3 - query.data.meta.activeCount)} more active slide${
                  3 - query.data.meta.activeCount === 1 ? '' : 's'
                }`}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/admin/homepage/hero/new"
          variant="contained"
          startIcon={<AddRounded />}
          disabled={slides.length >= MAX_HERO_SLIDES}
        >
          Add Slide
        </Button>
      </Stack>
      {reorder.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getHomepageErrorMessage(reorder.error)}
        </Alert>
      ) : null}
      {slides.length === 0 ? (
        <AdminEmpty
          title="No Hero slides yet"
          description="Home is showing the built-in static Hero until at least one slide is added."
        />
      ) : (
        <Stack spacing={1.5}>
          {slides.map((slide, index) => (
            <HeroSlideRow
              key={slide.id}
              slide={slide}
              index={index}
              total={slides.length}
              isReordering={reorder.isPending}
              onMoveUp={() => move(slide, 'up')}
              onMoveDown={() => move(slide, 'down')}
              onRequestDelete={() => setDeleting(slide)}
            />
          ))}
        </Stack>
      )}
      <DeleteHeroSlideDialog
        slide={deleting}
        onClose={() => setDeleting(null)}
      />
    </Box>
  );
};

const TopStoryRow = ({
  story,
  index,
  total,
  isReordering,
  onMoveUp,
  onMoveDown,
}: {
  readonly story: AdminTopStory;
  readonly index: number;
  readonly total: number;
  readonly isReordering: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
}) => {
  const unmark = useUnmarkTopStoryMutation();
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ width: 24 }}
        >
          {index === 0 ? 'Lead' : index + 1}
        </Typography>
        <Typography noWrap sx={{ flex: 1 }}>
          {story.article.title}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label={`Move ${story.article.title} up`}
            size="small"
            disabled={index === 0 || isReordering}
            onClick={onMoveUp}
          >
            <ArrowUpwardRounded fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={`Move ${story.article.title} down`}
            size="small"
            disabled={index === total - 1 || isReordering}
            onClick={onMoveDown}
          >
            <ArrowDownwardRounded fontSize="small" />
          </IconButton>
          <Button
            size="small"
            color="error"
            disabled={unmark.isPending}
            onClick={() => unmark.mutate(story.article.id)}
          >
            Remove
          </Button>
        </Stack>
      </Stack>
      {unmark.error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {getHomepageErrorMessage(unmark.error)}
        </Alert>
      ) : null}
    </Card>
  );
};

const TopStoriesSection = () => {
  const query = useAdminTopStoriesQuery();
  const reorder = useReorderTopStoriesMutation();

  if (query.isPending) return <AdminLoading label="Loading Top Stories" />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );

  const stories = sortByPosition(query.data);
  const orderedIds = stories.map((story) => story.article.id);
  const move = (story: AdminTopStory, direction: 'up' | 'down') => {
    const next = moveOrder(orderedIds, story.article.id, direction);
    if (next === null) return;
    reorder.mutate({ articleIds: next });
  };

  return (
    <Box component="section">
      <Box sx={{ mb: 2 }}>
        <Typography component="h2" variant="h5">
          Top Stories
        </Typography>
        <Typography color="text.secondary">
          {stories.length} / {MAX_TOP_STORIES} selected · Mark or unmark stories
          from <RouterLink to="/admin/articles">Articles</RouterLink>. Removing
          a story here does not delete or unpublish it.
        </Typography>
      </Box>
      {reorder.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getHomepageErrorMessage(reorder.error)}
        </Alert>
      ) : null}
      {stories.length === 0 ? (
        <AdminEmpty
          title="No Top Stories selected"
          description="Mark up to six articles as Top Stories from the Articles admin list."
        />
      ) : (
        <Stack spacing={1.5}>
          {stories.map((story, index) => (
            <TopStoryRow
              key={story.id}
              story={story}
              index={index}
              total={stories.length}
              isReordering={reorder.isPending}
              onMoveUp={() => move(story, 'up')}
              onMoveDown={() => move(story, 'down')}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export const AdminHomepagePage = () => (
  <>
    <AdminPageHeader
      title="Homepage"
      description="Manage the public Home Hero carousel and Top Stories."
    />
    <Stack spacing={5}>
      <HeroCarouselSection />
      <TopStoriesSection />
    </Stack>
  </>
);
