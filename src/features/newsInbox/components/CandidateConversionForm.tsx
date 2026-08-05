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
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { getNewsInboxErrorMessage } from '@/features/newsInbox/errors';
import {
  conversionFormSchema,
  type ConversionFormValues,
} from '@/features/newsInbox/schemas';
import type {
  CandidateConvertInput,
  NewsCandidateDetail,
} from '@/features/newsInbox/types';
import { useTeamsQuery } from '@/features/teams/queries';

const nullable = (value: string) => value.trim() || null;

export const CandidateConversionForm = ({
  candidate,
  error,
  isSubmitting,
  onSubmit,
  onSuccess,
}: {
  readonly candidate: NewsCandidateDetail;
  readonly error?: unknown;
  readonly isSubmitting: boolean;
  readonly onSubmit: (input: CandidateConvertInput) => Promise<string>;
  readonly onSuccess: (articleId: string) => void;
}) => {
  const teams = useTeamsQuery();
  const form = useForm<ConversionFormValues>({
    resolver: zodResolver(conversionFormSchema),
    defaultValues: {
      title: candidate.headline,
      slug: '',
      originalSummary: '',
      originalCommentary: '',
      confirmedTeamIds: candidate.suggestedTeams.map((team) => team.id),
      heroImageUrl: '',
      heroImageAlt: '',
      heroImageAttribution: '',
      heroImageAttributionUrl: '',
      changeSummary: '',
    },
  });
  const submit = form.handleSubmit(async (values) => {
    const articleId = await onSubmit({
      title: values.title.trim(),
      ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
      originalSummary: values.originalSummary.trim(),
      originalCommentary: nullable(values.originalCommentary),
      confirmedTeamIds: values.confirmedTeamIds,
      heroImageUrl: nullable(values.heroImageUrl),
      heroImageAlt: nullable(values.heroImageAlt),
      heroImageAttribution: nullable(values.heroImageAttribution),
      heroImageAttributionUrl: nullable(values.heroImageAttributionUrl),
      changeSummary: nullable(values.changeSummary),
    });
    form.reset(values);
    window.setTimeout(() => onSuccess(articleId), 0);
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
        <div>
          <Typography component="h2" variant="h4">
            Create curated draft
          </Typography>
          <Typography color="text.secondary">
            Conversion creates a private CURATED draft. It does not publish or
            schedule the article.
          </Typography>
        </div>
        {error ? (
          <Alert severity="error">{getNewsInboxErrorMessage(error)}</Alert>
        ) : null}
        <Alert severity="warning">
          Write an original summary or commentary. Do not paste the full source
          article. The publisher description is intentionally not copied here.
        </Alert>
        <TextField
          required
          label="Draft title"
          error={Boolean(form.formState.errors.title)}
          helperText={form.formState.errors.title?.message}
          {...form.register('title')}
        />
        <TextField
          label="Draft slug"
          error={Boolean(form.formState.errors.slug)}
          helperText={
            form.formState.errors.slug?.message ??
            'Leave blank to let the backend generate it.'
          }
          {...form.register('slug')}
        />
        <TextField
          required
          multiline
          minRows={4}
          label="Original summary"
          error={Boolean(form.formState.errors.originalSummary)}
          helperText={
            form.formState.errors.originalSummary?.message ??
            'Required. Do not copy the source description.'
          }
          {...form.register('originalSummary')}
        />
        <TextField
          multiline
          minRows={5}
          label="Original commentary (Markdown)"
          error={Boolean(form.formState.errors.originalCommentary)}
          helperText={
            form.formState.errors.originalCommentary?.message ??
            'Optional analysis; raw HTML is not accepted.'
          }
          {...form.register('originalCommentary')}
        />
        <Controller
          name="confirmedTeamIds"
          control={form.control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="confirmed-teams-label">
                Confirmed teams
              </InputLabel>
              <Select
                {...field}
                multiple
                labelId="confirmed-teams-label"
                label="Confirmed teams"
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Hero image URL"
            type="url"
            error={Boolean(form.formState.errors.heroImageUrl)}
            helperText={form.formState.errors.heroImageUrl?.message}
            {...form.register('heroImageUrl')}
          />
          <TextField
            fullWidth
            label="Hero image alt text"
            error={Boolean(form.formState.errors.heroImageAlt)}
            helperText={form.formState.errors.heroImageAlt?.message}
            {...form.register('heroImageAlt')}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Image attribution"
            error={Boolean(form.formState.errors.heroImageAttribution)}
            helperText={form.formState.errors.heroImageAttribution?.message}
            {...form.register('heroImageAttribution')}
          />
          <TextField
            fullWidth
            label="Attribution URL"
            type="url"
            error={Boolean(form.formState.errors.heroImageAttributionUrl)}
            helperText={form.formState.errors.heroImageAttributionUrl?.message}
            {...form.register('heroImageAttributionUrl')}
          />
        </Stack>
        <TextField
          label="Change summary"
          error={Boolean(form.formState.errors.changeSummary)}
          helperText={
            form.formState.errors.changeSummary?.message ??
            'Optional internal note about this conversion.'
          }
          {...form.register('changeSummary')}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'Creating draft…' : 'Create curated draft'}
        </Button>
      </Stack>
      <UnsavedChangesDialog dirty={form.formState.isDirty && !isSubmitting} />
    </Paper>
  );
};
