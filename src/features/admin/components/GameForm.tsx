import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Checkbox,
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
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { getAdminErrorMessage } from '@/features/admin/errorMessages';
import type {
  AdminGameValues,
  ManualGameCreateInput,
  ManualGameInput,
  ManualGameUpdateInput,
} from '@/features/admin/types';
import { useTeamsQuery } from '@/features/teams/queries';

const statuses = [
  'SCHEDULED',
  'PREGAME',
  'IN_PROGRESS',
  'HALFTIME',
  'FINAL',
  'POSTPONED',
  'CANCELED',
  'SUSPENDED',
] as const;
const offsets = [
  '-08:00',
  '-07:00',
  '-06:00',
  '-05:00',
  '-04:00',
  '+00:00',
] as const;

const nullableText = (maximum: number) => z.string().trim().max(maximum);
const createFormSchema = (requiresKickoff: boolean) =>
  z
    .object({
      season: z.number().int().min(1920).max(2100),
      seasonType: z.enum(['PRE', 'REG', 'POST']),
      week: z
        .string()
        .regex(/^$|^(?:[1-9]|1\d|2[0-2])$/, 'Week must be 1–22 or blank.'),
      startLocal: z.string(),
      utcOffset: z.union([z.enum(offsets), z.literal('')]),
      status: z.enum(statuses),
      homeTeamId: z.string().uuid('Choose a home team.'),
      awayTeamId: z.string().uuid('Choose an away team.'),
      venueName: nullableText(160),
      venueCity: nullableText(128),
      broadcastNetwork: nullableText(64),
      isNeutralSite: z.boolean(),
      sourceName: z.string().trim().min(1, 'Source name is required.').max(160),
      sourceUrl: z.union([z.literal(''), z.url().max(2048)]),
      externalReference: nullableText(256),
      notes: nullableText(1000),
    })
    .superRefine((value, context) => {
      if (requiresKickoff && value.startLocal === '') {
        context.addIssue({
          code: 'custom',
          path: ['startLocal'],
          message: 'Kickoff date and time are required.',
        });
      }
      if (value.startLocal !== '' && value.utcOffset === '') {
        context.addIssue({
          code: 'custom',
          path: ['utcOffset'],
          message: 'Choose the kickoff UTC offset.',
        });
      }
      if (value.homeTeamId === value.awayTeamId && value.homeTeamId !== '') {
        context.addIssue({
          code: 'custom',
          path: ['awayTeamId'],
          message: 'Home and away teams must differ.',
        });
      }
    });

type GameFormValues = z.infer<ReturnType<typeof createFormSchema>>;

const nullable = (value: string) => (value.trim() === '' ? null : value.trim());
const localUtcValue = (iso: string | null) => {
  if (iso === null) return '';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toISOString().slice(0, 16);
};

const defaultsFromGame = (game?: AdminGameValues): GameFormValues => ({
  season: game?.season ?? new Date().getUTCFullYear(),
  seasonType: game?.seasonType ?? 'REG',
  week:
    game?.week === null || game?.week === undefined ? '' : String(game.week),
  startLocal: game ? localUtcValue(game.startTime) : '',
  utcOffset: game?.startTime ? '+00:00' : '',
  status: game?.status ?? 'SCHEDULED',
  homeTeamId: game?.homeTeam.id ?? '',
  awayTeamId: game?.awayTeam.id ?? '',
  venueName: game?.venue.name ?? '',
  venueCity: game?.venue.city ?? '',
  broadcastNetwork: game?.broadcastNetwork ?? '',
  isNeutralSite: game?.isNeutralSite ?? false,
  sourceName: '',
  sourceUrl: '',
  externalReference: '',
  notes: '',
});

export const GameForm = ({
  game,
  submitLabel,
  error,
  isSubmitting,
  onSubmit,
}: {
  readonly game?: AdminGameValues;
  readonly submitLabel: string;
  readonly error?: unknown;
  readonly isSubmitting: boolean;
  readonly onSubmit: (
    input: ManualGameCreateInput | ManualGameUpdateInput,
  ) => Promise<void> | void;
}) => {
  const isCreate = game === undefined;
  const requiresKickoff = isCreate || game.startTime !== null;
  const teamsQuery = useTeamsQuery();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<GameFormValues>({
    resolver: zodResolver(createFormSchema(requiresKickoff)),
    defaultValues: defaultsFromGame(game),
  });

  const submit = handleSubmit(async (values) => {
    const common: Omit<ManualGameInput, 'startTime'> = {
      season: values.season,
      seasonType: values.seasonType,
      week: values.week === '' ? null : Number(values.week),
      status: values.status,
      homeTeamId: values.homeTeamId,
      awayTeamId: values.awayTeamId,
      venueName: nullable(values.venueName),
      venueCity: nullable(values.venueCity),
      broadcastNetwork: nullable(values.broadcastNetwork),
      isNeutralSite: values.isNeutralSite,
    };
    if (isCreate) {
      await onSubmit({
        ...common,
        startTime: new Date(
          `${values.startLocal}:00${values.utcOffset}`,
        ).toISOString(),
        provenance: {
          sourceName: values.sourceName.trim(),
          sourceUrl: nullable(values.sourceUrl),
          externalReference: nullable(values.externalReference),
          notes: nullable(values.notes),
        },
      });
      return;
    }
    await onSubmit({
      ...common,
      ...(values.startLocal === ''
        ? {}
        : {
            startTime: new Date(
              `${values.startLocal}:00${values.utcOffset}`,
            ).toISOString(),
          }),
    });
  });

  return (
    <Paper
      component="form"
      noValidate
      onSubmit={(event) => void submit(event)}
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={3}>
        {error ? (
          <Alert severity="error">{getAdminErrorMessage(error)}</Alert>
        ) : null}
        <Typography variant="h5">Schedule fields</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Season"
            type="number"
            error={Boolean(errors.season)}
            helperText={errors.season?.message}
            {...register('season', { valueAsNumber: true })}
          />
          <Controller
            name="seasonType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="season-type-label">Season type</InputLabel>
                <Select
                  {...field}
                  labelId="season-type-label"
                  label="Season type"
                >
                  <MenuItem value="PRE">Preseason</MenuItem>
                  <MenuItem value="REG">Regular season</MenuItem>
                  <MenuItem value="POST">Postseason</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <TextField
            fullWidth
            label="Week"
            inputMode="numeric"
            error={Boolean(errors.week)}
            helperText={
              errors.week?.message ?? 'Optional for non-week schedules'
            }
            {...register('week')}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Kickoff local date and time"
            type="datetime-local"
            slotProps={{ inputLabel: { shrink: true } }}
            error={Boolean(errors.startLocal)}
            helperText={errors.startLocal?.message}
            required={requiresKickoff}
            {...register('startLocal')}
          />
          <Controller
            name="utcOffset"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.utcOffset)}>
                <InputLabel id="offset-label">Kickoff UTC offset</InputLabel>
                <Select
                  {...field}
                  labelId="offset-label"
                  label="Kickoff UTC offset"
                >
                  {offsets.map((offset) => (
                    <MenuItem key={offset} value={offset}>
                      UTC {offset}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.utcOffset?.message ??
                    (requiresKickoff
                      ? 'Required; no timezone is guessed.'
                      : 'Leave blank to preserve Time TBD.')}
                </FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select {...field} labelId="status-label" label="Status">
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="awayTeamId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.awayTeamId)}>
                <InputLabel id="away-team-label">Away team</InputLabel>
                <Select
                  {...field}
                  labelId="away-team-label"
                  label="Away team"
                  disabled={teamsQuery.isPending}
                >
                  {teamsQuery.data?.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.fullName} ({team.abbreviation})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.awayTeamId?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="homeTeamId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.homeTeamId)}>
                <InputLabel id="home-team-label">Home team</InputLabel>
                <Select
                  {...field}
                  labelId="home-team-label"
                  label="Home team"
                  disabled={teamsQuery.isPending}
                >
                  {teamsQuery.data?.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.fullName} ({team.abbreviation})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.homeTeamId?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Venue name"
            error={Boolean(errors.venueName)}
            helperText={errors.venueName?.message}
            {...register('venueName')}
          />
          <TextField
            fullWidth
            label="Venue city"
            error={Boolean(errors.venueCity)}
            helperText={errors.venueCity?.message}
            {...register('venueCity')}
          />
          <TextField
            fullWidth
            label="Broadcast network"
            error={Boolean(errors.broadcastNetwork)}
            helperText={errors.broadcastNetwork?.message}
            {...register('broadcastNetwork')}
          />
        </Stack>
        <Controller
          name="isNeutralSite"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(_, value) => field.onChange(value)}
                />
              }
              label="Neutral-site game"
            />
          )}
        />
        {isCreate ? (
          <>
            <Typography variant="h5">Provenance</Typography>
            <TextField
              required
              label="Source name"
              error={Boolean(errors.sourceName)}
              helperText={errors.sourceName?.message}
              {...register('sourceName', { required: true })}
            />
            <TextField
              label="Source URL"
              type="url"
              error={Boolean(errors.sourceUrl)}
              helperText={errors.sourceUrl?.message}
              {...register('sourceUrl')}
            />
            <TextField
              label="External reference"
              error={Boolean(errors.externalReference)}
              helperText={errors.externalReference?.message}
              {...register('externalReference')}
            />
            <TextField
              label="Notes"
              multiline
              minRows={3}
              error={Boolean(errors.notes)}
              helperText={errors.notes?.message}
              {...register('notes')}
            />
          </>
        ) : (
          <Alert severity="info">
            Editing base schedule fields clears verification. Provider-managed
            games must use an editorial override.
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || teamsQuery.isPending}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </Stack>
      <UnsavedChangesDialog dirty={isDirty && !isSubmitting} />
    </Paper>
  );
};
