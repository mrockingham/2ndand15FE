import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { MarkdownContent } from '@/features/articles/components/MarkdownContent';
import { ArticleHero } from '@/features/articles/components/ArticleHero';
import { getArticleErrorMessage } from '@/features/articles/errors';
import {
  articleFormSchema,
  slugPreview,
  type ArticleFormValues,
} from '@/features/articles/schemas';
import type { AdminArticleDetail } from '@/features/articles/types';
import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { useTeamsQuery } from '@/features/teams/queries';
import { ApiError } from '@/services/api/apiClient';

const defaults = (article?: AdminArticleDetail): ArticleFormValues => ({
  type: article?.type ?? 'ORIGINAL',
  title: article?.title ?? '',
  slug: article?.slug ?? '',
  summary: article?.summary ?? '',
  body: article?.body ?? '',
  sourceName: article?.sourceName ?? '',
  sourceUrl: article?.sourceUrl ?? '',
  sourcePublishedAt: article?.sourcePublishedAt ?? '',
  heroImageUrl: article?.heroImageUrl ?? '',
  heroImageAlt: article?.heroImageAlt ?? '',
  heroImageAttribution: article?.heroImageAttribution ?? '',
  heroImageAttributionUrl: article?.heroImageAttributionUrl ?? '',
  seoTitle: article?.seoTitle ?? '',
  seoDescription: article?.seoDescription ?? '',
  isFeatured: article?.isFeatured ?? false,
  featuredPriority: article?.featuredPriority
    ? String(article.featuredPriority)
    : '',
  featuredStartsAt: article?.featuredStartsAt ?? '',
  featuredEndsAt: article?.featuredEndsAt ?? '',
  teamIds: article?.teams.map(({ id }) => id) ?? [],
  changeSummary: '',
});

export const ArticleForm = ({
  article,
  error,
  isSubmitting,
  onSubmit,
  onSaveTeams,
  onReload,
}: {
  readonly article?: AdminArticleDetail;
  readonly error?: unknown;
  readonly isSubmitting: boolean;
  readonly onSubmit: (values: ArticleFormValues) => Promise<void>;
  readonly onSaveTeams?: (
    teamIds: readonly string[],
    changeSummary: string,
  ) => Promise<void>;
  readonly onReload?: () => void;
}) => {
  const teamsQuery = useTeamsQuery();
  const [previewTab, setPreviewTab] = useState(0);
  const [now] = useState(() => Date.now());
  const defaultValues = defaults(article);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues,
  });
  const values = useWatch({ control, defaultValue: defaultValues });
  const type = values.type ?? 'ORIGINAL';
  const body = values.body ?? '';
  const title = values.title ?? '';
  const featuredWindow = !values.isFeatured
    ? null
    : values.featuredStartsAt && Date.parse(values.featuredStartsAt) > now
      ? `Featured placement begins ${new Date(values.featuredStartsAt).toLocaleString()}.`
      : values.featuredEndsAt && Date.parse(values.featuredEndsAt) <= now
        ? `Featured placement ended ${new Date(values.featuredEndsAt).toLocaleString()}.`
        : 'This article is currently inside its configured featured window.';
  const conflict =
    error instanceof ApiError && error.code === 'ARTICLE_VERSION_CONFLICT';
  const runApiAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (actionError: unknown) {
      // TanStack Mutation exposes normalized API failures through `error` above.
      if (!(actionError instanceof ApiError)) throw actionError;
    }
  };
  const submitForm = handleSubmit((submittedValues) =>
    runApiAction(() => onSubmit(submittedValues)),
  );
  return (
    <Stack spacing={3}>
      {error ? (
        <Alert severity="error">
          {getArticleErrorMessage(error)}
          {conflict ? (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button color="inherit" onClick={onReload}>
                Reload latest version
              </Button>
              <Button
                color="inherit"
                onClick={() => void navigator.clipboard?.writeText(body)}
              >
                Copy unsaved Markdown
              </Button>
            </Stack>
          ) : null}
        </Alert>
      ) : null}
      <Paper
        component="form"
        noValidate
        variant="outlined"
        onSubmit={(event) => void submitForm(event)}
        sx={{ p: { xs: 2, md: 3 } }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h4">Editorial content</Typography>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Article type"
                error={Boolean(errors.type)}
                helperText={
                  type === 'CURATED'
                    ? 'Add your own summary or commentary. Do not paste the source article.'
                    : type === 'ANNOUNCEMENT'
                      ? 'For notices and announcements written by 2nd & 15.'
                      : 'Original reporting or analysis written by 2nd & 15.'
                }
                {...field}
              >
                <MenuItem value="ORIGINAL">Original</MenuItem>
                <MenuItem value="CURATED">Curated</MenuItem>
                <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
              </TextField>
            )}
          />
          <TextField
            required
            label="Title"
            error={Boolean(errors.title)}
            helperText={errors.title?.message ?? `${title.length}/180`}
            {...register('title')}
          />
          <TextField
            label="Slug"
            disabled={Boolean(article?.publishedAt)}
            error={Boolean(errors.slug)}
            helperText={
              errors.slug?.message ??
              `Preview: /news/${slugPreview(values.slug || title) || 'article-slug'}. Published slugs cannot be changed.`
            }
            {...register('slug')}
          />
          <TextField
            label="Summary"
            required={type !== 'ANNOUNCEMENT'}
            multiline
            minRows={3}
            error={Boolean(errors.summary)}
            helperText={
              errors.summary?.message ?? `${values.summary?.length ?? 0}/1,000`
            }
            {...register('summary')}
          />
          {type === 'CURATED' ? (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Source name"
                error={Boolean(errors.sourceName)}
                helperText={errors.sourceName?.message}
                {...register('sourceName')}
              />
              <TextField
                fullWidth
                required
                label="Source URL"
                type="url"
                error={Boolean(errors.sourceUrl)}
                helperText={errors.sourceUrl?.message}
                {...register('sourceUrl')}
              />
              <TextField
                fullWidth
                label="Source published time"
                placeholder="2026-08-02T10:00:00-04:00"
                error={Boolean(errors.sourcePublishedAt)}
                helperText={
                  errors.sourcePublishedAt?.message ??
                  'Explicit UTC offset required.'
                }
                {...register('sourcePublishedAt')}
              />
            </Stack>
          ) : null}
          <Box>
            <Tabs
              value={previewTab}
              onChange={(_, value: number) => setPreviewTab(value)}
              aria-label="Markdown editor modes"
            >
              <Tab label="Markdown" />
              <Tab label="Draft preview" />
            </Tabs>
            {previewTab === 0 ? (
              <TextField
                fullWidth
                label={
                  type === 'CURATED'
                    ? 'Original commentary (optional)'
                    : 'Markdown body'
                }
                required={type !== 'CURATED'}
                multiline
                minRows={14}
                error={Boolean(errors.body)}
                helperText={
                  errors.body?.message ??
                  `${body.length}/${type === 'CURATED' ? '2,000' : '100,000'} characters. Raw HTML is rejected.`
                }
                {...register('body')}
              />
            ) : (
              <Paper variant="outlined" sx={{ p: 2, minHeight: 260 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Draft preview—not publicly accessible.
                </Alert>
                {body ? (
                  <MarkdownContent markdown={body} draft />
                ) : (
                  <Typography color="text.secondary">
                    Add Markdown to preview the article.
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
          <Typography variant="h4">Hero and SEO metadata</Typography>
          <Alert severity="warning">
            Use URL-based images only when you have publication rights. Images
            are not uploaded, downloaded, cached, or proxied.
          </Alert>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Hero image URL"
              type="url"
              error={Boolean(errors.heroImageUrl)}
              helperText={errors.heroImageUrl?.message}
              {...register('heroImageUrl')}
            />
            <TextField
              fullWidth
              label="Hero image alt text"
              error={Boolean(errors.heroImageAlt)}
              helperText={errors.heroImageAlt?.message}
              {...register('heroImageAlt')}
            />
          </Stack>
          {values.heroImageUrl && values.heroImageAlt ? (
            <ArticleHero
              url={values.heroImageUrl}
              alt={values.heroImageAlt}
              attribution={values.heroImageAttribution}
              attributionUrl={values.heroImageAttributionUrl}
            />
          ) : null}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Hero attribution"
              {...register('heroImageAttribution')}
            />
            <TextField
              fullWidth
              label="Hero attribution URL"
              type="url"
              error={Boolean(errors.heroImageAttributionUrl)}
              helperText={errors.heroImageAttributionUrl?.message}
              {...register('heroImageAttributionUrl')}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="SEO title"
              error={Boolean(errors.seoTitle)}
              helperText={errors.seoTitle?.message}
              {...register('seoTitle')}
            />
            <TextField
              fullWidth
              label="SEO description"
              error={Boolean(errors.seoDescription)}
              helperText={errors.seoDescription?.message}
              {...register('seoDescription')}
            />
          </Stack>
          <Typography variant="h4">Featured placement</Typography>
          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                  />
                }
                label="Feature this article"
              />
            )}
          />
          {values.isFeatured ? (
            <>
              <Alert severity="info">
                Lower priority numbers appear first. Optional windows control
                when the public featured endpoint includes the story.
              </Alert>
              <Typography color="text.secondary">{featuredWindow}</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Featured priority"
                  error={Boolean(errors.featuredPriority)}
                  helperText={errors.featuredPriority?.message}
                  {...register('featuredPriority')}
                />
                <TextField
                  fullWidth
                  label="Featured starts"
                  placeholder="2026-08-02T10:00:00-04:00"
                  error={Boolean(errors.featuredStartsAt)}
                  helperText={
                    errors.featuredStartsAt?.message ??
                    'Optional explicit-offset ISO timestamp.'
                  }
                  {...register('featuredStartsAt')}
                />
                <TextField
                  fullWidth
                  label="Featured ends"
                  placeholder="2026-08-03T10:00:00-04:00"
                  error={Boolean(errors.featuredEndsAt)}
                  helperText={
                    errors.featuredEndsAt?.message ??
                    'Optional explicit-offset ISO timestamp.'
                  }
                  {...register('featuredEndsAt')}
                />
              </Stack>
            </>
          ) : null}
          <Typography variant="h4">Team tags</Typography>
          <Controller
            name="teamIds"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={teamsQuery.data ?? []}
                value={(teamsQuery.data ?? []).filter((team) =>
                  field.value.includes(team.id),
                )}
                onChange={(_, selected) =>
                  field.onChange(selected.map(({ id }) => id))
                }
                getOptionLabel={(team) =>
                  `${team.fullName} (${team.abbreviation})`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Active NFL team tags"
                    error={Boolean(errors.teamIds)}
                    helperText={
                      errors.teamIds?.message ??
                      'Zero tags means league-wide. Maximum 32.'
                    }
                  />
                )}
              />
            )}
          />
          <TextField
            label="Change summary"
            error={Boolean(errors.changeSummary)}
            helperText={
              errors.changeSummary?.message ??
              `${values.changeSummary?.length ?? 0}/500`
            }
            {...register('changeSummary')}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving…'
                : article
                  ? 'Save article'
                  : 'Create draft'}
            </Button>
            {article && onSaveTeams ? (
              <Button
                variant="outlined"
                disabled={isSubmitting}
                onClick={() =>
                  void runApiAction(() =>
                    onSaveTeams(
                      values.teamIds ?? [],
                      values.changeSummary ?? '',
                    ),
                  )
                }
              >
                Save team tags
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
      <UnsavedChangesDialog dirty={isDirty && !isSubmitting} />
    </Stack>
  );
};
