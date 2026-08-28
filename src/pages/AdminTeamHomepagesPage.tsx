import AddRounded from '@mui/icons-material/AddRounded';
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import PlayCircleRounded from '@mui/icons-material/PlayCircleRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { TeamHelmet } from '@/components/team/TeamHelmet';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { moveOrder } from '@/features/homepage/presentation';
import { getTeamHomepageErrorMessage } from '@/features/teamHomepage/errors';
import {
  useAddEditorialMutation,
  useAddTeamHighlightMutation,
  useAdminTeamHomepageQuery,
  useEditorialCandidatesQuery,
  useRemoveEditorialMutation,
  useRemoveTeamHighlightMutation,
  useReorderEditorialMutation,
  useReorderTeamHighlightsMutation,
  useTeamHighlightCandidatesQuery,
  useUpdateEditorialMutation,
  useUpdateTeamBannerMutation,
  useUpdateTeamHighlightSettingsMutation,
} from '@/features/teamHomepage/queries';
import type {
  AdminEditorialPlacement,
  AdminHighlightPlacement,
  AdminTeamHomepageMediaSource,
  EditorialCandidate,
  TeamHomepageHighlightSettings,
} from '@/features/teamHomepage/types';
import {
  MAX_TEAM_EDITORIAL_PLACEMENTS,
  MAX_TEAM_HIGHLIGHT_PLACEMENTS,
} from '@/features/teamHomepage/types';
import { TeamHubHero } from '@/features/teamHub/components/TeamHubHero';
import { useTeamHubQuery } from '@/features/teamHub/queries';
import type { TeamHomepageBanner } from '@/features/teamHub/types';
import { useTeamsQuery } from '@/features/teams/queries';
import type { Team } from '@/features/teams/types';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';
import { getTeamThemeTokens } from '@/features/teamVisualIdentity/teamTheme';

const bannerSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        (URL.canParse(value) && new URL(value).protocol === 'https:'),
      'Enter an HTTPS image URL.',
    ),
  focalX: z.number().int().min(0).max(100),
  focalY: z.number().int().min(0).max(100),
  overlayOpacity: z.number().int().min(0).max(100),
});
type BannerFields = z.infer<typeof bannerSchema>;

const ErrorMessage = ({ error }: { readonly error: unknown }) =>
  error ? (
    <Alert severity="error">{getTeamHomepageErrorMessage(error)}</Alert>
  ) : null;

const BannerSection = ({
  team,
  data,
}: {
  readonly team: Team;
  readonly data: TeamHomepageBanner;
}) => {
  const theme = useTheme();
  const mutation = useUpdateTeamBannerMutation(team.id);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BannerFields>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { ...data, imageUrl: data.imageUrl ?? '' },
  });
  useEffect(
    () => reset({ ...data, imageUrl: data.imageUrl ?? '' }),
    [data, reset],
  );
  const draft = useWatch({ control });
  const teamTokens = getTeamThemeTokens(
    getTeamVisualConfig(team.abbreviation),
    theme.palette.mode,
  );
  const save = (values: BannerFields) =>
    mutation.mutate({
      imageUrl: values.imageUrl === '' ? null : values.imageUrl,
      focalX: values.focalX,
      focalY: values.focalY,
      overlayOpacity: values.overlayOpacity,
    });

  return (
    <Stack component="section" spacing={2}>
      <Box>
        <Typography component="h2" variant="h5">
          Team Banner
        </Typography>
        <Typography color="text.secondary">
          Position a rights-safe HTTPS action image over the selected team’s
          real visual identity.
        </Typography>
      </Box>
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          component="form"
          spacing={2}
          onSubmit={(event) => void handleSubmit(save)(event)}
        >
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Image URL"
                error={Boolean(errors.imageUrl)}
                helperText={
                  errors.imageUrl?.message ??
                  'HTTPS Cloudinary URLs are supported.'
                }
              />
            )}
          />
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            }}
          >
            {(['focalX', 'focalY', 'overlayOpacity'] as const).map((name) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      name === 'focalX'
                        ? 'Focal X'
                        : name === 'focalY'
                          ? 'Focal Y'
                          : 'Overlay opacity'
                    }
                    type="number"
                    error={Boolean(errors[name])}
                    helperText={errors[name]?.message ?? '0–100'}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    slotProps={{ htmlInput: { min: 0, max: 100 } }}
                  />
                )}
              />
            ))}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
            >
              Save Banner
            </Button>
            <Button
              type="button"
              color="error"
              disabled={mutation.isPending || data.imageUrl === null}
              onClick={() => mutation.mutate({ imageUrl: null })}
            >
              Clear image
            </Button>
          </Stack>
          <ErrorMessage error={mutation.error} />
        </Stack>
      </Card>
      <Typography component="h3" variant="h6">
        Preview
      </Typography>
      <TeamHubHero
        preview
        team={team}
        teamTokens={teamTokens}
        banner={{
          imageUrl: draft.imageUrl?.trim() || null,
          focalX: typeof draft.focalX === 'number' ? draft.focalX : 50,
          focalY: typeof draft.focalY === 'number' ? draft.focalY : 50,
          overlayOpacity:
            typeof draft.overlayOpacity === 'number'
              ? draft.overlayOpacity
              : 35,
        }}
      />
    </Stack>
  );
};

const sourceTitle = (placement: AdminEditorialPlacement) =>
  placement.source?.title ?? 'Unavailable content';

const EditorialCandidateDialog = ({
  open,
  onClose,
  teamId,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly teamId: string;
}) => {
  const query = useEditorialCandidatesQuery(teamId, open);
  const add = useAddEditorialMutation(teamId);
  const [type, setType] = useState<'ALL' | 'ARTICLE' | 'VIDEO'>('ALL');
  const candidates = query.data?.pages.flatMap((page) => page.items) ?? [];
  const visible = candidates.filter(
    (candidate) => type === 'ALL' || candidate.type === type,
  );
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Team Top Story</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Content type"
            value={type}
            onChange={(event) => setType(event.target.value as typeof type)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="ARTICLE">Articles</MenuItem>
            <MenuItem value="VIDEO">Videos</MenuItem>
          </TextField>
          {query.isPending ? (
            <AdminLoading label="Loading editorial candidates" />
          ) : null}
          {query.isError ? (
            <AdminError
              error={query.error}
              onRetry={() => void query.refetch()}
            />
          ) : null}
          {visible.map((candidate) => (
            <EditorialCandidateRow
              key={`${candidate.type}:${candidate.id}`}
              candidate={candidate}
              pending={add.isPending}
              onAdd={(lead) =>
                add.mutate(
                  candidate.type === 'ARTICLE'
                    ? { sourceType: 'ARTICLE', sourceId: candidate.id }
                    : {
                        sourceType: 'VIDEO',
                        sourceId: candidate.id,
                        mediaSourceType: candidate.mediaSourceType,
                        isLeadReplacement: lead,
                      },
                )
              }
            />
          ))}
          {query.hasNextPage ? (
            <Button
              variant="outlined"
              onClick={() => void query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              Load more
            </Button>
          ) : null}
          <ErrorMessage error={add.error} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditorialCandidateRow = ({
  candidate,
  pending,
  onAdd,
}: {
  readonly candidate: EditorialCandidate;
  readonly pending: boolean;
  readonly onAdd: (lead: boolean) => void;
}) => {
  const [lead, setLead] = useState(false);
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        {candidate.type === 'VIDEO' && candidate.thumbnailUrl ? (
          <Box
            component="img"
            src={candidate.thumbnailUrl}
            alt=""
            sx={{
              width: 120,
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={candidate.type === 'ARTICLE' ? 'Article' : 'Video'}
            />
            {candidate.isSelected ? (
              <Chip size="small" color="success" label="Selected" />
            ) : null}
          </Stack>
          <Typography sx={{ fontWeight: 750 }}>{candidate.title}</Typography>
          {candidate.type === 'VIDEO' ? (
            <FormControlLabel
              control={
                <Switch
                  checked={lead}
                  onChange={(event) => setLead(event.target.checked)}
                />
              }
              label="Replace main Top Story"
            />
          ) : null}
          {candidate.type === 'VIDEO' ? (
            <Typography variant="caption" color="text.secondary">
              When enabled, this video replaces the main featured article. When
              disabled, it appears in Supporting Stories.
            </Typography>
          ) : null}
        </Box>
        <Button
          variant="contained"
          disabled={candidate.isSelected || pending}
          onClick={() => onAdd(lead)}
        >
          Add
        </Button>
      </Stack>
    </Card>
  );
};

const EditorialSection = ({
  teamId,
  placements,
  featuredLabel,
}: {
  readonly teamId: string;
  readonly placements: readonly AdminEditorialPlacement[];
  readonly featuredLabel: string;
}) => {
  const [open, setOpen] = useState(false);
  const reorder = useReorderEditorialMutation(teamId);
  const remove = useRemoveEditorialMutation(teamId);
  const update = useUpdateEditorialMutation(teamId);
  const sorted = [...placements].sort((a, b) => a.position - b.position);
  const ids = sorted.map((placement) => placement.id);
  const move = (
    placement: AdminEditorialPlacement,
    direction: 'up' | 'down',
  ) => {
    const next = moveOrder(ids, placement.id, direction);
    if (next) reorder.mutate({ placementIds: next });
  };
  return (
    <Stack component="section" spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography component="h2" variant="h5">
            Team Top Stories
          </Typography>
          <Typography color="text.secondary">
            {placements.length} / {MAX_TEAM_EDITORIAL_PLACEMENTS} placements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          disabled={placements.length >= MAX_TEAM_EDITORIAL_PLACEMENTS}
          onClick={() => setOpen(true)}
        >
          Add content
        </Button>
      </Stack>
      <Alert severity="info">
        <strong>Featured content:</strong> {featuredLabel}
      </Alert>
      {sorted.length === 0 ? (
        <AdminEmpty
          title="No editorial placements"
          description="The backend may still use recent team articles as the public lead."
        />
      ) : (
        sorted.map((placement, index) => (
          <Card key={placement.id} sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { md: 'center' } }}
            >
              <Chip
                size="small"
                label={
                  placement.sourceType === 'ARTICLE'
                    ? 'Article'
                    : placement.isLeadReplacement
                      ? 'Video replacement active'
                      : 'Video'
                }
                color={placement.isLeadReplacement ? 'primary' : 'default'}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 750 }}>
                  {sourceTitle(placement)}
                </Typography>
                {!placement.isAvailable ? (
                  <Typography color="error">Source unavailable</Typography>
                ) : null}
              </Box>
              {placement.sourceType === 'VIDEO' ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={placement.isLeadReplacement}
                      disabled={update.isPending}
                      onChange={(event) =>
                        update.mutate({
                          placementId: placement.id,
                          isLeadReplacement: event.target.checked,
                        })
                      }
                    />
                  }
                  label="Replace main Top Story"
                />
              ) : null}
              <Stack direction="row">
                <IconButton
                  aria-label={`Move ${sourceTitle(placement)} up`}
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => move(placement, 'up')}
                >
                  <ArrowUpwardRounded />
                </IconButton>
                <IconButton
                  aria-label={`Move ${sourceTitle(placement)} down`}
                  disabled={index === sorted.length - 1 || reorder.isPending}
                  onClick={() => move(placement, 'down')}
                >
                  <ArrowDownwardRounded />
                </IconButton>
                <Button
                  color="error"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(placement.id)}
                >
                  Remove
                </Button>
              </Stack>
            </Stack>
          </Card>
        ))
      )}
      <ErrorMessage error={reorder.error ?? remove.error ?? update.error} />
      <EditorialCandidateDialog
        open={open}
        onClose={() => setOpen(false)}
        teamId={teamId}
      />
    </Stack>
  );
};

type HighlightCandidate = AdminTeamHomepageMediaSource & {
  readonly isSelected: boolean;
};
const HighlightCandidateDialog = ({
  open,
  onClose,
  teamId,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly teamId: string;
}) => {
  const query = useTeamHighlightCandidatesQuery(teamId, open);
  const add = useAddTeamHighlightMutation(teamId);
  const candidates = query.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Team Highlight</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {query.isPending ? (
            <AdminLoading label="Loading highlight candidates" />
          ) : null}
          {candidates.map((candidate: HighlightCandidate) => (
            <Card
              key={`${candidate.sourceType}:${candidate.sourceId}`}
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                {candidate.thumbnailUrl ? (
                  <Box
                    component="img"
                    src={candidate.thumbnailUrl}
                    alt=""
                    sx={{
                      width: 120,
                      aspectRatio: '16 / 9',
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <PlayCircleRounded />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 750 }}>
                    {candidate.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {candidate.sourceType === 'GAME_HIGHLIGHT'
                      ? 'Game Highlight'
                      : 'Game Video'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  disabled={candidate.isSelected || add.isPending}
                  onClick={() =>
                    add.mutate({
                      sourceType: candidate.sourceType,
                      sourceId: candidate.sourceId,
                    })
                  }
                >
                  {candidate.isSelected ? 'Selected' : 'Add'}
                </Button>
              </Stack>
            </Card>
          ))}
          {query.hasNextPage ? (
            <Button
              variant="outlined"
              onClick={() => void query.fetchNextPage()}
            >
              Load more
            </Button>
          ) : null}
          <ErrorMessage error={query.error ?? add.error} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const HighlightsSection = ({
  teamId,
  placements,
  settings,
}: {
  readonly teamId: string;
  readonly placements: readonly AdminHighlightPlacement[];
  readonly settings: TeamHomepageHighlightSettings;
}) => {
  const [open, setOpen] = useState(false);
  const updateSettings = useUpdateTeamHighlightSettingsMutation(teamId);
  const reorder = useReorderTeamHighlightsMutation(teamId);
  const remove = useRemoveTeamHighlightMutation(teamId);
  const sorted = [...placements].sort((a, b) => a.position - b.position);
  const ids = sorted.map((placement) => placement.id);
  const move = (
    placement: AdminHighlightPlacement,
    direction: 'up' | 'down',
  ) => {
    const next = moveOrder(ids, placement.id, direction);
    if (next) reorder.mutate({ placementIds: next });
  };
  const commitLimit = (input: HTMLInputElement | HTMLTextAreaElement) => {
    const value = Number(input.value);
    if (
      Number.isInteger(value) &&
      value >= 3 &&
      value <= 10 &&
      value !== settings.displayLimit
    )
      updateSettings.mutate({
        displayLimit: value,
        fillWithAutomatic: settings.fillWithAutomatic,
      });
    else input.value = String(settings.displayLimit);
  };
  return (
    <Stack component="section" spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h2" variant="h5">
            Team Highlights
          </Typography>
          <Typography color="text.secondary">
            {placements.length} / {MAX_TEAM_HIGHLIGHT_PLACEMENTS} curated
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          disabled={placements.length >= MAX_TEAM_HIGHLIGHT_PLACEMENTS}
          onClick={() => setOpen(true)}
        >
          Add highlight
        </Button>
      </Stack>
      <Card sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <TextField
            key={settings.displayLimit}
            label="Display Limit"
            type="number"
            defaultValue={settings.displayLimit}
            onBlur={(event) => commitLimit(event.currentTarget)}
            slotProps={{ htmlInput: { min: 3, max: 10 } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.fillWithAutomatic}
                onChange={(event) =>
                  updateSettings.mutate({
                    displayLimit: settings.displayLimit,
                    fillWithAutomatic: event.target.checked,
                  })
                }
              />
            }
            label="Fill Automatically"
          />
        </Stack>
      </Card>
      {sorted.length === 0 ? (
        <AdminEmpty
          title="No curated team highlights"
          description="Automatic highlights may still fill the public row when enabled."
        />
      ) : (
        sorted.map((placement, index) => (
          <Card key={placement.id} sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {placement.source?.thumbnailUrl ? (
                <Box
                  component="img"
                  src={placement.source.thumbnailUrl}
                  alt=""
                  sx={{
                    width: 120,
                    aspectRatio: '16 / 9',
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              ) : (
                <PlayCircleRounded />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 750 }}>
                  {placement.source?.title ?? 'Unavailable media'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {placement.sourceType === 'GAME_HIGHLIGHT'
                    ? 'Game Highlight'
                    : 'Game Video'}
                </Typography>
              </Box>
              <IconButton
                aria-label={`Move ${placement.source?.title ?? 'highlight'} up`}
                disabled={index === 0 || reorder.isPending}
                onClick={() => move(placement, 'up')}
              >
                <ArrowUpwardRounded />
              </IconButton>
              <IconButton
                aria-label={`Move ${placement.source?.title ?? 'highlight'} down`}
                disabled={index === sorted.length - 1 || reorder.isPending}
                onClick={() => move(placement, 'down')}
              >
                <ArrowDownwardRounded />
              </IconButton>
              <Button color="error" onClick={() => remove.mutate(placement.id)}>
                Remove
              </Button>
            </Stack>
          </Card>
        ))
      )}
      <ErrorMessage
        error={updateSettings.error ?? reorder.error ?? remove.error}
      />
      <HighlightCandidateDialog
        open={open}
        onClose={() => setOpen(false)}
        teamId={teamId}
      />
    </Stack>
  );
};

export const AdminTeamHomepagesPage = () => {
  const [parameters, setParameters] = useSearchParams();
  const teamsQuery = useTeamsQuery();
  const teams = useMemo(
    () =>
      [...(teamsQuery.data ?? [])].sort((a, b) =>
        a.fullName.localeCompare(b.fullName),
      ),
    [teamsQuery.data],
  );
  const requested = parameters.get('teamId') ?? '';
  const selectedTeam = teams.find((team) => team.id === requested) ?? teams[0];
  useEffect(() => {
    if (selectedTeam && requested !== selectedTeam.id)
      setParameters({ teamId: selectedTeam.id }, { replace: true });
  }, [requested, selectedTeam, setParameters]);
  const teamId = selectedTeam?.id ?? '';
  const query = useAdminTeamHomepageQuery(teamId);
  const publicHub = useTeamHubQuery(teamId, teamId !== '');
  const featured = publicHub.data?.overview.homepage.editorial.featuredItem;
  const featuredLabel = featured
    ? `${featured.type === 'ARTICLE' ? 'Article' : 'Video replacement active'} — ${featured.type === 'ARTICLE' ? featured.article.title : featured.title}`
    : 'No resolved featured content';

  return (
    <>
      <AdminPageHeader
        title="Team Homepages"
        description="Manage each team’s action banner, editorial placements, and highlights."
      />
      {teamsQuery.isPending ? (
        <AdminLoading label="Loading teams" />
      ) : teamsQuery.isError ? (
        <AdminError error={teamsQuery.error} />
      ) : (
        <Stack spacing={5}>
          <TextField
            select
            label="Team"
            value={teamId}
            onChange={(event) => setParameters({ teamId: event.target.value })}
            sx={{ maxWidth: 440 }}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <TeamHelmet team={team.abbreviation} size="sm" />
                  <span>
                    {team.abbreviation} — {team.fullName}
                  </span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
          {query.isPending || !selectedTeam ? (
            <AdminLoading label="Loading Team Homepage" />
          ) : query.isError || !query.data ? (
            <AdminError
              error={query.error}
              onRetry={() => void query.refetch()}
            />
          ) : (
            <>
              <BannerSection team={selectedTeam} data={query.data.banner} />
              <EditorialSection
                teamId={teamId}
                placements={query.data.editorial.placements}
                featuredLabel={featuredLabel}
              />
              <HighlightsSection
                teamId={teamId}
                placements={query.data.highlights.placements}
                settings={query.data.highlights.settings}
              />
            </>
          )}
        </Stack>
      )}
    </>
  );
};
