import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, IconButton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { HomepageHeroSlide } from '@/features/homepage/components/HomepageHeroSlide';
import type { PublicHeroSlide } from '@/features/homepage/types';

const AUTOPLAY_MS = 7_000;

const usesReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const HomepageHeroCarousel = ({
  slides,
}: {
  readonly slides: readonly PublicHeroSlide[];
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    setActiveIndex(((index % slides.length) + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length <= 1 || paused || usesReducedMotion()) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [slides.length, paused]);

  const slide = slides[activeIndex];
  if (slide === undefined) return null;

  return (
    <Box
      component="section"
      aria-roledescription="carousel"
      aria-label="Featured stories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{ position: 'relative' }}
    >
      <Box aria-live="polite" aria-atomic="true">
        <HomepageHeroSlide slide={slide} />
      </Box>

      {slides.length > 1 ? (
        <>
          <IconButton
            aria-label="Previous slide"
            onClick={() => goTo(activeIndex - 1)}
            sx={{
              position: 'absolute',
              top: '50%',
              left: { xs: 4, sm: 12 },
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(5,9,20,0.55)',
              color: '#FFFFFF',
              '&:hover': { bgcolor: 'rgba(5,9,20,0.75)' },
            }}
          >
            <ChevronLeftRounded />
          </IconButton>
          <IconButton
            aria-label="Next slide"
            onClick={() => goTo(activeIndex + 1)}
            sx={{
              position: 'absolute',
              top: '50%',
              right: { xs: 4, sm: 12 },
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(5,9,20,0.55)',
              color: '#FFFFFF',
              '&:hover': { bgcolor: 'rgba(5,9,20,0.75)' },
            }}
          >
            <ChevronRightRounded />
          </IconButton>

          <Box
            role="tablist"
            aria-label="Choose a slide"
            sx={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
            }}
          >
            {slides.map((item, index) => (
              <Box
                key={item.id}
                component="button"
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Slide ${String(index + 1)} of ${String(slides.length)}`}
                onClick={() => goTo(index)}
                sx={{
                  width: index === activeIndex ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  bgcolor:
                    index === activeIndex
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.45)',
                  transition: 'width 150ms ease, background-color 150ms ease',
                }}
              />
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  );
};
