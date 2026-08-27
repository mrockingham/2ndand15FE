import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
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

import { GameHighlightThumbnail } from '@/features/games/components/GameHighlightThumbnail';
import type { HomepageHighlight } from '@/features/homepage/types';

const CARD_WIDTH = { xs: 220, sm: 260, md: 280 };
const VISIBLE_BEFORE_SCROLL = 4;

const HighlightCard = ({
  highlight,
}: {
  readonly highlight: HomepageHighlight;
}) => {
  const matchup = `${highlight.awayTeam.abbreviation} vs ${highlight.homeTeam.abbreviation}`;
  return (
    <Card
      sx={{
        height: '100%',
        flexShrink: 0,
        width: CARD_WIDTH,
        scrollSnapAlign: 'start',
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/games/${highlight.gameId}`}
        aria-label={`Open Game Center for ${highlight.awayTeam.fullName} at ${highlight.homeTeam.fullName}`}
        sx={{ height: '100%' }}
      >
        <GameHighlightThumbnail
          thumbnailUrl={highlight.thumbnailUrl}
          alt={highlight.title}
          awayTeam={highlight.awayTeam}
          homeTeam={highlight.homeTeam}
        />
        <Box sx={{ p: 1.5 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {matchup}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {highlight.mediaType === 'CURATED'
              ? 'Game Video'
              : 'Game Highlight'}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export const HomepageHighlightsSection = ({
  highlights,
}: {
  readonly highlights: readonly HomepageHighlight[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (highlights.length === 0) return null;

  const showArrows = highlights.length > VISIBLE_BEFORE_SCROLL;
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (container === null) return;
    const amount = container.clientWidth * 0.9;
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      component="section"
      aria-labelledby="highlights-heading"
      sx={{ position: 'relative' }}
    >
      <Typography
        id="highlights-heading"
        component="h2"
        variant="h3"
        sx={{ mb: 2 }}
      >
        Highlights
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
        }}
      >
        {highlights.map((highlight) => (
          <HighlightCard key={highlight.gameId} highlight={highlight} />
        ))}
      </Stack>
      {showArrows ? (
        <>
          <IconButton
            aria-label="Previous highlights"
            onClick={() => scroll('left')}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              position: 'absolute',
              top: '50%',
              left: -8,
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <ChevronLeftRounded />
          </IconButton>
          <IconButton
            aria-label="Next highlights"
            onClick={() => scroll('right')}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              position: 'absolute',
              top: '50%',
              right: -8,
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <ChevronRightRounded />
          </IconButton>
        </>
      ) : null}
    </Box>
  );
};
