import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Paper, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { YoutubeEmbedChecker } from '@/features/gameMedia/components/YoutubeEmbedChecker';
import { getGameMediaErrorMessage } from '@/features/gameMedia/errors';
import {
  curatedVideoFormSchema,
  type CuratedVideoFormValues,
} from '@/features/gameMedia/schemas';
import type {
  CuratedVideo,
  CuratedVideoInput,
} from '@/features/gameMedia/types';

const defaults = (video?: CuratedVideo): CuratedVideoFormValues => ({
  title: video?.title ?? '',
  embedUrl: video?.embedUrl ?? '',
  canonicalUrl: video?.canonicalUrl ?? '',
  thumbnailUrl: video?.thumbnailUrl ?? '',
  sourceLabel: video?.sourceLabel ?? '',
});

const toInput = (values: CuratedVideoFormValues): CuratedVideoInput => ({
  title: values.title.trim(),
  embedUrl: values.embedUrl.trim(),
  ...(values.canonicalUrl !== '' ? { canonicalUrl: values.canonicalUrl } : {}),
  ...(values.thumbnailUrl !== '' ? { thumbnailUrl: values.thumbnailUrl } : {}),
  ...(values.sourceLabel !== ''
    ? { sourceLabel: values.sourceLabel.trim() }
    : {}),
});

export const CuratedVideoForm = ({
  video,
  error,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  readonly video?: CuratedVideo;
  readonly error?: unknown;
  readonly isSubmitting: boolean;
  readonly onSubmit: (input: CuratedVideoInput) => Promise<void> | void;
  readonly onCancel: () => void;
}) => {
  const form = useForm<CuratedVideoFormValues>({
    resolver: zodResolver(curatedVideoFormSchema),
    defaultValues: defaults(video),
  });
  const submit = form.handleSubmit(async (values) => {
    await onSubmit(toInput(values));
  });

  return (
    <Paper
      component="form"
      noValidate
      variant="outlined"
      onSubmit={(event) => void submit(event)}
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={2.5}>
        {error ? (
          <Alert severity="error">{getGameMediaErrorMessage(error)}</Alert>
        ) : null}
        <YoutubeEmbedChecker
          onUseVideo={(result) => {
            form.setValue('embedUrl', result.embedUrl, {
              shouldDirty: true,
              shouldValidate: true,
            });
            form.setValue('canonicalUrl', result.canonicalUrl, {
              shouldDirty: true,
              shouldValidate: true,
            });
            if (result.thumbnailUrl !== null) {
              form.setValue('thumbnailUrl', result.thumbnailUrl, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
            if (result.title !== null && form.getValues('title') === '') {
              form.setValue('title', result.title, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          }}
        />
        <TextField
          required
          label="Title"
          error={Boolean(form.formState.errors.title)}
          helperText={form.formState.errors.title?.message}
          {...form.register('title')}
        />
        <TextField
          required
          label="Embed URL"
          type="url"
          error={Boolean(form.formState.errors.embedUrl)}
          helperText={
            form.formState.errors.embedUrl?.message ??
            'Paste the embed URL, not the iframe code. Example: https://www.youtube.com/embed/...'
          }
          {...form.register('embedUrl')}
        />
        <TextField
          label="Canonical URL"
          type="url"
          error={Boolean(form.formState.errors.canonicalUrl)}
          helperText={
            form.formState.errors.canonicalUrl?.message ??
            'Optional link shown as "Watch on YouTube ↗".'
          }
          {...form.register('canonicalUrl')}
        />
        <TextField
          label="Thumbnail URL"
          type="url"
          error={Boolean(form.formState.errors.thumbnailUrl)}
          helperText={form.formState.errors.thumbnailUrl?.message}
          {...form.register('thumbnailUrl')}
        />
        <TextField
          label="Source label"
          error={Boolean(form.formState.errors.sourceLabel)}
          helperText={form.formState.errors.sourceLabel?.message}
          {...form.register('sourceLabel')}
        />
        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : video ? 'Save video' : 'Add video'}
          </Button>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </Stack>
      </Stack>
      <UnsavedChangesDialog dirty={form.formState.isDirty && !isSubmitting} />
    </Paper>
  );
};
