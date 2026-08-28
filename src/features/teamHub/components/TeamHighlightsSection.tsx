import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import PlayCircleRounded from '@mui/icons-material/PlayCircleRounded';
import {
  Box,
  Card,
  CardActionArea,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { formatPublishedAgo } from '@/features/articles/presentation';
import type { TeamHomepageVideoItem } from '@/features/teamHub/types';

export const TeamHighlightsSection = ({
  highlights,
}: {
  readonly highlights: readonly TeamHomepageVideoItem[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (highlights.length === 0) return null;
  const scroll = (direction: 'left' | 'right') => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: (direction === 'left' ? -1 : 1) * element.clientWidth * 0.9,
      behavior: 'smooth',
    });
  };
  return (
    <Box
      component="section"
      aria-labelledby="team-highlights-heading"
      sx={{ position: 'relative', minWidth: 0 }}
    >
      <Typography
        id="team-highlights-heading"
        component="h2"
        variant="h3"
        sx={{ mb: 2 }}
      >
        Team Highlights
      </Typography>
      <Stack
        ref={scrollRef}
        direction="row"
        spacing={2}
        tabIndex={0}
        sx={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
          flexWrap: 'nowrap',
        }}
      >
        {highlights.map((highlight) => (
          <Card
            key={highlight.id}
            sx={{
              width: { xs: 220, sm: 260, md: 280 },
              flexShrink: 0,
              scrollSnapAlign: 'start',
            }}
          >
            <CardActionArea
              component={RouterLink}
              to={`/games/${highlight.gameId}`}
              aria-label={`Open Game Center video: ${highlight.title}`}
            >
              <Box
                sx={{
                  aspectRatio: '16 / 9',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                }}
              >
                {highlight.thumbnailUrl ? (
                  <Box
                    component="img"
                    src={highlight.thumbnailUrl}
                    alt=""
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
                <PlayCircleRounded
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    m: 'auto',
                    fontSize: 48,
                    color: '#fff',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.65))',
                  }}
                  aria-hidden="true"
                />
              </Box>
              <Stack spacing={0.5} sx={{ p: 1.5 }}>
                <Typography sx={{ fontWeight: 750 }} noWrap>
                  {highlight.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {highlight.publishedAt
                    ? formatPublishedAgo(highlight.publishedAt)
                    : 'Game highlight'}
                </Typography>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
      {highlights.length > 4 ? (
        <>
          <IconButton
            aria-label="Previous team highlights"
            onClick={() => scroll('left')}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              position: 'absolute',
              left: -8,
              top: '50%',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <ChevronLeftRounded />
          </IconButton>
          <IconButton
            aria-label="Next team highlights"
            onClick={() => scroll('right')}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              position: 'absolute',
              right: -8,
              top: '50%',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <ChevronRightRounded />
          </IconButton>
        </>
      ) : null}
    </Box>
  );
};
