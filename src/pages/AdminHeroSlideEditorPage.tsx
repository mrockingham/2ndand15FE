import AddRounded from '@mui/icons-material/AddRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  FormControlLabel,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { UnsavedChangesDialog } from '@/features/admin/components/UnsavedChangesDialog';
import { HeroRichTextEditor } from '@/features/homepage/components/HeroRichTextEditor';
import { HomepageHeroSlide } from '@/features/homepage/components/HomepageHeroSlide';
import { getHomepageErrorMessage } from '@/features/homepage/errors';
import {
  useAdminHeroSlideQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
} from '@/features/homepage/queries';
import {
  HERO_CONTENT_SLOTS,
  HERO_IMAGE_DEFAULTS,
  MAX_HERO_CTAS_PER_SLIDE,
} from '@/features/homepage/types';
import type {
  HeroContentBlockInput,
  HeroContentSlot,
  HeroCtaInput,
  HeroSlideFields,
  PublicHeroSlide,
} from '@/features/homepage/types';

const emptySlotDocument = (): HeroContentBlockInput['content'] => ({
  type: 'doc',
  children: [
    {
      type: 'paragraph',
      align: 'left',
      children: [{ type: 'text', text: '' }],
    },
  ],
});

const initialFields = (slide?: HeroSlideFields): HeroSlideFields => ({
  isActive: slide?.isActive ?? true,
  imageUrl: slide?.imageUrl ?? '',
  imageAlt: slide?.imageAlt ?? null,
  imageBrightness:
    slide?.imageBrightness ?? HERO_IMAGE_DEFAULTS.imageBrightness,
  imageContrast: slide?.imageContrast ?? HERO_IMAGE_DEFAULTS.imageContrast,
  imageSaturation:
    slide?.imageSaturation ?? HERO_IMAGE_DEFAULTS.imageSaturation,
  overlayOpacity: slide?.overlayOpacity ?? HERO_IMAGE_DEFAULTS.overlayOpacity,
  focalPointX: slide?.focalPointX ?? HERO_IMAGE_DEFAULTS.focalPointX,
  focalPointY: slide?.focalPointY ?? HERO_IMAGE_DEFAULTS.focalPointY,
  imageScale: slide?.imageScale ?? HERO_IMAGE_DEFAULTS.imageScale,
  contentBlocks: slide?.contentBlocks ?? [],
  ctas: slide?.ctas ?? [],
});

const slotLabel: Readonly<Record<HeroContentSlot, string>> = {
  TOP_LEFT: 'TL',
  TOP_CENTER: 'TC',
  TOP_RIGHT: 'TR',
  MIDDLE_LEFT: 'ML',
  MIDDLE_CENTER: 'MC',
  MIDDLE_RIGHT: 'MR',
  BOTTOM_LEFT: 'BL',
  BOTTOM_CENTER: 'BC',
  BOTTOM_RIGHT: 'BR',
};

const previewSlide = (fields: HeroSlideFields): PublicHeroSlide => ({
  id: 'preview',
  position: 0,
  imageUrl: fields.imageUrl,
  imageAlt: fields.imageAlt,
  imageBrightness: fields.imageBrightness,
  imageContrast: fields.imageContrast,
  imageSaturation: fields.imageSaturation,
  overlayOpacity: fields.overlayOpacity,
  focalPointX: fields.focalPointX,
  focalPointY: fields.focalPointY,
  imageScale: fields.imageScale,
  contentBlocks: fields.contentBlocks,
  ctas: fields.ctas.map((cta, index) => ({
    ...cta,
    id: `preview-${String(index)}`,
    position: index,
  })),
});

const ImageControlsCard = ({
  fields,
  onChange,
}: {
  readonly fields: HeroSlideFields;
  readonly onChange: (next: Partial<HeroSlideFields>) => void;
}) => (
  <Card sx={{ p: 2.5 }}>
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography component="h3" variant="h6">
          Image Adjustments
        </Typography>
        <Button
          size="small"
          startIcon={<RestartAltRounded />}
          onClick={() =>
            onChange({
              imageBrightness: HERO_IMAGE_DEFAULTS.imageBrightness,
              imageContrast: HERO_IMAGE_DEFAULTS.imageContrast,
              imageSaturation: HERO_IMAGE_DEFAULTS.imageSaturation,
              overlayOpacity: HERO_IMAGE_DEFAULTS.overlayOpacity,
              focalPointX: HERO_IMAGE_DEFAULTS.focalPointX,
              focalPointY: HERO_IMAGE_DEFAULTS.focalPointY,
              imageScale: HERO_IMAGE_DEFAULTS.imageScale,
            })
          }
        >
          Reset Image Adjustments
        </Button>
      </Stack>
      {(
        [
          ['imageBrightness', 'Brightness', 25, 150],
          ['imageContrast', 'Contrast', 50, 150],
          ['imageSaturation', 'Saturation', 0, 200],
          ['overlayOpacity', 'Dark Overlay', 0, 100],
          ['focalPointX', 'Horizontal Focal Point', 0, 100],
          ['focalPointY', 'Vertical Focal Point', 0, 100],
          ['imageScale', 'Zoom', 100, 200],
        ] as const
      ).map(([field, label, min, max]) => (
        <Box key={field}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}: {fields[field]}
          </Typography>
          <Slider
            aria-label={label}
            value={fields[field]}
            min={min}
            max={max}
            onChange={(_, value) => onChange({ [field]: value as number })}
          />
        </Box>
      ))}
    </Stack>
  </Card>
);

const SlotEditorCard = ({
  fields,
  onChange,
}: {
  readonly fields: HeroSlideFields;
  readonly onChange: (next: Partial<HeroSlideFields>) => void;
}) => {
  const [activeSlot, setActiveSlot] = useState<HeroContentSlot | null>(null);
  const bySlot = new Map(
    fields.contentBlocks.map((block) => [block.slot, block]),
  );
  const activeBlock = activeSlot === null ? undefined : bySlot.get(activeSlot);

  const setSlotContent = (
    slot: HeroContentSlot,
    content: HeroContentBlockInput['content'] | null,
  ) => {
    const withoutSlot = fields.contentBlocks.filter(
      (block) => block.slot !== slot,
    );
    onChange({
      contentBlocks:
        content === null ? withoutSlot : [...withoutSlot, { slot, content }],
    });
  };

  return (
    <Card sx={{ p: 2.5 }}>
      <Typography component="h3" variant="h6" sx={{ mb: 1.5 }}>
        Text Positions
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          maxWidth: 260,
          mb: 2,
        }}
      >
        {HERO_CONTENT_SLOTS.map((slot) => {
          const occupied = bySlot.has(slot);
          return (
            <Button
              key={slot}
              variant={
                activeSlot === slot
                  ? 'contained'
                  : occupied
                    ? 'outlined'
                    : 'text'
              }
              color={occupied ? 'primary' : 'inherit'}
              onClick={() => setActiveSlot(slot)}
              sx={{ minWidth: 0, aspectRatio: '1 / 1' }}
            >
              {slotLabel[slot]}
            </Button>
          );
        })}
      </Box>

      {activeSlot === null ? (
        <Typography color="text.secondary" variant="body2">
          Select a position above to add or edit its text.
        </Typography>
      ) : activeBlock === undefined ? (
        <Button
          startIcon={<AddRounded />}
          variant="outlined"
          onClick={() => setSlotContent(activeSlot, emptySlotDocument())}
        >
          Add text to {slotLabel[activeSlot]}
        </Button>
      ) : (
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="subtitle2">
              Editing {slotLabel[activeSlot]}
            </Typography>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteRounded />}
              onClick={() => setSlotContent(activeSlot, null)}
            >
              Remove
            </Button>
          </Stack>
          <HeroRichTextEditor
            document={activeBlock.content}
            onChange={(next) => setSlotContent(activeSlot, next)}
          />
        </Stack>
      )}
    </Card>
  );
};

const CtaEditorCard = ({
  fields,
  onChange,
}: {
  readonly fields: HeroSlideFields;
  readonly onChange: (next: Partial<HeroSlideFields>) => void;
}) => {
  const setCta = (index: number, cta: HeroCtaInput) =>
    onChange({
      ctas: fields.ctas.map((item, itemIndex) =>
        itemIndex === index ? cta : item,
      ),
    });
  const removeCta = (index: number) =>
    onChange({
      ctas: fields.ctas.filter((_, itemIndex) => itemIndex !== index),
    });

  return (
    <Card sx={{ p: 2.5 }}>
      <Typography component="h3" variant="h6" sx={{ mb: 1.5 }}>
        Buttons
      </Typography>
      <Stack spacing={2}>
        {fields.ctas.map((cta, index) => (
          <Stack
            key={index}
            spacing={1}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <TextField
              size="small"
              label="Label"
              value={cta.label}
              onChange={(event) =>
                setCta(index, { ...cta, label: event.target.value })
              }
            />
            <TextField
              size="small"
              label="URL / Path"
              placeholder="/news/slug or https://…"
              value={cta.url}
              onChange={(event) =>
                setCta(index, { ...cta, url: event.target.value })
              }
            />
            <TextField
              size="small"
              select
              label="Variant"
              value={cta.variant}
              onChange={(event) =>
                setCta(index, {
                  ...cta,
                  variant: event.target.value as HeroCtaInput['variant'],
                })
              }
            >
              <MenuItem value="PRIMARY">Primary</MenuItem>
              <MenuItem value="SECONDARY">Secondary</MenuItem>
            </TextField>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteRounded />}
              onClick={() => removeCta(index)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Remove button
            </Button>
          </Stack>
        ))}
        {fields.ctas.length < MAX_HERO_CTAS_PER_SLIDE ? (
          <Button
            startIcon={<AddRounded />}
            variant="outlined"
            onClick={() =>
              onChange({
                ctas: [
                  ...fields.ctas,
                  { label: '', url: '', variant: 'PRIMARY' },
                ],
              })
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add button
          </Button>
        ) : null}
      </Stack>
    </Card>
  );
};

const HeroSlideEditor = ({
  isCreate,
  slideId,
  initialData,
}: {
  readonly isCreate: boolean;
  readonly slideId: string | undefined;
  readonly initialData: HeroSlideFields | undefined;
}) => {
  const navigate = useNavigate();
  const createMutation = useCreateHeroSlideMutation();
  const updateMutation = useUpdateHeroSlideMutation(slideId ?? '');

  const [fields, setFields] = useState<HeroSlideFields>(() =>
    initialFields(initialData),
  );
  const [dirty, setDirty] = useState(false);

  const update = (next: Partial<HeroSlideFields>) => {
    setFields((previous) => ({ ...previous, ...next }));
    setDirty(true);
  };

  const mutation = isCreate ? createMutation : updateMutation;
  const canSubmit = fields.imageUrl.trim() !== '';

  const submit = async () => {
    const input = {
      ...fields,
      imageAlt: fields.imageAlt?.trim() === '' ? null : fields.imageAlt,
    };
    const saved = isCreate
      ? await createMutation.mutateAsync(input)
      : await updateMutation.mutateAsync(input);
    setDirty(false);
    if (isCreate)
      navigate(`/admin/homepage/hero/${saved.id}`, { replace: true });
  };

  return (
    <>
      <AdminPageHeader
        title={isCreate ? 'Add Hero Slide' : 'Edit Hero Slide'}
        description="Changes save to this slide only when you select Save."
        action={
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/homepage')}
          >
            Back to Homepage
          </Button>
        }
      />
      {mutation.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getHomepageErrorMessage(mutation.error)}
        </Alert>
      ) : null}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          },
        }}
      >
        <Stack spacing={2}>
          <Typography component="h2" variant="overline" color="text.secondary">
            Live Preview
          </Typography>
          {fields.imageUrl.trim() === '' ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Paste an image URL to see a preview.
              </Typography>
            </Card>
          ) : (
            <HomepageHeroSlide slide={previewSlide(fields)} />
          )}
        </Stack>

        <Stack spacing={2.5}>
          <Card sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Typography component="h3" variant="h6">
                Image
              </Typography>
              <TextField
                required
                label="Image URL"
                placeholder="https://…"
                helperText="Paste an HTTPS image URL. There is no image upload yet."
                value={fields.imageUrl}
                onChange={(event) => update({ imageUrl: event.target.value })}
              />
              <TextField
                label="Image alt text"
                value={fields.imageAlt ?? ''}
                onChange={(event) => update({ imageAlt: event.target.value })}
                helperText="Leave blank if the image is purely decorative."
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={fields.isActive}
                    onChange={(event) =>
                      update({ isActive: event.target.checked })
                    }
                  />
                }
                label={
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <span>Active</span>
                    <Chip
                      size="small"
                      color={fields.isActive ? 'success' : 'default'}
                      label={fields.isActive ? 'Visible on Home' : 'Hidden'}
                    />
                  </Stack>
                }
              />
            </Stack>
          </Card>

          <SlotEditorCard fields={fields} onChange={update} />
          <CtaEditorCard fields={fields} onChange={update} />
          <ImageControlsCard fields={fields} onChange={update} />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              disabled={!canSubmit || mutation.isPending}
              onClick={() => void submit()}
            >
              {mutation.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              onClick={() => navigate('/admin/homepage')}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
      <UnsavedChangesDialog dirty={dirty && !mutation.isPending} />
    </>
  );
};

export const AdminHeroSlideEditorPage = () => {
  const slideId = useParams().slideId;
  const isCreate = slideId === undefined;
  const existingQuery = useAdminHeroSlideQuery(slideId ?? '');

  if (!isCreate) {
    if (existingQuery.isPending)
      return <AdminLoading label="Loading Hero slide" />;
    if (existingQuery.isError || !existingQuery.data)
      return (
        <AdminError
          error={existingQuery.error}
          onRetry={() => void existingQuery.refetch()}
        />
      );
  }

  return (
    <HeroSlideEditor
      key={slideId ?? 'new'}
      isCreate={isCreate}
      slideId={slideId}
      initialData={existingQuery.data}
    />
  );
};
