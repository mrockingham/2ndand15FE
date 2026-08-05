import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';

import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { getNewsInboxErrorMessage } from '@/features/newsInbox/errors';
import {
  sourceFormSchema,
  type SourceFormValues,
} from '@/features/newsInbox/schemas';
import type {
  NewsSource,
  NewsSourceInput,
  NewsSourceUpdateInput,
} from '@/features/newsInbox/types';
import { useTeamsQuery } from '@/features/teams/queries';

const nullable = (value: string) => (value.trim() === '' ? null : value.trim());

const defaults = (source?: NewsSource): SourceFormValues => ({
  name: source?.name ?? '',
  slug: source?.slug ?? '',
  kind: source?.kind ?? 'RSS',
  status: source?.status === 'ERROR' ? 'PAUSED' : (source?.status ?? 'PAUSED'),
  feedUrl: source?.feedUrl ?? '',
  siteUrl: source?.siteUrl ?? '',
  publisherName: source?.publisherName ?? '',
  defaultTeamId: source?.defaultTeam?.id ?? '',
  isOfficialLeague: source?.isOfficialLeague ?? false,
  isOfficialTeam: source?.isOfficialTeam ?? false,
  allowsDescriptionUse: source?.allowsDescriptionUse ?? false,
  notes: source?.notes ?? '',
});

const toInput = (values: SourceFormValues): NewsSourceInput => ({
  name: values.name.trim(),
  slug: values.slug.trim(),
  kind: values.kind,
  status: values.status,
  feedUrl: nullable(values.feedUrl),
  siteUrl: values.siteUrl.trim(),
  publisherName: values.publisherName.trim(),
  defaultTeamId: values.defaultTeamId || null,
  isOfficialLeague: values.isOfficialLeague,
  isOfficialTeam: values.isOfficialTeam,
  allowsDescriptionUse: values.allowsDescriptionUse,
  notes: nullable(values.notes),
});

const withoutStatus = ({
  status,
  ...input
}: NewsSourceInput): NewsSourceUpdateInput => {
  void status;
  return input;
};

interface SourceFormProps {
  readonly source?: NewsSource;
  readonly error?: unknown;
  readonly isSubmitting: boolean;
  readonly onSubmit: (
    input: NewsSourceInput | NewsSourceUpdateInput,
  ) => Promise<void> | void;
}

export const SourceForm = ({
  source,
  error,
  isSubmitting,
  onSubmit,
}: SourceFormProps) => {
  const teams = useTeamsQuery();
  const form = useForm<SourceFormValues>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: defaults(source),
  });
  const [pendingFeedChange, setPendingFeedChange] = useState<
    NewsSourceInput | NewsSourceUpdateInput | null
  >(null);
  const values = useWatch({ control: form.control });
  const submit = form.handleSubmit(async (formValues) => {
    const fullInput = toInput(formValues);
    const input: NewsSourceInput | NewsSourceUpdateInput =
      source?.status === 'ERROR' && !form.formState.dirtyFields.status
        ? withoutStatus(fullInput)
        : fullInput;
    if (source?.feedUrl !== undefined && source.feedUrl !== input.feedUrl) {
      setPendingFeedChange(input);
      return;
    }
    await onSubmit(input);
  });

  return (
    <>
      <Paper
        component="form"
        noValidate
        variant="outlined"
        onSubmit={(event) => void submit(event)}
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Stack spacing={2.5}>
          {error ? (
            <Alert severity="error">{getNewsInboxErrorMessage(error)}</Alert>
          ) : null}
          <Alert severity="info">
            RSS and Atom URLs must be tested before ingestion. A website URL is
            never used to infer a feed URL.
          </Alert>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Source name"
              error={Boolean(form.formState.errors.name)}
              helperText={form.formState.errors.name?.message}
              {...form.register('name')}
            />
            <TextField
              fullWidth
              required
              label="Slug"
              error={Boolean(form.formState.errors.slug)}
              helperText={form.formState.errors.slug?.message}
              {...form.register('slug')}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              name="kind"
              control={form.control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="source-kind-label">Kind</InputLabel>
                  <Select {...field} labelId="source-kind-label" label="Kind">
                    <MenuItem value="RSS">RSS</MenuItem>
                    <MenuItem value="ATOM">Atom</MenuItem>
                    <MenuItem value="MANUAL_ONLY">Manual only</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="source-form-status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="source-form-status-label"
                    label="Status"
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PAUSED">Paused</MenuItem>
                    <MenuItem value="DISABLED">Disabled</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
          <TextField
            required={values.kind !== 'MANUAL_ONLY'}
            disabled={values.kind === 'MANUAL_ONLY'}
            label="Feed URL"
            type="url"
            error={Boolean(form.formState.errors.feedUrl)}
            helperText={
              form.formState.errors.feedUrl?.message ??
              'Public HTTP/HTTPS only; no credentials or private-network addresses.'
            }
            {...form.register('feedUrl')}
          />
          <TextField
            required
            label="Publisher website URL"
            type="url"
            error={Boolean(form.formState.errors.siteUrl)}
            helperText={form.formState.errors.siteUrl?.message}
            {...form.register('siteUrl')}
          />
          <TextField
            required
            label="Publisher name"
            error={Boolean(form.formState.errors.publisherName)}
            helperText={form.formState.errors.publisherName?.message}
            {...form.register('publisherName')}
          />
          <Controller
            name="defaultTeamId"
            control={form.control}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={Boolean(form.formState.errors.defaultTeamId)}
              >
                <InputLabel id="source-default-team-label">
                  Default team
                </InputLabel>
                <Select
                  {...field}
                  labelId="source-default-team-label"
                  label="Default team"
                  disabled={teams.isPending}
                >
                  <MenuItem value="">No default team</MenuItem>
                  {teams.data?.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.abbreviation} — {team.fullName}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {form.formState.errors.defaultTeamId?.message ??
                    'Uses an internal active-team UUID.'}
                </FormHelperText>
              </FormControl>
            )}
          />
          <Stack>
            <Controller
              name="isOfficialLeague"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="Official league source"
                />
              )}
            />
            <Controller
              name="isOfficialTeam"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="Official team source"
                />
              )}
            />
            <Controller
              name="allowsDescriptionUse"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="Publisher permits description use"
                />
              )}
            />
          </Stack>
          <TextField
            label="Internal usage notes"
            multiline
            minRows={3}
            error={Boolean(form.formState.errors.notes)}
            helperText={
              form.formState.errors.notes?.message ??
              `${values.notes?.length ?? 0}/1000`
            }
            {...form.register('notes')}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || teams.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isSubmitting
              ? 'Saving…'
              : source
                ? 'Save source'
                : 'Create source'}
          </Button>
        </Stack>
        <UnsavedChangesDialog dirty={form.formState.isDirty && !isSubmitting} />
      </Paper>
      <Dialog
        open={pendingFeedChange !== null}
        onClose={() => setPendingFeedChange(null)}
        aria-labelledby="feed-change-title"
      >
        <DialogTitle id="feed-change-title">Change the feed URL?</DialogTitle>
        <DialogContent>
          <Typography>
            This changes where a live source fetches metadata. Test the new URL
            before the next ingestion.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingFeedChange(null)}>Cancel</Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => {
              const input = pendingFeedChange;
              setPendingFeedChange(null);
              if (input) void onSubmit(input);
            }}
          >
            Confirm feed change
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
