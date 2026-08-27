import { Box, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { HeroRichText } from '@/features/homepage/components/HeroRichText';
import {
  heroImageFilter,
  heroImageObjectPosition,
  heroImageTransform,
  heroSlotAlign,
} from '@/features/homepage/presentation';
import type {
  HeroContentBlock,
  HeroContentSlot,
  HeroCta,
  PublicHeroSlide,
} from '@/features/homepage/types';

const isInternalHref = (href: string) => href.startsWith('/');

const CtaButton = ({ cta }: { readonly cta: HeroCta }) => {
  const buttonProps =
    cta.variant === 'PRIMARY'
      ? ({ variant: 'contained' } as const)
      : ({
          variant: 'outlined',
          sx: { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.55)' },
        } as const);
  return isInternalHref(cta.url) ? (
    <Button component={RouterLink} to={cta.url} {...buttonProps}>
      {cta.label}
    </Button>
  ) : (
    <Button
      component="a"
      href={cta.url}
      target="_blank"
      rel="noopener noreferrer"
      {...buttonProps}
    >
      {cta.label}
    </Button>
  );
};

/** Reading order top-left -> bottom-right, so the mobile stacked layout
 * (plain document order) matches the desktop 3x3 grid's visual order
 * without needing a second, duplicate DOM tree. */
const SLOT_ORDER: readonly HeroContentSlot[] = [
  'TOP_LEFT',
  'TOP_CENTER',
  'TOP_RIGHT',
  'MIDDLE_LEFT',
  'MIDDLE_CENTER',
  'MIDDLE_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_CENTER',
  'BOTTOM_RIGHT',
];

const gridPlacement: Readonly<
  Record<HeroContentSlot, { row: string; column: string }>
> = {
  TOP_LEFT: { row: '1', column: '1' },
  TOP_CENTER: { row: '1', column: '2' },
  TOP_RIGHT: { row: '1', column: '3' },
  MIDDLE_LEFT: { row: '2', column: '1' },
  MIDDLE_CENTER: { row: '2', column: '2' },
  MIDDLE_RIGHT: { row: '2', column: '3' },
  BOTTOM_LEFT: { row: '3', column: '1' },
  BOTTOM_CENTER: { row: '3', column: '2' },
  BOTTOM_RIGHT: { row: '3', column: '3' },
};

const verticalJustify: Readonly<
  Record<HeroContentSlot, 'flex-start' | 'center' | 'flex-end'>
> = {
  TOP_LEFT: 'flex-start',
  TOP_CENTER: 'flex-start',
  TOP_RIGHT: 'flex-start',
  MIDDLE_LEFT: 'center',
  MIDDLE_CENTER: 'center',
  MIDDLE_RIGHT: 'center',
  BOTTOM_LEFT: 'flex-end',
  BOTTOM_CENTER: 'flex-end',
  BOTTOM_RIGHT: 'flex-end',
};

const horizontalAlign: Readonly<
  Record<HeroContentSlot, 'flex-start' | 'center' | 'flex-end'>
> = {
  TOP_LEFT: 'flex-start',
  TOP_CENTER: 'center',
  TOP_RIGHT: 'flex-end',
  MIDDLE_LEFT: 'flex-start',
  MIDDLE_CENTER: 'center',
  MIDDLE_RIGHT: 'flex-end',
  BOTTOM_LEFT: 'flex-start',
  BOTTOM_CENTER: 'center',
  BOTTOM_RIGHT: 'flex-end',
};

export const HomepageHeroSlide = ({
  slide,
}: {
  readonly slide: PublicHeroSlide;
}) => {
  const bySlot = new Map(
    slide.contentBlocks.map((block) => [block.slot, block]),
  );
  const orderedBlocks = SLOT_ORDER.map((slot) => bySlot.get(slot)).filter(
    (block): block is HeroContentBlock => block !== undefined,
  );

  return (
    <Box
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        borderRadius: 1,
        bgcolor: '#050914',
        minHeight: { xs: 390, sm: 500, lg: 620 },
      }}
    >
      <Box
        component="img"
        src={slide.imageUrl}
        alt={slide.imageAlt ?? ''}
        width={2048}
        height={1152}
        loading="eager"
        fetchPriority="high"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -3,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: heroImageObjectPosition(slide),
          filter: heroImageFilter(slide),
          transform: heroImageTransform(slide),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          background: {
            xs: 'linear-gradient(180deg, rgba(5,9,20,0.05) 38%, rgba(5,9,20,0.96) 100%)',
            md: 'linear-gradient(90deg, rgba(5,9,20,0.74) 0%, rgba(5,9,20,0.04) 38%, rgba(5,9,20,0.06) 72%, rgba(5,9,20,0.76) 100%), linear-gradient(180deg, transparent 55%, rgba(5,9,20,0.9) 100%)',
          },
        }}
      />
      {slide.overlayOpacity > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            bgcolor: `rgba(0,0,0,${String(slide.overlayOpacity / 100)})`,
          }}
        />
      ) : null}

      <Stack
        sx={{
          position: 'relative',
          minHeight: 'inherit',
          p: { xs: 2.5, sm: 3.5, md: 4.5 },
          color: '#FFFFFF',
          gap: { xs: 1.5, md: 2 },
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gridTemplateRows: { md: 'repeat(3, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {orderedBlocks.map((block) => (
            <Box
              key={block.slot}
              sx={{
                gridColumn: { xs: '1', md: gridPlacement[block.slot].column },
                gridRow: { xs: 'auto', md: gridPlacement[block.slot].row },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: {
                  xs: 'flex-end',
                  md: verticalJustify[block.slot],
                },
                alignItems: {
                  xs: 'flex-start',
                  md: horizontalAlign[block.slot],
                },
                textAlign: { xs: 'left', md: heroSlotAlign[block.slot] },
                maxWidth: { md: 560 },
              }}
            >
              <HeroRichText document={block.content} />
            </Box>
          ))}
        </Box>
        {slide.ctas.length > 0 ? (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            sx={{
              alignSelf: { xs: 'stretch', md: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {slide.ctas.map((cta) => (
              <CtaButton key={cta.id} cta={cta} />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};
