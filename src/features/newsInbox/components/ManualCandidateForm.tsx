import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { getNewsInboxErrorMessage } from '@/features/newsInbox/errors';
import {
  manualCandidateFormSchema,
  type ManualCandidateFormValues,
} from '@/features/newsInbox/schemas';
import type {
  ManualCandidateInput,
  NewsSource,
} from '@/features/newsInbox/types';
import { useTeamsQuery } from '@/features/teams/queries';

const nullable = (value: string) => value.trim() || null;

export const ManualCandidateForm = ({
  sources,
  error,
  isSubmitting,
  onSubmit,
}: {
  readonly sources: readonly NewsSource[];
  readonly error?: unknown;
  readonly isSubmitting: boolean;
  readonly onSubmit: (input: ManualCandidateInput) => Promise<void> | void;
}) => {
  const teams = useTeamsQuery();
  const form = useForm<ManualCandidateFormValues>({
    resolver: zodResolver(manualCandidateFormSchema),
    defaultValues: {
      url: '',
      headline: '',
      sourceName: '',
      sourceId: '',
      sourceDescription: '',
      sourceAuthor: '',
      sourcePublishedAt: '',
      suggestedTeamIds: [],
    },
  });
  const submit = form.handleSubmit(async (values) =>
    onSubmit({
      url: values.url.trim(),
      headline: values.headline.trim(),
      sourceName: values.sourceName.trim(),
      sourceId: values.sourceId || null,
      sourceDescription: nullable(values.sourceDescription),
      sourceAuthor: nullable(values.sourceAuthor),
      sourcePublishedAt: values.sourcePublishedAt
        ? new Date(values.sourcePublishedAt).toISOString()
        : null,
      suggestedTeamIds: values.suggestedTeamIds,
    }),
  );
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
          <Alert severity="error">{getNewsInboxErrorMessage(error)}</Alert>
        ) : null}
        <Alert severity="info">
          Manual candidates enter the same review workflow as feed discoveries.
          Nothing is published automatically.
        </Alert>
        <TextField
          required
          label="Article URL"
          type="url"
          error={Boolean(form.formState.errors.url)}
          helperText={form.formState.errors.url?.message}
          {...form.register('url')}
        />
        <TextField
          required
          label="Headline"
          error={Boolean(form.formState.errors.headline)}
          helperText={form.formState.errors.headline?.message}
          {...form.register('headline')}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            required
            fullWidth
            label="Source name"
            error={Boolean(form.formState.errors.sourceName)}
            helperText={form.formState.errors.sourceName?.message}
            {...form.register('sourceName')}
          />
          <Controller
            name="sourceId"
            control={form.control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="manual-source-label">
                  Registered source
                </InputLabel>
                <Select
                  {...field}
                  labelId="manual-source-label"
                  label="Registered source"
                >
                  <MenuItem value="">No registered source</MenuItem>
                  {sources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Stack>
        <TextField
          label="Publisher description"
          multiline
          minRows={4}
          error={Boolean(form.formState.errors.sourceDescription)}
          helperText={
            form.formState.errors.sourceDescription?.message ??
            'Stored as source material; never treated as an original editorial summary.'
          }
          {...form.register('sourceDescription')}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Source author"
            error={Boolean(form.formState.errors.sourceAuthor)}
            helperText={form.formState.errors.sourceAuthor?.message}
            {...form.register('sourceAuthor')}
          />
          <TextField
            fullWidth
            label="Published at"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            error={Boolean(form.formState.errors.sourcePublishedAt)}
            helperText={form.formState.errors.sourcePublishedAt?.message}
            {...form.register('sourcePublishedAt')}
          />
        </Stack>
        <Controller
          name="suggestedTeamIds"
          control={form.control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="manual-teams-label">Suggested teams</InputLabel>
              <Select
                {...field}
                multiple
                labelId="manual-teams-label"
                label="Suggested teams"
                renderValue={(selected) =>
                  teams.data
                    ?.filter((team) => selected.includes(team.id))
                    .map((team) => team.abbreviation)
                    .join(', ') ?? ''
                }
              >
                {teams.data?.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    <Checkbox checked={field.value.includes(team.id)} />
                    <ListItemText
                      primary={`${team.abbreviation} — ${team.fullName}`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'Adding…' : 'Add to candidate inbox'}
        </Button>
      </Stack>
      <UnsavedChangesDialog dirty={form.formState.isDirty && !isSubmitting} />
    </Paper>
  );
};
